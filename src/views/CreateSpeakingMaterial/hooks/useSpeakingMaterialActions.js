import { useState } from "react";

import {
	buildSubmissionData,
	toAlertErrorMessage,
} from "../utils/speakingMaterialSubmission";

const useSpeakingMaterialActions = ({
	mode,
	onSubmitForm,
	onDraftSaveForm,
	onPublish,
	onReloadFromDb,
	getValues,
	reset,
	resolvedInitialValues,
	highlightDataByQuestion,
	part2ConfigByQuestion,
	hasUnsavedFieldChanges,
	setActivePart,
	setCurrentQuestion,
	setCurrentPart2Question,
	setStep,
	resetImageUiToExistingState,
	selectedImage,
	croppedImageUrl,
	croppedImageFile,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isReverting, setIsReverting] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	const buildPayload = async (data) => {
		const submissionData = await buildSubmissionData({
			data,
			croppedImageFile,
			croppedImageUrl,
			selectedImage,
		});

		return {
			data: submissionData,
			highlightDataByQuestion,
			part2ConfigByQuestion,
		};
	};

	const handleFormSubmit = async (data) => {
		if (!onSubmitForm) return;
		setIsSubmitting(true);
		try {
			const payload = await buildPayload(data);
			await onSubmitForm(payload);
			if (mode === "edit") {
				// Mark the just-saved values as the new baseline so Save/Discard
				// stay disabled until the user makes another change.
				reset(payload.data);
			}
			alert(mode === "edit" ? "Update successful!" : "Upload successful!");
		} catch (error) {
			alert(toAlertErrorMessage("Upload error", error));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDraftSave = async () => {
		const saveDraft = onDraftSaveForm || onSubmitForm;
		if (!hasUnsavedFieldChanges || !saveDraft) return;

		setIsSubmitting(true);
		try {
			const payload = await buildPayload(getValues());
			const response = await saveDraft(payload);
			const nextMaterialId =
				response?.materialId || payload.data.materialId || "";
			const nextSubmissionData = {
				...payload.data,
				materialId: nextMaterialId,
			};

			// Mark current values as the new baseline so save draft disables
			// until the user makes another change.
			reset(nextSubmissionData);
			alert("Draft saved!");
		} catch (error) {
			alert(toAlertErrorMessage("Upload error", error));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePublishSubmit = async (data) => {
		if (!onPublish) return;
		setIsPublishing(true);
		try {
			const payload = await buildPayload(data);
			await onPublish(payload);
			alert("Publish successful!");
		} catch (error) {
			alert(toAlertErrorMessage("Publish error", error));
		} finally {
			setIsPublishing(false);
		}
	};

	const handleRevertUnsavedChanges = async () => {
		if (!hasUnsavedFieldChanges) return;

		if (mode === "edit" && onReloadFromDb) {
			setIsReverting(true);
			try {
				await onReloadFromDb();
				resetImageUiToExistingState();
				setActivePart(1);
				setStep(0);
				setCurrentQuestion(0);
				setCurrentPart2Question(0);
			} catch (error) {
				alert(toAlertErrorMessage("Failed to refresh from server", error));
			} finally {
				setIsReverting(false);
			}
			return;
		}

		reset(resolvedInitialValues);
		resetImageUiToExistingState();
	};

	return {
		isSubmitting,
		isReverting,
		isPublishing,
		handleFormSubmit,
		handleDraftSave,
		handlePublishSubmit,
		handleRevertUnsavedChanges,
	};
};

export default useSpeakingMaterialActions;
