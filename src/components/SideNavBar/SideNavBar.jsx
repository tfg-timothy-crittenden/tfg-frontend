import { useLocation } from "react-router-dom";
import styles from "./SideNavBar.module.css";
import SideNavBarWrapper from "./SideNavBarWrapper";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";

const SideNavBar = ({ taskSummaries, currentTest, loadTest }) => {
	const location = useLocation();
	const partMatch = location.pathname.match(/part_(\d)/);
	const activePart = partMatch ? `part${partMatch[1]}` : "part2"; // fallback to part2

	const currentList = taskSummaries[activePart] || [];

	return (
		<SideNavBarWrapper>
			<QuestionToggleSwitch />

			<ul className={styles.test_list}>
				{currentList.map((item, index) => (
					<li
						key={item.testId}
						className={`${styles.list_item} ${
							currentTest?.id === item.testId ? styles.active : ""
						}`}
						style={{ animationDelay: `${index * 0.05}s` }}
						onClick={() => loadTest(item.testId)}
					>
						<span className={styles.test_title}>{item.title}</span>
						{item.readingTitle && (
							<span className={styles.reading_title}>{item.readingTitle}</span>
						)}
					</li>
				))}
			</ul>
		</SideNavBarWrapper>
	);
};

export default SideNavBar;
