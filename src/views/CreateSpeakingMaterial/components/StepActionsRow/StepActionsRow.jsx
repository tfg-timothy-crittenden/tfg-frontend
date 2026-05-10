const StepActionsRow = ({
	leftLabel,
	leftOnClick,
	rightLabel,
	rightOnClick,
	rightType = "button",
	rightDisabled = false,
	styles,
}) => {
	return (
		<div className={styles.step_actions_row}>
			<button
				type="button"
				onClick={leftOnClick}
				className={`${styles.back_button} ${styles.step_action_button}`}
			>
				{leftLabel}
			</button>
			<button
				type={rightType}
				onClick={rightOnClick}
				className={`${styles.submit_button} ${styles.step_action_button}`}
				disabled={rightDisabled}
			>
				{rightLabel}
			</button>
		</div>
	);
};

export default StepActionsRow;
