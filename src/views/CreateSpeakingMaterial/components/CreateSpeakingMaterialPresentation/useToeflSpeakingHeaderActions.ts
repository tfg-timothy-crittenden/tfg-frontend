import type { useToeflSpeakingPersistence } from "./useToeflSpeakingPersistence";
import type { useToeflSpeakingWorkflow } from "./useToeflSpeakingWorkflow";

type ToeflSpeakingHeaderActionsInput = {
	workflow: ReturnType<typeof useToeflSpeakingWorkflow>;
	persistence: ReturnType<typeof useToeflSpeakingPersistence>;
};

export function useToeflSpeakingHeaderActions({
	workflow,
	persistence,
}: ToeflSpeakingHeaderActionsInput) {
	const isSubmitting =
		workflow.state.matches("savingDraft") ||
		workflow.state.matches("savingPublishedChanges");

	return {
		mode: workflow.context.mode,
		hasUnsavedFieldChanges: workflow.context.hasUnsavedFieldChanges,
		isSubmitting,
		isPublishing: workflow.state.matches("publishing"),
		isReverting: workflow.state.matches("reverting"),
		canShowDraftButton: workflow.context.sectionStatus !== "PUBLISHED",
		canShowHeaderSaveChangesButton:
			workflow.context.mode === "edit" &&
			workflow.context.sectionStatus === "PUBLISHED",
		saveChangesDisabled: !workflow.state.can({
			type: "SAVE_PUBLISHED_CHANGES",
		}),
		handleRevertUnsavedChanges: persistence.revert,
		handleDraftSave: persistence.saveDraft,
		handleSaveChanges: persistence.savePublishedChanges,
	};
}
