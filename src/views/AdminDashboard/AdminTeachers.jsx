import { useState } from "react";
import {
	fetchInvitedTeachers,
	cancelInvite,
	resendInvite,
	fetchActiveTeachers,
	removeTeacherFromSchool,
} from "@/api/admin/admin";

import BatchInviteTeachers from "./BatchInviteTeachersNew";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import { AdminList, ListItem } from "@/components/AdminList";
import { UserListItem } from "@/components/UserListItem";
import useAdminList from "@/hooks/useAdminList";
import styles from "@/components/AdminList/AdminList.module.css"; // Use shared admin list styles

const AdminTeachers = () => {
	const [currentSort, setCurrentSort] = useState("name-asc");

	// Load teachers function for the hook
	const loadTeachers = async () => {
		const [invitedRes, activeRes] = await Promise.all([
			fetchInvitedTeachers(),
			fetchActiveTeachers(),
		]);

		// Combine active and invited teachers with status
		return [
			...activeRes.data.map((teacher) => ({ ...teacher, status: "active" })),
			...invitedRes.data.map((teacher) => ({
				...teacher,
				status: "invited",
			})),
		];
	};

	// Delete function for individual teachers
	const deleteTeacher = async (teacher) => {
		if (teacher.status === "active") {
			await removeTeacherFromSchool(teacher.id);
		} else {
			await cancelInvite(teacher.id);
		}
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

	// Individual teacher actions
	const handleIndividualResend = async (teacherId) => {
		try {
			await resendInvite(teacherId);
			await loadAllTeachers();
		} catch (err) {
			console.error("Failed to resend invite:", err);
			alert("Failed to resend invite. Please try again.");
		}
	};

	const handleIndividualRemove = (teacher) => {
		confirmSingleDelete(teacher);
	};

	// Render individual teacher item
	const renderTeacherItem = (teacher, { isSelected, onSelect }) => {
		const actions = [
			...(teacher.status === "invited"
				? [
						{
							label: "Resend Invite",
							handler: () => handleIndividualResend(teacher.id),
						},
					]
				: []),
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
				renderContent={() => <UserListItem user={teacher} />}
			/>
		);
	};

	// Handle bulk resend for custom bulk actions
	const handleBulkResend = async () => {
		try {
			const resendPromises = Array.from(selectedTeachers).map((id) => {
				const teacher = allTeachers.find((t) => t.id === id);
				// Only resend for invited teachers
				if (teacher.status === "invited") {
					return resendInvite(id);
				}
				return Promise.resolve(); // Skip active teachers
			});
			await Promise.all(resendPromises);
			await loadAllTeachers();
		} catch (err) {
			console.error("Failed to resend invites:", err);
			alert("Failed to resend some invites. Please try again.");
		}
	};

	// Custom bulk actions including resend
	const customBulkActions = [
		{
			key: "resend",
			label: "Resend Invites",
			disabled: selectedTeachers.size === 0,
		},
		{
			key: "delete",
			label: `Delete Selected ${adminList.itemNamePlural}`,
			disabled: selectedTeachers.size === 0,
		},
	];

	// Handle bulk action selection
	const handleBulkActionSelect = (actionKey, selectedItems) => {
		if (actionKey === "resend") {
			handleBulkResend();
		} else if (actionKey === "delete") {
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
