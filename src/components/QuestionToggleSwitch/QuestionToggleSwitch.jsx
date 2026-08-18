// QuestionToggleSwitch.jsx
import { NavLink, useLocation, useParams } from "react-router-dom";
import { buildRoute, routeMatchers } from "@/app/routes/routeConfig";
import styles from "./QuestionToggleSwitch.module.css";

const QuestionToggleSwitch = () => {
	const location = useLocation();
	const { id, sectionId, partNumber, questionNumber } = useParams();
	const currentMode =
		routeMatchers.getPartModeFromPath(location.pathname) || "instructions";

	const questionButtons = Array.from({ length: 11 }, (_, index) => index + 1);

	return (
		<nav className={styles.container}>
			<div className={styles.toggle_group}>
				{questionButtons.map((question) => {
					const targetPart = question <= 7 ? "1" : "2";
					const targetQuestion = question <= 7 ? question : question - 7;
					const to = buildRoute.questionMode(
						id,
						sectionId,
						targetPart,
						targetQuestion,
						currentMode,
					);
					return (
						<NavLink
							key={question}
							to={to}
							className={() => {
								const isQuestionActive =
									partNumber === targetPart &&
									questionNumber === String(targetQuestion);
								return isQuestionActive
									? styles.activeLink
									: styles.inactiveLink;
							}}
						>
							<span className={styles.qPrefix}>Q</span>
							{question}
						</NavLink>
					);
				})}
			</div>
		</nav>
	);
};

export default QuestionToggleSwitch;
