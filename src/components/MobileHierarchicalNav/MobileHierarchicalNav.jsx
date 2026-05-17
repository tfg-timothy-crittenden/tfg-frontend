// src/components/MobileHierarchicalNav/MobileHierarchicalNav.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { List } from "lucide-react";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";
import TestSelectionModalBody from "@/components/TestSelectionModalBody/TestSelectionModalBody";
import { buildRoute } from "@/routes/routeConfig";
import { getClassroomMaterialListByRole } from "@/api/classes/classesAPI";
import styles from "./MobileHierarchicalNav.module.css";

const MobileHierarchicalNav = () => {
	const { id: classroomId, sectionId, partNumber } = useParams();
	const navigate = useNavigate();
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	const [, setIsExpanded] = useState(false);
	const [sections, setSections] = useState([]);

	// Load student and teacher materials using material API
	useEffect(() => {
		if (!classroomId) return;

		Promise.all([
			getClassroomMaterialListByRole(classroomId, "student"),
			getClassroomMaterialListByRole(classroomId, "teacher"),
		])
			.then(([student, teacher]) => {
				const all = [
					...(Array.isArray(student) ? student : []),
					...(Array.isArray(teacher) ? teacher : []),
				];
				const unique = Array.from(
					new Map(all.map((item) => [String(item.id), item])).values(),
				);
				setSections(unique);
			})
			.catch((err) => console.error("Failed to load materials:", err));
	}, [classroomId]);

	// Auto-expand when a test is selected
	useEffect(() => {
		if (sectionId && partNumber) {
			setIsExpanded(true);
		} else {
			setIsExpanded(false);
		}
	}, [sectionId, partNumber]);

	const handleTestsClick = () => {
		openModal();
	};

	const handleSectionSelect = (section, part) => {
		closeModal();
		navigate(buildRoute.sectionPart(classroomId, section.id, part));
	};

	return (
		<>
			{/* Main Navigation Container */}
			<div className={styles.mobile_nav_container}>
				{/* Parts Navigation */}
				<div className={styles.parts_nav}>
					<div
						className={`${styles.nav_container} ${
							!sectionId ? styles.centered : styles.spread
						}`}
					>
						{/* Question Toggle - Only show when test is selected */}
						{sectionId && (
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
					modalTitle="Select Section"
					FooterContent={QuestionToggleSwitch}
				>
					<TestSelectionModalBody
						sections={sections}
						partNumber={partNumber}
						sectionId={sectionId}
						onSectionSelect={handleSectionSelect}
					/>
				</Modal>
			)}
		</>
	);
};

export default MobileHierarchicalNav;
