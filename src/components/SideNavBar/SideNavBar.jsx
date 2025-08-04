import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./SideNavBar.module.css";
import SideNavBarWrapper from "./SideNavBarWrapper";
import SpeakingPart1QuestionSelector from "@/components/SpeakingPart1QuestionSelector/SpeakingPart1QuestionSelector";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
	getSpeakingTaskOneTopics,
} from "@/api/tasks/tasksAPI";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

const SideNavBar = () => {
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();

	const activePart = partNumber ? `part${partNumber}` : "part1";

	// State for task summaries for speaking parts 2, 3, and 4
	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});

	// State for topics and current topic for Speaking Part 1
	const [topics, setTopics] = useState([]);
	const [currentTopic, setCurrentTopic] = useState(null);
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	//Load the titles of the parts of the tests assinged to the classroom
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

	//Load the topics for speaking part 1
	useEffect(() => {
		const loadTopics = async () => {
			try {
				const topics = await getSpeakingTaskOneTopics();
				console.log("Loaded topics:", topics);
				setTopics(topics);
			} catch (err) {
				console.error("Error loading Part 1 topics:", err);
			}
		};
		loadTopics();
	}, []);

	// Set the current topic based on the URL on initial render
	useEffect(() => {
		//Without this check, the component redirects back to part 1 when changing part
		if (partNumber !== "1") return;

		if (!Array.isArray(topics) || topics.length === 0) return;

		let selectedTopic = topics[0]; // fallback default

		if (partNumber === "1") {
			const pathSegments = location.pathname.split("/");
			const topicIndex = pathSegments.indexOf("topic");
			const topicFromUrl =
				topicIndex !== -1
					? decodeURIComponent(pathSegments[topicIndex + 1])
					: null;

			if (topics.includes(topicFromUrl)) {
				selectedTopic = topicFromUrl;
			}
		}

		setCurrentTopic(selectedTopic);
		navigate(
			`/my/classrooms/${classroomId}/test/${testId}/part/1/topic/${selectedTopic}`
		);
	}, [topics, location.pathname]);

	const handleTopicClick = (topic) => {
		setCurrentTopic(topic);
		navigate(
			`/my/classrooms/${classroomId}/test/${testId}/part/1/topic/${topic}`
		);
	};

	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];

	// Redirect if testId doesn't exist in current classroom (only for part 2/3/4)
	useEffect(() => {
		const defaultPart = partNumber || 2;

		if (partNumber === "1") return;

		const allTestIds = [
			...(hasTeacherRole ? teacherCurrentList : []),
			...studentCurrentList,
		].map((t) => t.testId);

		const testIdExists = allTestIds.includes(testId);

		if (!testIdExists) {
			const firstValid =
				(hasTeacherRole && teacherCurrentList[0]) || studentCurrentList[0];

			if (firstValid) {
				navigate(
					`/my/classrooms/${classroomId}/test/${firstValid.testId}/part/${defaultPart}`,
					{ replace: true }
				);
			}
		}
	}, [
		testId,
		partNumber,
		classroomId,
		hasTeacherRole,
		teacherCurrentList,
		studentCurrentList,
		navigate,
	]);

	const handleSelectTestPart = (newTestId, part = 2) => {
		navigate(`/my/classrooms/${classroomId}/test/${newTestId}/part/${part}`);
	};

	return (
		<SideNavBarWrapper>
			{activePart === "part1" ? (
				<SpeakingPart1QuestionSelector
					topics={topics}
					currentTopic={currentTopic}
					handleTopicChange={handleTopicClick}
				/>
			) : (
				<div className={styles.test_menu}>
					{/* Teacher Section */}
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
											handleSelectTestPart(item.testId, partNumber || 2)
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

					{/* Student Section */}
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
											handleSelectTestPart(item.testId, partNumber || 2)
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
