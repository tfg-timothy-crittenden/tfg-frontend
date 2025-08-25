// src/components/MobileBottomNav/MobileBottomNav.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	BookOpen,
	Headphones,
	Mic,
	List,
	Users,
	GraduationCap,
} from "lucide-react";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";
import styles from "./MobileBottomNav.module.css";

const MobileBottomNav = () => {
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});
	const [selectedSection, setSelectedSection] = useState(null);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	// Load task summaries (same as original SideNavBar)
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

	// Part configuration
	const parts = [
		{ id: "1", label: "Part 1", icon: <Mic size={20} /> },
		{ id: "2", label: "Part 2", icon: <BookOpen size={20} /> },
		{ id: "3", label: "Part 3", icon: <BookOpen size={20} /> },
		{ id: "4", label: "Part 4", icon: <Headphones size={20} /> },
	];

	const handlePartSelect = (part) => {
		if (testId) {
			navigate(`/my/classrooms/${classroomId}/test/${testId}/part/${part}`);
		} else {
			// No test selected, show available tests
			openModal();
		}
	};

	const handleTestSelect = (
		test,
		part,
		section = null,
		topic = DEFAULT_TOPIC
	) => {
		setSelectedSection(section);
		closeModal();
		if (part === 1) {
			navigate(
				`/my/classrooms/${classroomId}/test/${
					test.testId || test.id
				}/part/1/instructions?topic=${encodeURIComponent(topic)}`
			);
		} else {
			navigate(
				`/my/classrooms/${classroomId}/test/${
					test.testId || test.id
				}/part/${part}`
			);
		}
	};

	// Helper functions from original SideNavBar
	const getTeacherTestsForPart1 = () => {
		if (hasTeacherRole && teacherTaskSummaries.testNames) {
			if (
				Array.isArray(teacherTaskSummaries.testNames) &&
				teacherTaskSummaries.testNames[0]?.testId
			) {
				return teacherTaskSummaries.testNames;
			}
			return teacherTaskSummaries.testNames.map((testName, index) => ({
				testId: `test${index + 1}`,
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
				return studentTaskSummaries.testNames;
			}
			return studentTaskSummaries.testNames.map((testName, index) => ({
				testId: `test${index + 1}`,
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

	const activePart = partNumber ? `part${partNumber}` : "part1";
	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];
	const teacherTestsPart1 = getTeacherTestsForPart1();
	const studentTestsPart1 = getStudentTestsForPart1();

	return (
		<>
			<nav className={styles.bottom_nav}>
				<div className={styles.nav_container}>
					{parts.map((part) => (
						<button
							key={part.id}
							className={`${styles.nav_item} ${
								partNumber === part.id ? styles.active : ""
							}`}
							onClick={() => handlePartSelect(part.id)}
							aria-label={part.label}
						>
							{part.icon}
							<span className={styles.nav_label}>{part.label}</span>
						</button>
					))}

					{/* Tests overflow button */}
					<button
						className={`${styles.nav_item} ${styles.tests_button}`}
						onClick={openModal}
						aria-label="View all tests"
					>
						<List size={20} />
						<span className={styles.nav_label}>Tests</span>
					</button>
				</div>
			</nav>

			{/* Test Selection Modal - Organized like original sidebar */}
			{isOpen && (
				<Modal
					modalRef={modalRef}
					closeModal={closeModal}
					modalTitle="Select Test"
				>
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
													testId === test.testId &&
													selectedSection === "teacher"
														? styles.active_test
														: ""
												}`}
												onClick={() => handleTestSelect(test, 1, "teacher")}
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
											onClick={() => handleTestSelect(test, 1, "student")}
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
													testId === item.testId &&
													selectedSection === "teacher"
														? styles.active_test
														: ""
												}`}
												onClick={() =>
													handleTestSelect(item, partNumber || 1, "teacher")
												}
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
											onClick={() =>
												handleTestSelect(item, partNumber || 1, "student")
											}
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
				</Modal>
			)}
		</>
	);
};

export default MobileBottomNav;
