import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./SideNavBar.module.css";
import SideNavBarWrapper from "./SideNavBarWrapper";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

const DEFAULT_TOPIC = "General";

const SideNavBar = () => {
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const activePart = partNumber ? `part${partNumber}` : "part1";

	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});
	const [selectedSection, setSelectedSection] = useState(null);
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	// Load task summaries
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

	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];

	const handleSelectTestPart = (
		newTestId,
		part = 1,
		section = null,
		topic = DEFAULT_TOPIC
	) => {
		setSelectedSection(section);
		if (part === 1) {
			navigate(
				`/my/classrooms/${classroomId}/test/${newTestId}/part/1/instructions?topic=${encodeURIComponent(
					topic
				)}`
			);
		} else {
			navigate(`/my/classrooms/${classroomId}/test/${newTestId}/part/${part}`);
		}
	};

	// For Part 1, create separate teacher and student lists based on available tasks
	const getTeacherTestsForPart1 = () => {
		// First try to use testNames if available in teacher response
		if (hasTeacherRole && teacherTaskSummaries.testNames) {
			// Check if testNames is array of objects with testId and title
			if (
				Array.isArray(teacherTaskSummaries.testNames) &&
				teacherTaskSummaries.testNames[0]?.testId
			) {
				return teacherTaskSummaries.testNames;
			}
			// Fallback: if testNames is array of strings, generate testIds
			return teacherTaskSummaries.testNames.map((testName, index) => ({
				testId: `test${index + 1}`,
				title: testName,
			}));
		}

		// Extract from teacher task data to get actual testIds
		const teacherTasks = [];
		Object.values(teacherTaskSummaries).forEach((partTasks) => {
			if (Array.isArray(partTasks)) {
				teacherTasks.push(...partTasks);
			}
		});

		const uniqueTests = [];
		const seenTestIds = new Set();

		teacherTasks.forEach((task) => {
			if (!seenTestIds.has(task.testId)) {
				seenTestIds.add(task.testId);
				uniqueTests.push({
					testId: task.testId,
					title: task.title,
				});
			}
		});

		return uniqueTests;
	};

	const getStudentTestsForPart1 = () => {
		// First try to use testNames if available in student response
		if (studentTaskSummaries.testNames) {
			// Check if testNames is array of objects with testId and title
			if (
				Array.isArray(studentTaskSummaries.testNames) &&
				studentTaskSummaries.testNames[0]?.testId
			) {
				return studentTaskSummaries.testNames;
			}
			// Fallback: if testNames is array of strings, generate testIds
			return studentTaskSummaries.testNames.map((testName, index) => ({
				testId: `test${index + 1}`,
				title: testName,
			}));
		}

		// Extract from student task data to get actual testIds
		const studentTasks = [];
		Object.values(studentTaskSummaries).forEach((partTasks) => {
			if (Array.isArray(partTasks)) {
				studentTasks.push(...partTasks);
			}
		});

		const uniqueTests = [];
		const seenTestIds = new Set();

		studentTasks.forEach((task) => {
			if (!seenTestIds.has(task.testId)) {
				seenTestIds.add(task.testId);
				uniqueTests.push({
					testId: task.testId,
					title: task.title,
				});
			}
		});

		return uniqueTests;
	};

	const teacherTestsPart1 = getTeacherTestsForPart1();
	const studentTestsPart1 = getStudentTestsForPart1();

	return (
		<SideNavBarWrapper>
			<div className={styles.test_menu}>
				{/* Add welcome message when no tests available */}
				{studentCurrentList.length === 0 &&
					(!hasTeacherRole || teacherCurrentList.length === 0) &&
					activePart !== "part1" && (
						<div className={styles.no_tests_message}>
							<p>No tests available for this part.</p>
							<p>Contact your teacher to assign materials.</p>
						</div>
					)}

				{/* Part 1: Teacher Section */}
				{activePart === "part1" && hasTeacherRole && (
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
								{teacherTestsPart1.map((test) => (
									<li
										key={test.testId}
										className={`${styles.list_item} ${
											testId === test.testId && selectedSection === "teacher"
												? styles.active
												: ""
										}`}
										onClick={() =>
											handleSelectTestPart(test.testId, 1, "teacher")
										}
									>
										<span className={styles.test_title}>{test.title}</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{/* Part 1: Student Section */}
				{activePart === "part1" && (
					<section className={styles.test_menu_section}>
						{hasTeacherRole ? (
							<div
								className={styles.accordion_header}
								onClick={() => setShowStudentList((prev) => !prev)}
							>
								<span>Student Material</span>
								<span className={styles.chevron}>
									{showStudentList ? <ChevronUp /> : <ChevronDown />}
								</span>
							</div>
						) : (
							<h3 className={styles.section_title}>Practice Tests</h3>
						)}

						<div
							className={`${styles.accordion_wrapper} ${
								hasTeacherRole
									? showStudentList
										? styles.open
										: ""
									: styles.open
							}`}
						>
							<ul className={styles.test_list}>
								{studentTestsPart1.map((test) => (
									<li
										key={test.testId}
										className={`${styles.list_item} ${
											testId === test.testId && selectedSection === "student"
												? styles.active
												: ""
										}`}
										onClick={() =>
											handleSelectTestPart(test.testId, 1, "student")
										}
									>
										<span className={styles.test_title}>{test.title}</span>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{/* Parts 2-4: Teacher Section */}
				{activePart !== "part1" && hasTeacherRole && (
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
											testId === item.testId && selectedSection === "teacher"
												? styles.active
												: ""
										}`}
										onClick={() =>
											handleSelectTestPart(
												item.testId,
												partNumber || 1,
												"teacher"
											)
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
				)}

				{/* Parts 2-4: Student Section */}
				{activePart !== "part1" && (
					<section className={styles.test_menu_section}>
						{hasTeacherRole ? (
							<div
								className={styles.accordion_header}
								onClick={() => setShowStudentList((prev) => !prev)}
							>
								<span>Student Material</span>
								<span className={styles.chevron}>
									{showStudentList ? <ChevronUp /> : <ChevronDown />}
								</span>
							</div>
						) : (
							<h3 className={styles.section_title}>Practice Tests</h3>
						)}

						<div
							className={`${styles.accordion_wrapper} ${
								hasTeacherRole
									? showStudentList
										? styles.open
										: ""
									: styles.open
							}`}
						>
							<ul className={styles.test_list}>
								{studentCurrentList.map((item) => (
									<li
										key={item.testId}
										className={`${styles.list_item} ${
											testId === item.testId && selectedSection === "student"
												? styles.active
												: ""
										}`}
										onClick={() =>
											handleSelectTestPart(
												item.testId,
												partNumber || 1,
												"student"
											)
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
				)}
			</div>
		</SideNavBarWrapper>
	);
};

export default SideNavBar;
