// src/components/MobileBottomNav/MobileBottomNav.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Mic, List } from "lucide-react";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import { getClassroomSpeakingSections } from "@/api/tasks/tasksAPI";
import { buildRoute } from "@/routes/routeConfig";
import TestSelectionModalBody from "@/components/TestSelectionModalBody/TestSelectionModalBody";
import styles from "./MobileBottomNav.module.css";

const MobileBottomNav = () => {
	const { id: classroomId, sectionId, partNumber } = useParams();
	const navigate = useNavigate();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [sections, setSections] = useState([]);

	// Load sections for the current classroom
	useEffect(() => {
		getClassroomSpeakingSections(classroomId)
			.then(setSections)
			.catch((err) => console.error("Failed to load speaking sections:", err));
	}, [classroomId]);

	// Part configuration
	const parts = [
		{ id: "1", label: "Part 1", icon: <Mic size={20} /> },
		{ id: "2", label: "Part 2", icon: <BookOpen size={20} /> },
	];

	const handlePartSelect = (part) => {
		if (sectionId) {
			navigate(buildRoute.sectionPart(classroomId, sectionId, part));
		} else {
			// No test selected, show available tests
			openModal();
		}
	};

	const handleSectionSelect = (section, part) => {
		closeModal();
		navigate(buildRoute.sectionPart(classroomId, section.id, part));
	};

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
									modalTitle="Select Section"
							teacherTestsPart1.length > 0 && (
									<TestSelectionModalBody
										sections={sections}
										partNumber={partNumber}
										sectionId={sectionId}
										onSectionSelect={handleSectionSelect}
									/>
			}
