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
	resetNavigation,
	resetImageUiToExistingState,
	selectedImage,
	croppedImageUrl,
	croppedImageFile,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isReverting, setIsReverting] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);

	// Clear all window-level "audioCleared_*" flags that AudioDropzone sets when the
	// user removes an existing audio file.  Must be called whenever the form is
	// reverted to the server state or after a successful save so that the stale
	// cleared-flag can no longer block the next round of validation.
	const clearAllAudioClearedFlags = () => {
		if (typeof window === "undefined") return;
		Object.keys(window)
			.filter((key) => key.startsWith("audioCleared_"))
			.forEach((key) => {
				window[key] = false;
			});
	};

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
			clearAllAudioClearedFlags();
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
			// After saving, reload section data to update existingMedia (audio URLs)
			if (typeof onReloadFromDb === "function") {
				await onReloadFromDb();
			}
			clearAllAudioClearedFlags();
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
			let published = false;
			// In create mode, always save draft first to persist files, then publish
			if (mode === "create" && typeof onDraftSaveForm === "function") {
				const payload = await buildPayload(data);
				await onDraftSaveForm(payload);
				// After saving, reload section data to update existingMedia (audio URLs)
				if (typeof onReloadFromDb === "function") {
					await onReloadFromDb();
				}
				// Always get latest values for publish
				const latestPayload = await buildPayload(getValues());
				await onPublish(latestPayload);
				published = true;
			} else if (
				hasUnsavedFieldChanges &&
				typeof onDraftSaveForm === "function"
			) {
				// In edit mode, save draft if there are unsaved changes
				const payload = await buildPayload(data);
				await onDraftSaveForm(payload);
				if (typeof onReloadFromDb === "function") {
					await onReloadFromDb();
				}
				// Always get latest values for publish
				const latestPayload = await buildPayload(getValues());
				await onPublish(latestPayload);
				published = true;
			} else {
				// Always get latest values for publish
				const latestPayload = await buildPayload(getValues());
				await onPublish(latestPayload);
				published = true;
			}
			// After publishing, reload section and reset form to backend state
			if (published && typeof onReloadFromDb === "function") {
				await onReloadFromDb();
			}
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
				clearAllAudioClearedFlags();
				resetNavigation();
				resetImageUiToExistingState();
			} catch (error) {
				alert(toAlertErrorMessage("Failed to refresh from server", error));
			} finally {
				setIsReverting(false);
			}
			return;
		}

		reset(resolvedInitialValues);
		clearAllAudioClearedFlags();
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
