import TransferListItem from "@/components/TransferList/TransferListItem";
import RoleMaterialTransfer from "@/components/RoleMaterialTransger/RoleMaterialTransfer";
import AdminMaterialClassPanel from "./AdminMaterialClassPanel/AdminMaterialClassPanel";
import TabMenu from "@/components/TabMenu/TabMenu";

import styles from "./AdminMaterial.module.css";

import useResponsiveLayout from "@/hooks/useResponsiveLayout";

import useMaterialLibrary from "./useMaterialLibrary";
import useClassroomAssignments from "./useClassroomAssignments";

const AdminMaterial = () => {
	const { isMobile } = useResponsiveLayout();

	//
	const { libraryMaterials, materialsLoaded } = useMaterialLibrary();

	// Keep the page component thin: the hook owns selection, loading, and save state.
	const {
		activeRoleTab,
		allAssignedItemIds,
		handleCancel,
		handleSave,
		hasChanges,
		isLibraryOpen,
		selectedClassId,
		selectedClassName,
		selectClass,
		setActiveRoleTab,
		setIsLibraryOpen,
		setSelectedStudentItemIds,
		setSelectedTeacherItemIds,
		studentAssignedDisplayItems,
		teacherAssignedDisplayItems,
	} = useClassroomAssignments({ libraryMaterials, materialsLoaded });

	return (
		<div className={styles.container}>
			<AdminMaterialClassPanel
				isMobile={isMobile}
				selectedClassId={selectedClassId}
				selectClass={selectClass}
				selectedClassName={selectedClassName}
			/>

			<div
				className={`${styles.materials_container} ${
					!selectedClassId ? styles.disabled : ""
				}`}
			>
				<h2>Materials</h2>
				{/* Switch between teacher and student assignments for the selected class. */}
				<TabMenu
					activeRoleTab={activeRoleTab}
					setActiveRoleTab={setActiveRoleTab}
					tabLabels={["teacher", "student"]}
				/>

				<div className={styles.materials_container_inner}>
					{/* Render the active role's transfer list with the shared library panel. */}
					{activeRoleTab === "teacher" && (
						<RoleMaterialTransfer
							allMaterials={libraryMaterials}
							assignedItems={teacherAssignedDisplayItems}
							allAssignedItemIds={allAssignedItemIds}
							setAssignedItemsIds={setSelectedTeacherItemIds}
							ListItem={TransferListItem}
							isLibraryOpen={isLibraryOpen}
							setIsLibraryOpen={setIsLibraryOpen}
							isAssignedListVisible={!!selectedClassId}
						/>
					)}

					{activeRoleTab === "student" && (
						<RoleMaterialTransfer
							allMaterials={libraryMaterials}
							assignedItems={studentAssignedDisplayItems}
							allAssignedItemIds={allAssignedItemIds}
							setAssignedItemsIds={setSelectedStudentItemIds}
							ListItem={TransferListItem}
							isLibraryOpen={isLibraryOpen}
							setIsLibraryOpen={setIsLibraryOpen}
							isAssignedListVisible={!!selectedClassId}
						/>
					)}

					{/* Save/cancel only become available when edits are open and dirty. */}
					<div
						className={`${styles.library_section} ${
							isLibraryOpen ? "" : styles.disabled
						}`}
					>
						<button
							className={`action_button ${styles.button_confirm}`}
							onClick={handleSave}
							disabled={!isLibraryOpen || !hasChanges || !selectedClassId}
						>
							Save
						</button>
						<button
							className={`action_button ${styles.button_cancel}`}
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
