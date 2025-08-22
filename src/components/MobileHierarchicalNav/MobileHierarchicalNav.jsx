// src/components/MobileHierarchicalNav/MobileHierarchicalNav.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { List } from "lucide-react";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import TestSelectionModalBody from "@/components/TestSelectionModalBody/TestSelectionModalBody";
import { routeMatchers } from "@/routes/routeConfig";
import { useSelector } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";
import styles from "./MobileHierarchicalNav.module.css";

const MobileHierarchicalNav = () => {
	const { id: classroomId, testId, partNumber } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [isExpanded, setIsExpanded] = useState(false);
	const [studentTaskSummaries, setStudentTaskSummaries] = useState({});
	const [teacherTaskSummaries, setTeacherTaskSummaries] = useState({});
	const [selectedSection, setSelectedSection] = useState(null);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]));

	// Load task summaries
	useEffect(() => {
		if (!classroomId) return;

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

	// Auto-expand when a test is selected
	useEffect(() => {
		if (testId && partNumber) {
			setIsExpanded(true);
		} else {
			setIsExpanded(false);
		}
	}, [testId, partNumber]);

	// Determine the current mode for the ToggleSwitch
	const getCurrentMode = () => {
		const currentMode = routeMatchers.getPartModeFromPath(location.pathname);

		switch (currentMode) {
			case "instructions":
				return "INSTRUCTIONS";
			case "prepare":
				return "PREPARE";
			case "speak":
				return "SPEAK";
			case "read":
				return "READ";
			case "listen":
				return "LISTEN";
			default:
				return "INSTRUCTIONS";
		}
	};

	// Get modeEnum based on current part
	const getModeEnumForPart = () => {
		switch (partNumber) {
			case "1":
				return {
					PREPARE: "PREPARE",
					SPEAK: "SPEAK",
				};
			case "2":
			case "3":
				return {
					read: "READ",
					LISTEN: "LISTEN",
					PREPARE: "PREPARE",
					SPEAK: "SPEAK",
				};
			case "4":
				return {
					LISTEN: "LISTEN",
					PREPARE: "PREPARE",
					SPEAK: "SPEAK",
				};
			default:
				return {};
		}
	};

	const handleTestsClick = () => {
		openModal();
	};

	const handleTestSelect = (test, part, section = null) => {
		setSelectedSection(section);
		closeModal();
		navigate(
			`/my/classrooms/${classroomId}/test/${
				test.testId || test.id
			}/part/${part}`
		);
	};

	const currentMode = getCurrentMode();
	const modeEnum = getModeEnumForPart();

	return (
		<>
			{/* Main Navigation Container */}
			<div className={styles.mobile_nav_container}>
				{/* Parts Navigation */}
				<div className={styles.parts_nav}>
					<div
						className={`${styles.nav_container} ${
							!testId ? styles.centered : styles.spread
						}`}
					>
						{/* Question Toggle - Only show when test is selected */}
						{testId && (
							<div
								className={`${styles.question_toggle_wrapper} ${styles.slide_in}`}
							>
								<QuestionToggleSwitch />
							</div>
						)}

						{/* Tests button */}
						<button
							className={`${styles.nav_item} ${styles.tests_button}`}
							onClick={handleTestsClick}
							aria-label="View all tests"
						>
							<List size={20} />
							<span className={styles.nav_label}>Tests</span>
						</button>
					</div>
				</div>
			</div>

			{/* Modal remains the same */}
			{isOpen && (
				<Modal
					modalRef={modalRef}
					closeModal={closeModal}
					modalTitle="Select Test"
					FooterContent={QuestionToggleSwitch}
				>
					<TestSelectionModalBody
						studentTaskSummaries={studentTaskSummaries}
						teacherTaskSummaries={teacherTaskSummaries}
						hasTeacherRole={hasTeacherRole}
						partNumber={partNumber}
						testId={testId}
						selectedSection={selectedSection}
						onTestSelect={handleTestSelect}
					/>
				</Modal>
			)}
		</>
	);
};

export default MobileHierarchicalNav;
