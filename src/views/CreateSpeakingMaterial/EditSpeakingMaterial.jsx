import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	getPresignedUrl,
	getSpeakingSectionByMaterialId,
	updateSpeakingSection,
	publishSpeakingMaterial,
} from "@/api/material/materialAPI";
import CreateSpeakingMaterialPresentation from "./components/CreateSpeakingMaterialPresentation/CreateSpeakingMaterialPresentation";
import {
	buildPatchSpeakingSectionFormData,
	normalizeSectionToFormState,
} from "./utils/speakingSectionFormUtils";

const QUESTION_COUNT = 7;
const PART2_QUESTION_COUNT = 4;

const resolveStorageKeyToUrl = async (storageKey) => {
	if (!storageKey) return null;

	try {
		return await getPresignedUrl({
			bucket: "toefl",
			objectKey: storageKey,
			expirationSeconds: 3600,
		});
	} catch {
		return null;
	}
};

const EditSpeakingMaterial = () => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [initialValues, setInitialValues] = useState(null);
	const [sectionStatus, setSectionStatus] = useState(null);
	const [initialHighlightDataByQuestion, setInitialHighlightDataByQuestion] =
		useState(Array(QUESTION_COUNT).fill(null));
	const [initialPart2ConfigByQuestion, setInitialPart2ConfigByQuestion] =
		useState(Array(PART2_QUESTION_COUNT).fill({}));
	const [existingMedia, setExistingMedia] = useState(null);

	const loadSection = useCallback(
		async (cancelRef) => {
			if (!id) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const section = await getSpeakingSectionByMaterialId(id);
				if (cancelRef?.current) return;
				setSectionStatus(section?.status ? String(section.status) : null);

				const normalized = normalizeSectionToFormState(
					section,
					QUESTION_COUNT,
					PART2_QUESTION_COUNT,
				);

				setInitialValues(normalized.values);
				setInitialHighlightDataByQuestion(normalized.highlightDataByQuestion);
				setInitialPart2ConfigByQuestion(normalized.part2ConfigByQuestion);
				const [partImageUrl, questionAudioUrls, part2QuestionAudioUrls] =
					await Promise.all([
						resolveStorageKeyToUrl(section.partImageStorageKey),
						Promise.all(
							(section.questions || []).map((question) =>
								resolveStorageKeyToUrl(question.audioStorageKey),
							),
						),
						Promise.all(
							(section.part2Questions || []).map((question) =>
								resolveStorageKeyToUrl(question.audioStorageKey),
							),
						),
					]);

				if (cancelRef?.current) return;

				setExistingMedia({
					partImageUrl,
					questionAudioUrls,
					part2QuestionAudioUrls,
				});
			} catch (error) {
				if (!cancelRef?.current) {
					alert(
						"Failed to load existing section: " +
							(error?.response?.data?.message || error.message),
					);
				}
			} finally {
				if (!cancelRef?.current) {
					setIsLoading(false);
				}
			}
		},
		[id],
	);

	useEffect(() => {
		const cancelRef = { current: false };
		loadSection(cancelRef);
		return () => {
			cancelRef.current = true;
		};
	}, [loadSection]);

	const persistSectionChanges = useCallback(
		async ({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
			allowNoChanges = false,
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
				if (allowNoChanges) return;
				throw new Error("No changes detected.");
			}

			await updateSpeakingSection(id, patchFormData);
		},
		[
			id,
			initialValues,
			initialHighlightDataByQuestion,
			initialPart2ConfigByQuestion,
		],
	);

	const handleSubmitForm = async ({
		data,
		highlightDataByQuestion,
		part2ConfigByQuestion,
	}) => {
		await persistSectionChanges({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
			allowNoChanges: false,
		});
	};

	const handleDraftSaveForm = async ({
		data,
		highlightDataByQuestion,
		part2ConfigByQuestion,
	}) => {
		await persistSectionChanges({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
			allowNoChanges: false,
		});
	};

	const handlePublish = useCallback(
		async (payload) => {
			if (!id) return;
			if (payload) {
				await persistSectionChanges({
					...payload,
					allowNoChanges: true,
				});
			}
			await publishSpeakingMaterial(id);
		},
		[id, persistSectionChanges],
	);

	const canSaveDraft =
		String(sectionStatus || "")
			.trim()
			.toUpperCase() !== "PUBLISHED";

	return (
		<CreateSpeakingMaterialPresentation
			mode="edit"
			sectionStatus={sectionStatus}
			isLoading={isLoading}
			initialValues={initialValues}
			initialHighlightDataByQuestion={initialHighlightDataByQuestion}
			initialPart2ConfigByQuestion={initialPart2ConfigByQuestion}
			existingMedia={existingMedia}
			onSubmitForm={handleSubmitForm}
			onDraftSaveForm={canSaveDraft ? handleDraftSaveForm : undefined}
			submitLabel="Save Changes"
			onPublish={handlePublish}
			onReloadFromDb={loadSection}
		/>
	);
};

export default EditSpeakingMaterial;
