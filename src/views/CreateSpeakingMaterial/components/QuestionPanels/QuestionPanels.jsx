const QuestionPanels = ({
	totalQuestions,
	currentIndex,
	renderPanel,
	styles,
}) => {
	return (
		<div className={styles.step3_fields_card}>
			<div className={styles.question_slide_area}>
				{Array.from({ length: totalQuestions }, (_, idx) => (
					<div
						key={idx}
						className={`${styles.question_panel}${idx === currentIndex ? ` ${styles.question_panel_active}` : ""}`}
						aria-hidden={idx !== currentIndex}
					>
						{renderPanel(idx)}
					</div>
				))}
			</div>
		</div>
	);
};

export default QuestionPanels;
