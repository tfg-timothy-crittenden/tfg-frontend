import { useState, useEffect, useRef } from "react";
import TransferListItem from "@/components/TransferList/TransferListItem";
import RoleMaterialTransfer from "@/components/RoleMaterialTransger/RoleMaterialTransfer";

import styles from "./AdminMaterial.module.css";

import { fetchAllClassesAndTeachers } from "@/api/admin/admin";
import {
	getTestsByClassId,
	getAllSpeakingTests,
	assignTestsToClassroom,
} from "@/api/tasks/tasksAPI";

const AdminMaterial = () => {
	const [classes, setClasses] = useState([]);
	const [allMaterials, setAllMaterials] = useState([]);
	const [sortedMaterials, setSortedMaterials] = useState([]);

	const [selectedTeacherItemIds, setSelectedTeacherItemIds] = useState(
		new Set()
	);
	const [selectedStudentItemIds, setSelectedStudentItemIds] = useState(
		new Set()
	);

	const [selectedClassId, setSelectedClassId] = useState(null);
	const [selectedClassName, setSelectedClassName] = useState("");

	const [activeRoleTab, setActiveRoleTab] = useState("teacher");
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const lastFetchedTeacherIds = useRef(new Set());
	const lastFetchedStudentIds = useRef(new Set());

	// Compare two sets
	const setsAreEqual = (a, b) =>
		a.size === b.size && [...a].every((val) => b.has(val));

	// Track unsaved changes
	useEffect(() => {
		const teacherChanged = !setsAreEqual(
			selectedTeacherItemIds,
			lastFetchedTeacherIds.current
		);
		const studentChanged = !setsAreEqual(
			selectedStudentItemIds,
			lastFetchedStudentIds.current
		);
		setHasChanges(teacherChanged || studentChanged);
	}, [selectedTeacherItemIds, selectedStudentItemIds]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await fetchAllClassesAndTeachers();
				setClasses(result.data);
			} catch (error) {
				console.error("Error fetching classes and teachers:", error);
			}

			try {
				const speakingTests = await getAllSpeakingTests();
				setAllMaterials(speakingTests);
				setSortedMaterials(speakingTests);
			} catch (error) {
				console.error("Error fetching speaking tests:", error);
			}
		};

		fetchData();
	}, []);

	const fetchClassMaterials = async (classId) => {
		try {
			const { teacherMaterial = [], studentMaterial = [] } =
				await getTestsByClassId(classId);

			const teacherIds = new Set(teacherMaterial.map((t) => t.id));
			const studentIds = new Set(studentMaterial.map((t) => t.id));

			setSelectedTeacherItemIds(teacherIds);
			setSelectedStudentItemIds(studentIds);

			lastFetchedTeacherIds.current = teacherIds;
			lastFetchedStudentIds.current = studentIds;

			const selectedIds = new Set([...teacherIds, ...studentIds]);

			const sorted = [
				...allMaterials.filter((item) => selectedIds.has(item.id)),
				...allMaterials.filter((item) => !selectedIds.has(item.id)),
			];
			setSortedMaterials(sorted);
		} catch (error) {
			console.error("Error fetching class materials:", error);
		}
	};

	const handleClassSelect = async (classId, className) => {
		if (hasChanges) {
			const confirmed = window.confirm(
				"You have unsaved changes. Are you sure you want to switch classes and lose your changes?"
			);
			if (!confirmed) return;
		}

		setSelectedClassId(classId);
		setSelectedClassName(className);
		await fetchClassMaterials(classId);
		setIsLibraryOpen(false);
	};

	const handleSave = async () => {
		try {
			const assignments = [];

			selectedTeacherItemIds.forEach((testId) =>
				assignments.push({ testId, role: "teacher" })
			);
			selectedStudentItemIds.forEach((testId) =>
				assignments.push({ testId, role: "student" })
			);

			await assignTestsToClassroom(selectedClassId, assignments);

			lastFetchedTeacherIds.current = new Set(selectedTeacherItemIds);
			lastFetchedStudentIds.current = new Set(selectedStudentItemIds);

			setHasChanges(false);
			setIsLibraryOpen(false);
			alert("Materials assigned successfully.");
		} catch (error) {
			console.error("Error assigning materials:", error);
			alert("Failed to assign materials.");
		}
	};

	const handleCancel = () => {
		setSelectedTeacherItemIds(new Set(lastFetchedTeacherIds.current));
		setSelectedStudentItemIds(new Set(lastFetchedStudentIds.current));
		setIsLibraryOpen(false);
	};

	return (
		<div className={styles.container}>
			{/* CLASS LIST */}
			<div className={styles.class_container}>
				<h2>Classes</h2>
				<input
					placeholder="Search classes..."
					className={styles.search_input}
				/>
				<div className="scrollable_outer">
					<ul className={`${styles.class_list} scrollable_inner`}>
						{classes.map((cls) => (
							<li
								key={cls.id}
								onClick={() => handleClassSelect(cls.id, cls.name)}
								className={`${
									cls.id === selectedClassId ? styles.selectedClass : ""
								} ${styles.listItem}`}
							>
								{cls.name}
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* MATERIAL PANEL */}
			<div className={styles.materials_container}>
				<h2>Materials</h2>

				<ul className={styles.tab_container}>
					<li
						onClick={() => setActiveRoleTab("teacher")}
						className={styles.tab}
					>
						<span
							className={`${styles.tab_text} ${
								activeRoleTab === "teacher" ? styles.active_tab : ""
							}`}
						>
							Teacher
						</span>
					</li>
					<li
						onClick={() => setActiveRoleTab("student")}
						className={styles.tab}
					>
						<span
							className={`${styles.tab_text} ${
								activeRoleTab === "student" ? styles.active_tab : ""
							}`}
						>
							Student
						</span>
					</li>
				</ul>

				<div className={styles.materials_container_inner}>
					{activeRoleTab === "teacher" && (
						<RoleMaterialTransfer
							allMaterials={sortedMaterials}
							assignedItemsIds={selectedTeacherItemIds}
							setAssignedItemsIds={setSelectedTeacherItemIds}
							ListItem={TransferListItem}
							isLibraryOpen={isLibraryOpen}
							setIsLibraryOpen={setIsLibraryOpen}
							isAssignedListVisible={!!selectedClassId}
						/>
					)}

					{activeRoleTab === "student" && (
						<RoleMaterialTransfer
							allMaterials={sortedMaterials}
							assignedItemsIds={selectedStudentItemIds}
							setAssignedItemsIds={setSelectedStudentItemIds}
							ListItem={TransferListItem}
							isLibraryOpen={isLibraryOpen}
							setIsLibraryOpen={setIsLibraryOpen}
							isAssignedListVisible={!!selectedClassId}
						/>
					)}

					<div
						className={`${styles.library_section} ${
							isLibraryOpen ? "" : styles.disabled
						}`}
					>
						<button
							className="action_button save_button"
							onClick={handleSave}
							disabled={!isLibraryOpen || !hasChanges}
						>
							Save
						</button>
						<button
							className="action_button"
							onClick={handleCancel}
							disabled={!isLibraryOpen || !hasChanges}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminMaterial;
