// QuestionToggleSwitch.jsx
import { NavLink, useParams } from "react-router-dom";
import { buildRoute } from "@/routes/routeConfig";
import styles from "./QuestionToggleSwitch.module.css";

const TASK_PARTS = [1, 2, 3, 4];

const QuestionToggleSwitch = () => {
	const { id, testId, partNumber } = useParams();

	return (
		<nav className={styles.container}>
			<div className={styles.toggle_group}>
				{TASK_PARTS.map((part) => (
					<NavLink
						key={part}
						to={buildRoute.testPart(id, testId, part)}
						className={({ isActive }) => {
							// Consider a part active if we're on any route for that part
							const isPartActive = partNumber === String(part);
							return isPartActive ? styles.activeLink : styles.inactiveLink;
						}}
					>
						Q{part}
					</NavLink>
				))}
			</div>
		</nav>
	);
};

export default QuestionToggleSwitch;
