import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./SideNavBar.module.css";
import SideNavBarWrapper from "./SideNavBarWrapper";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";
import SpeakingPart1QuestionSelector from "@/components/SpeakingPart1QuestionSelector/SpeakingPart1QuestionSelector";

const SideNavBar = ({
	studentTaskSummaries,
	teacherTaskSummaries,
	currentTest,
	loadTest,
	selectedSource,
	topics,
	currentTopic,
	handleTopicChange,
}) => {
	const location = useLocation();
	const partMatch = location.pathname.match(/part_(\d)/);
	const activePart = partMatch ? `part${partMatch[1]}` : "part2";

	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];

	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	return (
		<SideNavBarWrapper>
			<QuestionToggleSwitch />

			{activePart === "part1" ? (
				<SpeakingPart1QuestionSelector
					topics={topics}
					currentTopic={currentTopic}
					handleTopicChange={handleTopicChange}
				/>
			) : (
				<div className={styles.test_menu}>
					<section className={styles.test_menu_section}>
						<div
							className={styles.accordion_header}
							onClick={() => setShowTeacherList((prev) => !prev)}
						>
							<span>Teacher Material</span>
							<span className={styles.chevron}>
								{showTeacherList ? "˄" : "˅"}
							</span>
						</div>

						<div
							className={`${styles.accordion_wrapper} ${
								showTeacherList ? styles.open : ""
							}`}
						>
							<ul className={styles.test_list}>
								{teacherCurrentList.map((item) => (
									<li
										key={item.testId}
										className={`${styles.list_item} ${
											currentTest?.id === item.testId &&
											selectedSource === "teacher"
												? styles.active
												: ""
										}`}
										onClick={() => loadTest(item.testId, "teacher")}
									>
										<span className={styles.test_title}>{item.title}</span>
										{item.readingTitle && (
											<span className={styles.reading_title}>
												{item.readingTitle}
											</span>
										)}
									</li>
								))}
							</ul>
						</div>
					</section>
					<section className={styles.test_menu_section}>
						<div
							className={styles.accordion_header}
							onClick={() => setShowStudentList((prev) => !prev)}
						>
							<span>Student Material</span>
							<span className={styles.chevron}>
								{showStudentList ? "˄" : "˅"}
							</span>
						</div>

						<div
							className={`${styles.accordion_wrapper} ${
								showStudentList ? styles.open : ""
							}`}
						>
							<ul className={styles.test_list}>
								{studentCurrentList.map((item) => (
									<li
										key={item.testId}
										className={`${styles.list_item} ${
											currentTest?.id === item.testId &&
											selectedSource === "student"
												? styles.active
												: ""
										}`}
										onClick={() => loadTest(item.testId, "student")}
									>
										<span className={styles.test_title}>{item.title}</span>
										{item.readingTitle && (
											<span className={styles.reading_title}>
												{item.readingTitle}
											</span>
										)}
									</li>
								))}
							</ul>
						</div>
					</section>
				</div>
			)}
		</SideNavBarWrapper>
	);
};

export default SideNavBar;
