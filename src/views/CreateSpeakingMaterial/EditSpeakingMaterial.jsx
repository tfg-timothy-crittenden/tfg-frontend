import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	getPresignedUrl,
	getMaterialNodeAssets,
	getSpeakingSectionByMaterialId,
	getToeflSpeakingMaterialQuestion,
	updateSpeakingSection,
} from "@/api/material/materialAPI";
import CreateSpeakingMaterialPresentation from "./CreateSpeakingMaterialPresentation";
import {
	buildPatchSpeakingSectionFormData,
	extractSectionMediaRefs,
	normalizeSectionToFormState,
} from "./speakingSectionFormUtils";

const QUESTION_COUNT = 7;
const PART2_QUESTION_COUNT = 4;

const getPart1Questions = (section) =>
	section?.questions ||
	section?.part1Questions ||
	section?.part1?.questions ||
	[];

const toMediaRefFromAsset = (asset) => {
	if (!asset) return null;
	const objectKey =
		asset.objectKey ||
		asset.storageKey ||
		asset.key ||
		asset.object_key ||
		asset.storage_key ||
		null;
	const url =
		asset.signedUrl || asset.url || asset.assetUrl || asset.previewUrl || null;
	if (!url && !objectKey) return null;
	return {
		url,
		objectKey,
		bucket: asset.bucket || null,
	};
};

const pickAudioAsset = (assets = []) =>
	assets.find((asset) => asset?.type === "AUDIO" || asset?.kind === "AUDIO") ||
	assets[0] ||
	null;

const findPartNodeId = (section) => {
	const part1Questions = getPart1Questions(section);
	const questionWithParent = part1Questions.find(
		(question) => question?.parentNodeId || question?.parentId,
	);

	return (
		section?.part1?.id ||
		section?.part1Id ||
		section?.partNodeId ||
		section?.part1?.nodeId ||
		questionWithParent?.parentNodeId ||
		questionWithParent?.parentId ||
		null
	);
};

const looksLikeProtectedUrl = (url) => {
	if (!url) return false;
	const normalized = String(url).toLowerCase();
	return (
		normalized.includes("/storage/") ||
		normalized.includes("/protected/") ||
		normalized.includes("/material-nodes/") ||
		normalized.includes("objectkey=")
	);
};

const extractObjectKeyFromUrl = (url) => {
	if (!url) return null;

	try {
		const parsed = new URL(url, window.location.origin);
		const queryObjectKey =
			parsed.searchParams.get("objectKey") ||
			parsed.searchParams.get("object_key") ||
			parsed.searchParams.get("key");
		if (queryObjectKey) {
			return decodeURIComponent(queryObjectKey);
		}

		const path = decodeURIComponent(parsed.pathname || "");
		const storagePrefix = path.match(/\/(?:storage|protected)\/(.+)$/i);
		if (storagePrefix?.[1]) {
			return storagePrefix[1].replace(/^\/+/, "");
		}

		if (path.startsWith("/")) {
			return path.slice(1);
		}

		return path || null;
	} catch {
		return null;
	}
};

const resolveMediaRefToUrl = async (mediaRef) => {
	if (!mediaRef) return null;

	const directUrl = mediaRef.url || null;
	const objectKey =
		mediaRef.objectKey ||
		(looksLikeProtectedUrl(directUrl)
			? extractObjectKeyFromUrl(directUrl)
			: null);
	if (!objectKey) {
		return directUrl;
	}

	try {
		const signedUrlResponse = await getPresignedUrl({
			bucket: mediaRef.bucket || "toefl",
			objectKey,
			expirationSeconds: 3600,
		});

		if (typeof signedUrlResponse === "string") {
			return signedUrlResponse;
		}

		return (
			signedUrlResponse?.signedUrl ||
			signedUrlResponse?.url ||
			signedUrlResponse?.presignedUrl ||
			directUrl ||
			null
		);
	} catch {
		return directUrl;
	}
};

const resolvePartImageFromPartNode = async (partNodeId) => {
	if (!partNodeId) return null;

	const partAssetsData = await getMaterialNodeAssets(partNodeId);
	const partAssets = Array.isArray(partAssetsData)
		? partAssetsData
		: partAssetsData?.assets || [];
	const imageAsset =
		partAssets.find(
			(asset) => asset?.type === "IMAGE" || asset?.kind === "IMAGE",
		) || partAssets[0];

	return resolveMediaRefToUrl(toMediaRefFromAsset(imageAsset));
};

const resolvePartImageFromQuestionEndpoint = async (materialId) => {
	if (!materialId) return null;

	const firstQuestion = await getToeflSpeakingMaterialQuestion(
		materialId,
		1,
		1,
	);
	const partNodeId =
		firstQuestion?.parentNodeId || firstQuestion?.parentId || null;
	if (!partNodeId) return null;

	return resolvePartImageFromPartNode(partNodeId);
};

const resolveQuestionAudioFromQuestionEndpoint = async ({
	materialId,
	partNumber,
	questionNumber,
}) => {
	if (!materialId || !partNumber || !questionNumber) return null;

	const questionNode = await getToeflSpeakingMaterialQuestion(
		materialId,
		partNumber,
		questionNumber,
	);

	const questionAssets =
		questionNode?.assets || questionNode?.materialAssets || [];
	const audioAsset = pickAudioAsset(questionAssets);

	return resolveMediaRefToUrl(toMediaRefFromAsset(audioAsset));
};

const EditSpeakingMaterial = () => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [initialValues, setInitialValues] = useState(null);
	const [initialHighlightDataByQuestion, setInitialHighlightDataByQuestion] =
		useState(Array(QUESTION_COUNT).fill(null));
	const [initialPart2ConfigByQuestion, setInitialPart2ConfigByQuestion] =
		useState(Array(PART2_QUESTION_COUNT).fill({}));
	const [existingMedia, setExistingMedia] = useState(null);

	useEffect(() => {
		if (!id) {
			setIsLoading(false);
			return;
		}

		let isCancelled = false;
		const loadSection = async () => {
			setIsLoading(true);
			try {
				const section = await getSpeakingSectionByMaterialId(id);
				if (isCancelled) return;

				const normalized = normalizeSectionToFormState(
					section,
					QUESTION_COUNT,
					PART2_QUESTION_COUNT,
				);

				setInitialValues(normalized.values);
				setInitialHighlightDataByQuestion(normalized.highlightDataByQuestion);
				setInitialPart2ConfigByQuestion(normalized.part2ConfigByQuestion);

				const mediaRefs = extractSectionMediaRefs(
					section,
					QUESTION_COUNT,
					PART2_QUESTION_COUNT,
				);

				const [partImageUrl, questionAudioUrls, part2QuestionAudioUrls] =
					await Promise.all([
						resolveMediaRefToUrl(mediaRefs.partImage),
						Promise.all(
							mediaRefs.questionAudio.map((mediaRef) =>
								resolveMediaRefToUrl(mediaRef),
							),
						),
						Promise.all(
							mediaRefs.part2QuestionAudio.map((mediaRef) =>
								resolveMediaRefToUrl(mediaRef),
							),
						),
					]);

				if (isCancelled) return;

				const resolvedQuestionAudioUrls = await Promise.all(
					questionAudioUrls.map(async (audioUrl, idx) => {
						if (audioUrl) return audioUrl;
						try {
							return await resolveQuestionAudioFromQuestionEndpoint({
								materialId: id,
								partNumber: 1,
								questionNumber: idx + 1,
							});
						} catch {
							return null;
						}
					}),
				);

				if (isCancelled) return;

				const resolvedPart2QuestionAudioUrls = await Promise.all(
					part2QuestionAudioUrls.map(async (audioUrl, idx) => {
						if (audioUrl) return audioUrl;
						try {
							return await resolveQuestionAudioFromQuestionEndpoint({
								materialId: id,
								partNumber: 2,
								questionNumber: idx + 1,
							});
						} catch {
							return null;
						}
					}),
				);

				if (isCancelled) return;

				let resolvedPartImageUrl = partImageUrl;
				if (!resolvedPartImageUrl) {
					const partNodeId = findPartNodeId(section);
					if (partNodeId) {
						try {
							resolvedPartImageUrl =
								await resolvePartImageFromPartNode(partNodeId);
							if (isCancelled) return;
						} catch {
							// Keep null when fallback asset lookup fails.
						}
					}

					if (!resolvedPartImageUrl) {
						try {
							resolvedPartImageUrl =
								await resolvePartImageFromQuestionEndpoint(id);
							if (isCancelled) return;
						} catch {
							// Keep null when question endpoint fallback fails.
						}
					}
				}

				setExistingMedia({
					partImageUrl: resolvedPartImageUrl,
					questionAudioUrls: resolvedQuestionAudioUrls,
					part2QuestionAudioUrls: resolvedPart2QuestionAudioUrls,
				});
			} catch (error) {
				if (!isCancelled) {
					alert(
						"Failed to load existing section: " +
							(error?.response?.data?.message || error.message),
					);
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		loadSection();
		return () => {
			isCancelled = true;
		};
	}, [id]);

	const handleSubmitForm = async ({
		data,
		highlightDataByQuestion,
		part2ConfigByQuestion,
	}) => {
		if (!id) {
			throw new Error("Missing material id for update.");
		}

		const patchFormData = buildPatchSpeakingSectionFormData({
			initialValues,
			initialHighlightDataByQuestion,
			initialPart2ConfigByQuestion,
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
		});

		if (!patchFormData) {
			throw new Error("No changes detected.");
		}

		await updateSpeakingSection(id, patchFormData);
	};

	return (
		<CreateSpeakingMaterialPresentation
			mode="edit"
			isLoading={isLoading}
			initialValues={initialValues}
			initialHighlightDataByQuestion={initialHighlightDataByQuestion}
			initialPart2ConfigByQuestion={initialPart2ConfigByQuestion}
			existingMedia={existingMedia}
			onSubmitForm={handleSubmitForm}
			submitLabel="Save Changes"
		/>
	);
};

export default EditSpeakingMaterial;
