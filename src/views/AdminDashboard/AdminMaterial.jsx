import { useState, useEffect } from "react";

import TransferListItem from "@/components/TransferList/TransferListItem";
import RoleMaterialTransfer from "@/components/RoleMaterialTransger/RoleMaterialTransfer";

import styles from "./AdminMaterial.module.css";

import { fetchAllClassesAndTeachers } from "@/api/admin/admin";
import { getTestsByClassId, getAllSpeakingTests } from "@/api/tasks/tasksAPI";

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
	const [isLibraryOpen, setIsLibraryOpen] = useState(false); // globally persisted

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
			const materials = await getTestsByClassId(classId);
			return materials;
		} catch (error) {
			console.error("Error fetching class materials:", error);
			return [];
		}
	};

	const handleClassSelect = async (classId, className) => {
		setSelectedClassId(classId);
		setSelectedClassName(className);

		const classMaterials = await fetchClassMaterials(classId);
		const selectedIds = new Set(classMaterials.map((item) => item.id));

		setSelectedTeacherItemIds(new Set(selectedIds));
		setSelectedStudentItemIds(new Set(selectedIds));

		const sorted = [
			...allMaterials.filter((item) => selectedIds.has(item.id)),
			...allMaterials.filter((item) => !selectedIds.has(item.id)),
		];

		setSortedMaterials(sorted);
	};

	return (
		<div className={styles.container}>
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
							listName={selectedClassName}
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
							listName={selectedClassName}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminMaterial;
