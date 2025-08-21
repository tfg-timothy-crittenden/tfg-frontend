import { BookOpen, ChevronRight, Users } from "lucide-react";
import styles from "./TestSelectionWelcome.module.css";

const TestSelectionWelcome = ({ classroomName }) => {
	return (
		<div className={styles.welcome_container}>
			<div className={styles.welcome_content}>
				<div className={styles.icon_container}>
					<BookOpen size={80} className={styles.main_icon} />
				</div>

				<h2 className={styles.welcome_title}>
					Welcome to {classroomName || "your classroom"}
				</h2>

				<p className={styles.welcome_description}>
					Ready to practice your TOEFL Speaking skills? Choose a test from the
					sidebar to get started.
				</p>

				<div className={styles.steps_container}>
					<div className={styles.step}>
						<div className={styles.step_number}>1</div>
						<div className={styles.step_content}>
							<h3>Select a Test</h3>
							<p>Choose from available speaking tests in the sidebar</p>
						</div>
					</div>

					<ChevronRight size={24} className={styles.step_arrow} />

					<div className={styles.step}>
						<div className={styles.step_number}>2</div>
						<div className={styles.step_content}>
							<h3>Choose Part</h3>
							<p>Pick which speaking part you want to practice</p>
						</div>
					</div>

					<ChevronRight size={24} className={styles.step_arrow} />

					<div className={styles.step}>
						<div className={styles.step_number}>3</div>
						<div className={styles.step_content}>
							<h3>Start Practicing</h3>
							<p>Follow the instructions and begin your speaking practice</p>
						</div>
					</div>
				</div>

				<div className={styles.tips_section}>
					<h3 className={styles.tips_title}>Quick Tips:</h3>
					<ul className={styles.tips_list}>
						<li>Use headphones for better audio quality</li>
						<li>Take notes during reading and listening sections</li>
						<li>Practice speaking clearly and at a natural pace</li>
						<li>Check your microphone before starting</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default TestSelectionWelcome;
