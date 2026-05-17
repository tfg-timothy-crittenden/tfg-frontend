import { useCallback, useEffect, useState } from "react";
import {
	getPresignedUrl,
	getSpeakingSectionByMaterialId,
	uploadSpeakingSectionDraft,
	updateSpeakingSection,
	publishSpeakingMaterial,
} from "@/api/material/materialAPI";
import {
	buildCreateSpeakingSectionDraftFormData,
	buildCreateSpeakingSectionFormData,
	buildPatchSpeakingSectionFormData,
	normalizeSectionToFormState,
} from "@/views/CreateSpeakingMaterial/utils/speakingSectionFormUtils";
import { buildRoute } from "@/routes/routeConfig";

const QUESTION_COUNT = 7;
const PART2_QUESTION_COUNT = 4;

const getErrorMessage = (error) =>
	error?.response?.data?.message || error?.message || "";

const isMissingQuestionNodeError = (error) => {
	const message = String(getErrorMessage(error)).toLowerCase();
	return (
		message.includes("question at index") &&
		message.includes("not found under part node")
	);
};

const extractMaterialId = (payload) => {
	const value =
		payload?.materialId ??
		payload?.material_id ??
		payload?.id ??
		payload?.material?.materialId ??
		payload?.material?.id ??
		payload?.section?.materialId ??
		payload?.section?.material_id ??
		payload?.section?.id ??
		payload?.data?.materialId ??
		payload?.data?.material_id ??
		payload?.data?.id ??
		null;

	if (value === null || value === undefined) return null;
	return String(value);
};

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

const buildCreateModeInitialValues = () => ({
	materialTitle: "",
	materialDescription: "",
	materialId: "",
	partTitle: "",
	part2Title: "",
	questions: Array.from({ length: QUESTION_COUNT }, () => ({
		transcriptText: "",
		audio: [],
	})),
	part2Questions: Array.from({ length: PART2_QUESTION_COUNT }, () => ({
		transcriptText: "",
		audio: [],
	})),
});

const useSpeakingMaterialContainer = (
	mode = "create",
	materialId = null,
	onNavigate,
) => {
	const [isLoading, setIsLoading] = useState(mode === "edit" && !!materialId);
	const [initialValues, setInitialValues] = useState(
		mode === "create" ? buildCreateModeInitialValues() : null,
	);
	const [sectionStatus, setSectionStatus] = useState(null);
	const [initialHighlightDataByQuestion, setInitialHighlightDataByQuestion] =
		useState(Array(QUESTION_COUNT).fill(null));
	const [initialPart2ConfigByQuestion, setInitialPart2ConfigByQuestion] =
		useState(Array(PART2_QUESTION_COUNT).fill({}));
	const [existingMedia, setExistingMedia] = useState(null);

	// Remove audio for a specific question index (Part 1)
	const handleRemoveExistingAudio = useCallback((idx) => {
		setExistingMedia((prev) => {
			if (!prev) return prev;
			const next = { ...prev };
			if (Array.isArray(next.questionAudioUrls)) {
				next.questionAudioUrls = [...next.questionAudioUrls];
				next.questionAudioUrls[idx] = null;
			}
			return next;
		});
	}, []);

	// ============================================================================
	// Edit mode: Load section data
	// ============================================================================
	const loadSection = useCallback(
		async (cancelRef) => {
			if (mode !== "edit" || !materialId) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const section = await getSpeakingSectionByMaterialId(materialId);
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
					alert("Failed to load existing section: " + getErrorMessage(error));
				}
			} finally {
				if (!cancelRef?.current) {
					setIsLoading(false);
				}
			}
		},
		[mode, materialId],
	);

	useEffect(() => {
		const cancelRef = { current: false };
		loadSection(cancelRef);
		return () => {
			cancelRef.current = true;
		};
	}, [loadSection]);

	// ============================================================================
	// Edit mode: Persist changes
	// ============================================================================
	const persistSectionChanges = useCallback(
		async ({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
			allowNoChanges = false,
		}) => {
			if (mode !== "edit" || !materialId) {
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

			await updateSpeakingSection(materialId, patchFormData);
		},
		[
			mode,
			materialId,
			initialValues,
			initialHighlightDataByQuestion,
			initialPart2ConfigByQuestion,
		],
	);

	// ============================================================================
	// Submit handlers
	// ============================================================================

	const handleSubmitForm = useCallback(
		async ({ data, highlightDataByQuestion, part2ConfigByQuestion }) => {
			if (mode === "edit") {
				await persistSectionChanges({
					data,
					highlightDataByQuestion,
					part2ConfigByQuestion,
					allowNoChanges: false,
				});
				// Refetch from backend to rebase form state
				try {
					const section = await getSpeakingSectionByMaterialId(materialId);
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
					setExistingMedia({
						partImageUrl,
						questionAudioUrls,
						part2QuestionAudioUrls,
					});
				} catch (_error) {
					// Optionally handle reload error
				}
				return;
			}

			// Create mode
			const formData = buildCreateSpeakingSectionFormData({
				data,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});

			const matId = data?.materialId?.trim();
			let saveResponse;

			if (matId) {
				try {
					saveResponse = await updateSpeakingSection(matId, formData);
				} catch (_error) {
					if (!isMissingQuestionNodeError(_error)) {
						throw _error;
					}
					saveResponse = await uploadSpeakingSectionDraft(formData);
				}
			} else {
				saveResponse = await uploadSpeakingSectionDraft(formData);
			}

			const resolvedMaterialId = extractMaterialId(saveResponse) || matId;
			if (!resolvedMaterialId) {
				throw new Error("Material ID was not returned after save.");
			}

			await publishSpeakingMaterial(resolvedMaterialId);
		},
		[mode, persistSectionChanges, materialId],
	);

	const handleDraftSaveForm = useCallback(
		async ({ data, highlightDataByQuestion, part2ConfigByQuestion }) => {
			if (mode === "edit") {
				await persistSectionChanges({
					data,
					highlightDataByQuestion,
					part2ConfigByQuestion,
					allowNoChanges: false,
				});
				// Refetch from backend to rebase form state
				try {
					const section = await getSpeakingSectionByMaterialId(materialId);
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
					setExistingMedia({
						partImageUrl,
						questionAudioUrls,
						part2QuestionAudioUrls,
					});
				} catch (_error) {
					// Optionally handle reload error
				}
				return;
			}

			// Create mode
			const formData = buildCreateSpeakingSectionDraftFormData({
				data,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});

			const matId = data?.materialId?.trim();
			let saveResponse;

			if (matId) {
				try {
					saveResponse = await updateSpeakingSection(matId, formData);
				} catch (error) {
					if (!isMissingQuestionNodeError(error)) {
						throw error;
					}
					saveResponse = await uploadSpeakingSectionDraft(formData);
				}
			} else {
				saveResponse = await uploadSpeakingSectionDraft(formData);
			}

			const resolvedMaterialId = extractMaterialId(saveResponse) || matId;

			// In create mode, navigate to edit view after first save
			if (!matId && resolvedMaterialId && onNavigate) {
				onNavigate(buildRoute.editSpeakingMaterial(resolvedMaterialId));
			}

			return saveResponse;
		},
		[mode, onNavigate, persistSectionChanges, materialId],
	);

	const handlePublish = useCallback(
		async (payload) => {
			if (mode !== "edit" || !materialId) return;

			if (payload) {
				await persistSectionChanges({
					...payload,
					allowNoChanges: true,
				});
			}

			await publishSpeakingMaterial(materialId);
		},
		[mode, materialId, persistSectionChanges],
	);

	// ============================================================================
	// Configuration object for presentation
	// ============================================================================
	const canSaveDraft =
		mode === "create" ||
		String(sectionStatus || "")
			.trim()
			.toUpperCase() !== "PUBLISHED";

	// Dedicated publish handler for create mode
	const handleCreateAndPublish = useCallback(
		async ({ data, highlightDataByQuestion, part2ConfigByQuestion }) => {
			// 1. Save draft (upload all files)
			const formData = buildCreateSpeakingSectionFormData({
				data,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});
			const matId = data?.materialId?.trim();
			let saveResponse;
			if (matId) {
				try {
					saveResponse = await updateSpeakingSection(matId, formData);
				} catch (error) {
					if (!isMissingQuestionNodeError(error)) {
						throw error;
					}
					saveResponse = await uploadSpeakingSectionDraft(formData);
				}
			} else {
				saveResponse = await uploadSpeakingSectionDraft(formData);
			}
			const resolvedMaterialId = extractMaterialId(saveResponse) || matId;
			if (!resolvedMaterialId) {
				throw new Error("Material ID was not returned after save.");
			}
			// 2. Publish
			await publishSpeakingMaterial(resolvedMaterialId);
			// 3. Reload section from backend to update state/UI
			try {
				const section =
					await getSpeakingSectionByMaterialId(resolvedMaterialId);
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
				setExistingMedia({
					partImageUrl,
					questionAudioUrls,
					part2QuestionAudioUrls,
				});
			} catch (_error) {
				// Optionally handle reload error
			}
		},
		[],
	);

	return {
		mode,
		isLoading,
		sectionStatus,
		initialValues,
		initialHighlightDataByQuestion,
		initialPart2ConfigByQuestion,
		existingMedia,
		handleRemoveExistingAudio, // <-- expose handler
		onSubmitForm: handleSubmitForm,
		onDraftSaveForm: canSaveDraft ? handleDraftSaveForm : undefined,
		onPublish: mode === "edit" ? handlePublish : handleCreateAndPublish,
		onReloadFromDb: mode === "edit" ? loadSection : undefined,
		submitLabel: mode === "edit" ? "Save Changes" : "Submit",
	};
};

export default useSpeakingMaterialContainer;
