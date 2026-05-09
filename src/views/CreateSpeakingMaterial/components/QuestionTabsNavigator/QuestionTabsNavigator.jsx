import { ChevronLeft, ChevronRight } from "lucide-react";

const QuestionTabsNavigator = ({
	totalQuestions,
	currentIndex,
	onPrev,
	onNext,
	onSelect,
	completion = [],
	navAriaLabel,
	questionAriaLabelPrefix,
	styles,
}) => {
	return (
		<div className={styles.step3_tabs_card}>
			<div className={styles.questions_selector_row}>
				<button
					type="button"
					aria-label={`Previous ${questionAriaLabelPrefix}`}
					onClick={onPrev}
					disabled={currentIndex === 0}
					className={
						styles.chevron_button_left +
						(currentIndex === 0 ? ` ${styles.chevron_button_disabled}` : "")
					}
				>
					<ChevronLeft size={40} strokeWidth={2.25} />
				</button>
				<nav className={styles.questions_nav} aria-label={navAriaLabel}>
					{Array.from({ length: totalQuestions }, (_, idx) => (
						<button
							key={idx}
							type="button"
							className={
								styles.question_tab +
								(idx === currentIndex ? ` ${styles.active_tab}` : "") +
								(completion[idx] ? ` ${styles.completed_tab}` : "")
							}
							onClick={() => onSelect(idx)}
							aria-current={idx === currentIndex ? "step" : undefined}
							aria-label={`Go to ${questionAriaLabelPrefix} ${idx + 1}`}
						>
							<span className={styles.question_tab_label}>Q{idx + 1}</span>
							<span className={styles.question_tab_circle} />
						</button>
					))}
				</nav>
				<button
					type="button"
					aria-label={`Next ${questionAriaLabelPrefix}`}
					onClick={onNext}
					disabled={currentIndex === totalQuestions - 1}
					className={
						styles.chevron_button_right +
						(currentIndex === totalQuestions - 1
							? ` ${styles.chevron_button_disabled}`
							: "")
					}
				>
					<ChevronRight size={40} strokeWidth={2.25} />
				</button>
			</div>
		</div>
	);
};

export default QuestionTabsNavigator;
