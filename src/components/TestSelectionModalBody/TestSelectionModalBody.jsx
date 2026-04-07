// src/components/TestSelectionModal/TestSelectionModal.jsx
import React from "react";
import { Users, GraduationCap } from "lucide-react";
import styles from "./TestSelectionModalBody.module.css";
import QuestionToggleSwitch from "../QuestionToggleSwitch/QuestionToggleSwitch";

const TestSelectionModalBody = ({
	studentTaskSummaries,
	teacherTaskSummaries,
	hasTeacherRole,
	partNumber,
	testId,
	selectedSection,
	onTestSelect,
}) => {
	// Helper functions for test data (extracted from  SideNavBar logic)
	const getTeacherTestsForPart1 = () => {
		if (hasTeacherRole && teacherTaskSummaries.testNames) {
			if (
				Array.isArray(teacherTaskSummaries.testNames) &&
				teacherTaskSummaries.testNames[0]?.testId
			) {
				return teacherTaskSummaries.testNames.map((test, index) => ({
					testId: Number(test.testId) || index + 1,
					title: test.title,
				}));
			}
			return teacherTaskSummaries.testNames.map((testName, index) => ({
				testId: index + 1,
				title: testName,
			}));
		}

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
		if (studentTaskSummaries.testNames) {
			if (
				Array.isArray(studentTaskSummaries.testNames) &&
				studentTaskSummaries.testNames[0]?.testId
			) {
				return studentTaskSummaries.testNames.map((test, index) => ({
					testId: Number(test.testId) || index + 1,
					title: test.title,
				}));
			}
			return studentTaskSummaries.testNames.map((testName, index) => ({
				testId: index + 1,
				title: testName,
			}));
		}

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

	// Get current test data
	const activePart = partNumber ? `part${partNumber}` : "part1";
	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];
	const teacherTestsPart1 = getTeacherTestsForPart1();
	const studentTestsPart1 = getStudentTestsForPart1();

	return (
		<div className={styles.test_selection}>
			{/* No tests available message */}
			{studentCurrentList.length === 0 &&
				(!hasTeacherRole || teacherCurrentList.length === 0) &&
				activePart !== "part1" && (
					<div className={styles.no_tests_message}>
						<p>No tests available for this part.</p>
						<p>Contact your teacher to assign materials.</p>
					</div>
				)}

			{/* Part 1: Teacher Section */}
			{activePart === "part1" &&
				hasTeacherRole &&
				teacherTestsPart1.length > 0 && (
					<div className={styles.test_section}>
						<h3 className={styles.section_title}>
							<GraduationCap size={20} />
							Teacher Material
						</h3>
						<div className={styles.test_list}>
							{teacherTestsPart1.map((test) => (
								<button
									key={test.testId}
									className={`${styles.test_item} ${
										testId === test.testId && selectedSection === "teacher"
											? styles.active_test
											: ""
									}`}
									onClick={() => onTestSelect(test, 1, "teacher")}
								>
									<div className={styles.test_title}>{test.title}</div>
								</button>
							))}
						</div>
					</div>
				)}

			{/* Part 1: Student Section */}
			{activePart === "part1" && studentTestsPart1.length > 0 && (
				<div className={styles.test_section}>
					<h3 className={styles.section_title}>
						<Users size={20} />
						{hasTeacherRole ? "Student Material" : "Practice Tests"}
					</h3>
					<div className={styles.test_list}>
						{studentTestsPart1.map((test) => (
							<button
								key={test.testId}
								className={`${styles.test_item} ${
									testId === test.testId && selectedSection === "student"
										? styles.active_test
										: ""
								}`}
								onClick={() => onTestSelect(test, 1, "student")}
							>
								<div className={styles.test_title}>{test.title}</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Parts 2-4: Teacher Section */}
			{activePart !== "part1" &&
				hasTeacherRole &&
				teacherCurrentList.length > 0 && (
					<div className={styles.test_section}>
						<h3 className={styles.section_title}>
							<GraduationCap size={20} />
							Teacher Material
						</h3>
						<div className={styles.test_list}>
							{teacherCurrentList.map((item) => (
								<button
									key={item.testId}
									className={`${styles.test_item} ${
										testId === item.testId && selectedSection === "teacher"
											? styles.active_test
											: ""
									}`}
									onClick={() => onTestSelect(item, partNumber || 1, "teacher")}
								>
									<div className={styles.test_title}>{item.title}</div>
									{item.readingTitle && (
										<div className={styles.test_subtitle}>
											{item.readingTitle}
										</div>
									)}
								</button>
							))}
						</div>
					</div>
				)}

			{/* Parts 2-4: Student Section */}
			{activePart !== "part1" && studentCurrentList.length > 0 && (
				<div className={styles.test_section}>
					<h3 className={styles.section_title}>
						<Users size={20} />
						{hasTeacherRole ? "Student Material" : "Practice Tests"}
					</h3>
					<div className={styles.test_list}>
						{studentCurrentList.map((item) => (
							<button
								key={item.testId}
								className={`${styles.test_item} ${
									testId === item.testId && selectedSection === "student"
										? styles.active_test
										: ""
								}`}
								onClick={() => onTestSelect(item, partNumber || 1, "student")}
							>
								<div className={styles.test_title}>{item.title}</div>
								{item.readingTitle && (
									<div className={styles.test_subtitle}>
										{item.readingTitle}
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default TestSelectionModalBody;
