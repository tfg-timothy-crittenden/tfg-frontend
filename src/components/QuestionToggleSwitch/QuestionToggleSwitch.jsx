// QuestionToggleSwitch.jsx
import { NavLink, useParams } from "react-router-dom";
import styles from "./QuestionToggleSwitch.module.css";

const TASK_PARTS = [1, 2, 3, 4];

const QuestionToggleSwitch = () => {
	const { id, testId, partNumber } = useParams();

	return (
		<nav className={styles.container}>
			<div className={styles.toggle_group}>
				<NavLink
					to={`/my/classrooms/${id}/test/${testId}/instructions`}
					className={({ isActive }) =>
						isActive ? styles.activeLink : styles.inactiveLink
					}
				>
					Instructions
				</NavLink>
				{TASK_PARTS.map((part) => (
					<NavLink
						key={part}
						to={`/my/classrooms/${id}/test/${testId}/part/${part}`}
						className={({ isActive }) =>
							isActive ? styles.activeLink : styles.inactiveLink
						}
					>
						Q{part}
					</NavLink>
				))}
			</div>
		</nav>
	);
};

export default QuestionToggleSwitch;
