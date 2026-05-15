import { RotateCcw, Save } from "lucide-react";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const HeaderActions = ({ form }) => {
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
		saveChangesDisabled,
	} = form;

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
					onClick={
						!saveChangesDisabled
							? () => {
									// Force blur on all inputs before submit to flush state
									if (typeof document !== "undefined") {
										document
											.querySelectorAll("input,textarea,select")
											.forEach((el) => {
												if (typeof el.blur === "function") el.blur();
											});
									}
									setTimeout(() => handleSubmit(handleFormSubmit)(), 0);
								}
							: undefined
					}
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
