import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./SideNavBar.module.css";
import SideNavBarWrapper from "./SideNavBarWrapper";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";
import SpeakingPart1QuestionSelector from "@/components/SpeakingPart1QuestionSelector/SpeakingPart1QuestionSelector";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

const SideNavBar = () => {
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const activePart = partNumber ? `part${partNumber}` : "part1";

	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});
	const [topics, setTopics] = useState([]);
	const [topicData, setTopicData] = useState({});
	const [currentTopic, setCurrentTopic] = useState(null);
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	useEffect(() => {
		getClassroomStudentTaskSummaries(classroomId)
			.then(setStudentTaskSummaries)
			.catch((err) => console.error("Failed to load student summaries:", err));

		if (hasTeacherRole) {
			getClassroomTeacherTaskSummaries(classroomId)
				.then(setTeacherTaskSummaries)
				.catch((err) =>
					console.error("Failed to load teacher summaries:", err)
				);
		}
	}, [classroomId, hasTeacherRole]);

	useEffect(() => {
		const loadTopics = async () => {
			try {
				const response = await fetch("/questions_part_1_and_officials.json");
				const data = await response.json();
				setTopicData(data);
				const keys = Object.keys(data);
				setTopics(keys);
				if (keys.length > 0) setCurrentTopic(keys[0]);
			} catch (err) {
				console.error("Error loading Part 1 topics:", err);
			}
		};
		loadTopics();
	}, []);

	const handleSelectTestPart = (newTestId, part = 2) => {
		navigate(`/classroom/${classroomId}/test/${newTestId}/part/${part}`);
	};

	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];

	return (
		<SideNavBarWrapper>
			{activePart === "part1" ? (
				<SpeakingPart1QuestionSelector
					topics={topics}
					currentTopic={currentTopic}
					handleTopicChange={setCurrentTopic}
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
								{showTeacherList ? <ChevronUp /> : <ChevronDown />}
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
											testId === item.testId ? styles.active : ""
										}`}
										onClick={() =>
											handleSelectTestPart(item.testId, partNumber || 1)
										}
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
								{showStudentList ? <ChevronUp /> : <ChevronDown />}
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
											testId === item.testId ? styles.active : ""
										}`}
										onClick={() =>
											handleSelectTestPart(item.testId, partNumber || 1)
										}
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
