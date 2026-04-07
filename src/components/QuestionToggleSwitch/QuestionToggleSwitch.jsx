// QuestionToggleSwitch.jsx
import { NavLink, useParams } from "react-router-dom";
import { buildRoute } from "@/routes/routeConfig";
import styles from "./QuestionToggleSwitch.module.css";

const TASK_PARTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const QuestionToggleSwitch = () => {
	const { id, testId, partNumber } = useParams();

	return (
		<nav className={styles.container}>
			<div className={styles.toggle_group}>
				{TASK_PARTS.map((part) => {
					const to = buildRoute.testPart(id, testId, part);
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
