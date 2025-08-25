// QuestionToggleSwitch.jsx
import { NavLink, useParams } from "react-router-dom";
import { buildRoute } from "@/routes/routeConfig";
import styles from "./QuestionToggleSwitch.module.css";

const TASK_PARTS = [1, 2, 3, 4];
const DEFAULT_TOPIC = "Education";

const QuestionToggleSwitch = () => {
	const { id, testId, partNumber, topicName } = useParams();

	return (
		<nav className={styles.container}>
			<div className={styles.toggle_group}>
				{TASK_PARTS.map((part) => {
					let to;
					if (part === 1) {
						const topic = topicName || DEFAULT_TOPIC;
						// Always link to instructions mode for Q1
						to = `/my/classrooms/${id}/test/${testId}/part/1/instructions?topic=${encodeURIComponent(
							topic
						)}`;
					} else {
						to = buildRoute.testPart(id, testId, part);
					}
					return (
						<NavLink
							key={part}
							to={to}
							className={({ isActive }) => {
								const isPartActive = partNumber === String(part);
								return isPartActive ? styles.activeLink : styles.inactiveLink;
							}}
						>
							Q{part}
						</NavLink>
					);
				})}
			</div>
		</nav>
	);
};

export default QuestionToggleSwitch;
