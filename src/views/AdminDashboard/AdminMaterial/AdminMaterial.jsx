import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import TransferListItem from "@/components/TransferList/TransferListItem";
import RoleMaterialTransfer from "@/components/RoleMaterialTransger/RoleMaterialTransfer";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";
import AdminMaterialClassPanel from "./AdminMaterialClassPanel/AdminMaterialClassPanel";
import TabMenu from "@/components/TabMenu/TabMenu";

import styles from "./AdminMaterial.module.css";

import {
	getTestsByClassId,
	getAllSpeakingTests,
	assignTestsToClassroom,
} from "@/api/tasks/tasksAPI";

const AdminMaterial = () => {
	// Data state

	const [allMaterials, setAllMaterials] = useState([]);
	const [sortedMaterials, setSortedMaterials] = useState([]);

	// Assignment state
	const [selectedTeacherItemIds, setSelectedTeacherItemIds] = useState(
		new Set()
	);
	const [selectedStudentItemIds, setSelectedStudentItemIds] = useState(
		new Set()
	);

	// Current class
	const [selectedClassId, setSelectedClassId] = useState(null);
	const [selectedClassName, setSelectedClassName] = useState("");

	// UI state
	const [activeRoleTab, setActiveRoleTab] = useState("teacher");
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const { isMobile } = useResponsiveLayout();

	// Original fetched assignments
	const lastFetchedTeacherIds = useRef(new Set());
	const lastFetchedStudentIds = useRef(new Set());

	const setsAreEqual = (a, b) =>
		a.size === b.size && [...a].every((val) => b.has(val));

	// Detect unsaved changes
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

	// Adjust dropdown open state on breakpoint changes

	// Track whether materials have finished loading
	const [materialsLoaded, setMaterialsLoaded] = useState(false);

	// Fetch classes + materials
	useEffect(() => {
		const fetchData = async () => {
			try {
				const speakingTests = await getAllSpeakingTests();
				setAllMaterials(speakingTests);
				setSortedMaterials(speakingTests);
				setMaterialsLoaded(true);
			} catch (err) {
				console.error("Error fetching speaking tests:", err);
				setMaterialsLoaded(true);
			}
		};
		fetchData();
	}, []);

	// Wrap fetchClassMaterials so it always uses latest allMaterials
	const fetchClassMaterials = useCallback(
		async (classId) => {
			if (!classId) return;
			try {
				const { teacherMaterial = [], studentMaterial = [] } =
					await getTestsByClassId(classId);

				const teacherIds = new Set(teacherMaterial.map((t) => t.id));
				const studentIds = new Set(studentMaterial.map((t) => t.id));

				setSelectedTeacherItemIds(teacherIds);
				setSelectedStudentItemIds(studentIds);

				lastFetchedTeacherIds.current = teacherIds;
				lastFetchedStudentIds.current = studentIds;

				// Rebuild sorted list with CURRENT allMaterials
				const selectedIds = new Set([...teacherIds, ...studentIds]);
				const sorted = [
					...allMaterials.filter((item) => selectedIds.has(item.id)),
					...allMaterials.filter((item) => !selectedIds.has(item.id)),
				];
				setSortedMaterials(sorted);
			} catch (err) {
				console.error("Error fetching class materials:", err);
			}
		},
		[allMaterials]
	);

	const selectClass = useCallback(
		async (classObj) => {
			if (!classObj) return;
			if (hasChanges) {
				const confirmed = window.confirm(
					"You have unsaved changes. Switch classes and lose changes?"
				);
				if (!confirmed) return;
			}
			setSelectedClassId(classObj.id);
			setSelectedClassName(classObj.name);

			// If materials not yet loaded, defer fetching until they are
			if (materialsLoaded && allMaterials.length) {
				await fetchClassMaterials(classObj.id);
			}

			setIsLibraryOpen(false);
		},
		[hasChanges, materialsLoaded, allMaterials.length, fetchClassMaterials]
	);

	// When allMaterials finish loading, (re)fetch materials for the already selected class (no prompt)
	useEffect(() => {
		if (materialsLoaded && selectedClassId) {
			fetchClassMaterials(selectedClassId);
		}
	}, [materialsLoaded, selectedClassId, fetchClassMaterials]);

	// Save assignments
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
		} catch (err) {
			console.error("Error assigning materials:", err);
			alert("Failed to assign materials.");
		}
	};

	const handleCancel = () => {
		setSelectedTeacherItemIds(new Set(lastFetchedTeacherIds.current));
		setSelectedStudentItemIds(new Set(lastFetchedStudentIds.current));
		setIsLibraryOpen(false);
	};

	// Keyboard nav (only when dropdown open + mobile)

	return (
		<div className={styles.container}>
			{/* CLASS DROPDOWN / PANEL */}
			<AdminMaterialClassPanel
				isMobile={isMobile}
				selectedClassId={selectedClassId}
				selectClass={selectClass}
				selectedClassName={selectedClassName}
			/>

			{/* MATERIAL PANEL */}
			<div
				className={`${styles.materials_container} ${
					!selectedClassId ? styles.disabled : ""
				}`}
			>
				<h2>Materials</h2>
				<TabMenu
					activeRoleTab={activeRoleTab}
					setActiveRoleTab={setActiveRoleTab}
					tabLabels={["teacher", "student"]}
				/>

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
							disabled={!isLibraryOpen || !hasChanges || !selectedClassId}
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
