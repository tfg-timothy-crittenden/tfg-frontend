import { RotateCcw, Save } from "lucide-react";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const HeaderActions = (props) => {
	const { actions } = props ?? {};

	if (!actions) return null;

	const {
		mode,
		hasUnsavedFieldChanges,
		isSubmitting,
		isPublishing,
		isReverting,
		handleRevertUnsavedChanges,
		canShowDraftButton,
		handleDraftSave,
		canShowHeaderSaveChangesButton,
		handleSubmit,
		handleFormSubmit,
		handleSaveChanges,
		saveChangesDisabled,
	} = actions;

	const handleSaveChangesClick = () => {
		if (saveChangesDisabled) return;

		if (handleSaveChanges) {
			handleSaveChanges();
			return;
		}

		if (handleSubmit && handleFormSubmit) {
			setTimeout(() => handleSubmit(handleFormSubmit)(), 0);
		}
	};

	return (
		<div className={styles.form_header_actions}>
			{mode === "edit" && (
				<button
					type="button"
					className={`${styles.revert_button} ${styles.step_action_button}`}
					onClick={
						hasUnsavedFieldChanges ? handleRevertUnsavedChanges : undefined
					}
					disabled={
						!hasUnsavedFieldChanges ||
						isSubmitting ||
						isPublishing ||
						isReverting
					}
				>
					<RotateCcw size={16} className={styles.draft_button_icon} />
					{isReverting ? "Discarding..." : "Discard Changes"}
				</button>
			)}
			{canShowDraftButton && (
				<button
					type="button"
					className={`${styles.draft_button} ${styles.step_action_button}`}
					onClick={hasUnsavedFieldChanges ? handleDraftSave : undefined}
					disabled={!hasUnsavedFieldChanges || isSubmitting || isReverting}
				>
					<Save size={16} className={styles.draft_button_icon} />
					{isSubmitting ? "Saving..." : "Save Draft"}
				</button>
			)}
			{canShowHeaderSaveChangesButton && (
				<button
					type="button"
					className={`${styles.draft_button} ${styles.step_action_button}`}
					onClick={!saveChangesDisabled ? handleSaveChangesClick : undefined}
					disabled={saveChangesDisabled || isSubmitting || isReverting}
				>
					<Save size={16} className={styles.draft_button_icon} />
					{isSubmitting ? "Saving..." : "Save Changes"}
				</button>
			)}
		</div>
	);
};

export default HeaderActions;
