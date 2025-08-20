import { useEffect, useState } from "react";
import {
	fetchAllTeachers,
	assignTeachersToClass,
	fetchAllClassesAndTeachers,
	deleteClass,
} from "@/api/admin/admin";

import { AdminList, ListItem } from "@/components/AdminList";
import { ClassItem } from "@/components/ClassItem";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import ClassInvite from "@/components/ClassInvite/ClassInvite";
import useAdminList from "@/hooks/useAdminList";
import BatchCreateClasses from "./BatchCreateClassesNew";

import styles from "@/components/AdminList/AdminList.module.css"; // Use shared admin list styles

const AdminClasses = () => {
	const [allTeachers, setAllTeachers] = useState([]);
	const [selectedClassForCode, setSelectedClassForCode] = useState(null);
	const [currentSort, setCurrentSort] = useState("name-asc");

	// Modal for class code display
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	// Load classes function for the hook
	const loadClasses = async () => {
		const res = await fetchAllClassesAndTeachers();
		return res.data;
	};

	// Delete function for individual classes
	const deleteClassItem = async (classItem) => {
		await deleteClass(classItem.id);
	};

	// Use the admin list hook
	const adminList = useAdminList({
		loadItems: loadClasses,
		deleteItem: deleteClassItem,
		itemName: "class",
		itemNamePlural: "classes",
	});

	const {
		items: classes,
		loading,
		selectedItems: selectedClasses,
		handleSelectionChange,
		confirmSingleDelete,
		confirmBulkDelete,
		handleDeleteConfirm,
		cancelDelete,
		itemToDelete: classToDelete,
		bulkDelete,
		deleteConfirmText,
		setDeleteConfirmText,
		modalRef: deleteModalRef,
		isDeleteModalOpen,
		refreshItems: refreshClasses,
		bulkActions,
	} = adminList;

	// Sort options for classes
	const classSortOptions = [
		{ key: "name-asc", label: "Class Name A-Z" },
		{ key: "name-desc", label: "Class Name Z-A" },
		{ key: "code-asc", label: "Class Code A-Z" },
		{ key: "code-desc", label: "Class Code Z-A" },
	];

	// Sort function
	const sortClasses = (classes, sortKey) => {
		return [...classes].sort((a, b) => {
			switch (sortKey) {
				case "name-asc":
					return a.name.localeCompare(b.name);
				case "name-desc":
					return b.name.localeCompare(a.name);
				case "code-asc":
					return a.code.localeCompare(b.code);
				case "code-desc":
					return b.code.localeCompare(a.code);
				default:
					return 0;
			}
		});
	};

	// Handle sort change
	const handleSortChange = (sortKey) => {
		setCurrentSort(sortKey);
	};

	// Sort classes based on current sort
	const sortedClasses = sortClasses(classes, currentSort);

	useEffect(() => {
		const load = async () => {
			const teacherRes = await fetchAllTeachers();
			setAllTeachers(teacherRes.data);
		};
		load();
	}, []);

	// Render individual class item
	const renderClassItem = (cls, { isSelected, onSelect }) => {
		// Handler for showing class code
		const handleShowClassCode = () => {
			setSelectedClassForCode(cls);
			openModal();
		};

		const actions = [
			{
				label: "Show Class Code",
				handler: () => handleShowClassCode(),
			},
			{
				label: "Delete",
				handler: () => confirmSingleDelete(cls),
			},
		];

		// Handler for teacher assignment
		const handleTeacherAssignment = async (classId, teacherIds) => {
			await assignTeachersToClass(classId, teacherIds);
			await refreshClasses();
		};

		return (
			<ListItem
				key={cls.id}
				id={cls.id}
				isSelected={isSelected}
				onSelect={onSelect}
				actions={actions}
				renderContent={() => (
					<ClassItem
						classItem={cls}
						allTeachers={allTeachers}
						onTeacherAssignment={handleTeacherAssignment}
					/>
				)}
			/>
		);
	};

	// Bulk actions for classes
	const classBulkActions = [
		{
			key: "delete",
			label: `Delete Selected ${adminList.itemNamePlural}`,
			disabled: selectedClasses.size === 0,
		},
	];

	// Handle bulk action selection
	const handleBulkActionSelect = (actionKey, selectedItems) => {
		if (actionKey === "delete") {
			confirmBulkDelete();
		}
	};

	return (
		<section>
			<AdminList
				items={sortedClasses}
				loading={loading}
				selectedItems={selectedClasses}
				onSelectionChange={handleSelectionChange}
				onBulkAction={handleBulkActionSelect}
				bulkActions={classBulkActions}
				renderItem={renderClassItem}
				emptyMessage="No classes found."
				loadingMessage="Loading classes..."
				className={styles.adminList}
				sortOptions={classSortOptions}
				currentSort={currentSort}
				onSortChange={handleSortChange}
			/>

			<BatchCreateClasses onClassCreated={refreshClasses} />

			{/* Class Code Modal */}
			{isOpen && selectedClassForCode && (
				<Modal
					modalRef={modalRef}
					closeModal={() => {
						closeModal();
						setSelectedClassForCode(null);
					}}
					modalTitle={`Join class: ${selectedClassForCode.name}`}
				>
					<ClassInvite
						classCode={selectedClassForCode.code}
						joinUrl={`/join?classCode=${selectedClassForCode.code}`}
						signupUrl={`/signup/${selectedClassForCode.code}`}
						onClose={() => {
							closeModal();
							setSelectedClassForCode(null);
						}}
					/>
				</Modal>
			)}

			{/* Delete Confirmation Modal */}
			<AdminDeleteModal
				isOpen={isDeleteModalOpen}
				modalRef={deleteModalRef}
				onClose={cancelDelete}
				onConfirm={handleDeleteConfirm}
				itemName="class"
				itemNamePlural="classes"
				itemToDelete={classToDelete}
				bulkDelete={bulkDelete}
				selectedCount={selectedClasses.size}
				confirmText={deleteConfirmText}
				onConfirmTextChange={setDeleteConfirmText}
				requiresTypeDelete={true}
			/>
		</section>
	);
};

export default AdminClasses;
