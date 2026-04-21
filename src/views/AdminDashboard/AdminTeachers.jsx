import { useState } from "react";
import {
	fetchInvitedTeachers,
	cancelInvite,
	resendInvite,
	fetchActiveTeachers,
	removeTeacherFromSchool,
} from "@/api/admin/admin";

import { getAllTeachers } from "@/api/user/user";

import BatchInviteTeachers from "./BatchInviteTeachersNew";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import { AdminList, ListItem } from "@/components/AdminList";
import { UserListItem } from "@/components/UserListItem";
import useAdminList from "@/hooks/useAdminList";
import styles from "@/components/AdminList/AdminList.module.css"; // Use shared admin list styles

const AdminTeachers = () => {
	const [currentSort, setCurrentSort] = useState("name-asc");

	// Load all teachers
	const loadTeachers = async () => {
		return await getAllTeachers();
	};

	// Delete function for individual teachers
	const deleteTeacher = async (teacher) => {
		await removeTeacherFromSchool(teacher.id);
	};

	// Use the admin list hook
	const adminList = useAdminList({
		loadItems: loadTeachers,
		deleteItem: deleteTeacher,
		itemName: "teacher",
		itemNamePlural: "teachers",
	});

	const {
		items: allTeachers,
		loading,
		selectedItems: selectedTeachers,
		handleSelectionChange,
		confirmSingleDelete,
		confirmBulkDelete,
		handleDeleteConfirm,
		cancelDelete,
		itemToDelete: teacherToDelete,
		bulkDelete,
		deleteConfirmText,
		setDeleteConfirmText,
		modalRef,
		isDeleteModalOpen,
		refreshItems: loadAllTeachers,
		bulkActions,
	} = adminList;

	// Sort options for teachers
	const teacherSortOptions = [
		{ key: "name-asc", label: "First Name A-Z" },
		{ key: "name-desc", label: "First Name Z-A" },
		{ key: "surname-asc", label: "Surname A-Z" },
		{ key: "surname-desc", label: "Surname Z-A" },
		{ key: "email-asc", label: "Email A-Z" },
		{ key: "email-desc", label: "Email Z-A" },
	];

	// Sort function
	const sortTeachers = (teachers, sortKey) => {
		return [...teachers].sort((a, b) => {
			switch (sortKey) {
				case "name-asc":
					return a.name.localeCompare(b.name);
				case "name-desc":
					return b.name.localeCompare(a.name);
				case "surname-asc": {
					const surnameA = a.name.split(" ").pop() || "";
					const surnameB = b.name.split(" ").pop() || "";
					return surnameA.localeCompare(surnameB);
				}
				case "surname-desc": {
					const surnameA = a.name.split(" ").pop() || "";
					const surnameB = b.name.split(" ").pop() || "";
					return surnameB.localeCompare(surnameA);
				}
				case "email-asc":
					return a.email.localeCompare(b.email);
				case "email-desc":
					return b.email.localeCompare(a.email);
				default:
					return 0;
			}
		});
	};

	// Handle sort change
	const handleSortChange = (sortKey) => {
		setCurrentSort(sortKey);
	};

	// Sort teachers based on current sort
	const sortedTeachers = sortTeachers(allTeachers, currentSort);

	const handleIndividualRemove = (teacher) => {
		confirmSingleDelete(teacher);
	};

	// Render individual teacher item
	const renderTeacherItem = (teacher, { isSelected, onSelect }) => {
		const actions = [
			{
				label: "Remove",
				handler: () => handleIndividualRemove(teacher),
			},
		];

		return (
			<ListItem
				key={teacher.id}
				id={teacher.id}
				isSelected={isSelected}
				onSelect={onSelect}
				actions={actions}
				renderContent={() => (
					<UserListItem
						user={{
							...teacher,
							// Combine name and surname if both exist
							name: teacher.surname
								? `${teacher.name} ${teacher.surname}`
								: teacher.name,
						}}
					/>
				)}
			/>
		);
	};

	// Custom bulk actions (only delete)
	const customBulkActions = [
		{
			key: "delete",
			label: `Delete Selected ${adminList.itemNamePlural}`,
			disabled: selectedTeachers.size === 0,
		},
	];

	// Handle bulk action selection
	const handleBulkActionSelect = (actionKey, selectedItems) => {
		if (actionKey === "delete") {
			confirmBulkDelete();
		}
	};

	// Get teachers to be deleted for display in modal
	const getTeachersToDelete = () => {
		if (bulkDelete) {
			return allTeachers.filter((teacher) => selectedTeachers.has(teacher.id));
		} else if (teacherToDelete) {
			return allTeachers.filter((teacher) => teacher.id === teacherToDelete);
		}
		return [];
	};

	return (
		<section>
			<AdminList
				items={sortedTeachers}
				loading={loading}
				selectedItems={selectedTeachers}
				onSelectionChange={handleSelectionChange}
				onBulkAction={handleBulkActionSelect}
				bulkActions={customBulkActions}
				renderItem={renderTeacherItem}
				emptyMessage="No teachers found."
				loadingMessage="Loading teachers..."
				className={styles.adminList}
				sortOptions={teacherSortOptions}
				currentSort={currentSort}
				onSortChange={handleSortChange}
			/>

			<BatchInviteTeachers onInviteComplete={loadAllTeachers} />

			{/* Delete Confirmation Modal */}
			<AdminDeleteModal
				isOpen={isDeleteModalOpen}
				modalRef={modalRef}
				onClose={cancelDelete}
				onConfirm={handleDeleteConfirm}
				itemName="teacher"
				itemNamePlural="teachers"
				itemToDelete={teacherToDelete}
				bulkDelete={bulkDelete}
				selectedCount={selectedTeachers.size}
				confirmText={deleteConfirmText}
				onConfirmTextChange={setDeleteConfirmText}
				requiresTypeDelete={true}
			/>
		</section>
	);
};

export default AdminTeachers;
