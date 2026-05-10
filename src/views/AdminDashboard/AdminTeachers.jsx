import { useEffect, useState } from "react";
import { GraduationCap, MailOpen } from "lucide-react";
import { getAllTeachers, removeTeacherRole } from "@/api/user/user";
import {
	getPendingTeacherInvitations,
	batchDeletePlatformInvitations,
	resendPlatformInvitation,
} from "@/api/platformInvitation/platformInvitationAPI";

import BatchInviteTeachers from "./BatchInviteTeachersNew";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import { AdminList, ListItem } from "@/components/AdminList";
import { UserListItem } from "@/components/UserListItem";
import useAdminList from "@/hooks/useAdminList";
import styles from "@/components/AdminList/AdminList.module.css"; // Use shared admin list styles

const AdminTeachers = () => {
	const [currentSort, setCurrentSort] = useState("name-asc");
	const [pendingInvitations, setPendingInvitations] = useState([]);
	const [invitationsLoading, setInvitationsLoading] = useState(true);
	const [selectedInvitations, setSelectedInvitations] = useState(new Set());
	const [invitationSort, setInvitationSort] = useState("date-desc");

	useEffect(() => {
		loadPendingInvitations();
	}, []);

	const loadPendingInvitations = async () => {
		setInvitationsLoading(true);
		try {
			const invitations = await getPendingTeacherInvitations();
			setPendingInvitations(invitations);
			return invitations;
		} catch {
			setPendingInvitations([]);
			return [];
		} finally {
			setInvitationsLoading(false);
		}
	};

	// Load all teachers
	const loadTeachers = async () => {
		return await getAllTeachers();
	};

	// Delete function for individual teachers
	const deleteTeacher = async (teacher) => {
		await removeTeacherRole(teacher.id);
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
				label: "Remove Teacher Privileges",
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
	const handleBulkActionSelect = (actionKey, _selectedItems) => {
		if (actionKey === "delete") {
			confirmBulkDelete();
		}
	};

	// Get teachers to be deleted for display in modal
	const _getTeachersToDelete = () => {
		if (bulkDelete) {
			return allTeachers.filter((teacher) => selectedTeachers.has(teacher.id));
		} else if (teacherToDelete) {
			return allTeachers.filter((teacher) => teacher.id === teacherToDelete);
		}
		return [];
	};

	const handleInvitationBulkAction = async (actionKey, selectedItems) => {
		if (actionKey === "resend") {
			const invitationIds = Array.from(selectedItems);
			try {
				await Promise.all(
					invitationIds.map((id) => resendPlatformInvitation(id)),
				);
			} catch (error) {
				console.error("Failed to resend invitations:", error);
			}
			return;
		}
		if (actionKey !== "delete") return;
		const invitationIds = Array.from(selectedItems);
		const idSet = new Set(invitationIds.map(String));

		try {
			await batchDeletePlatformInvitations(invitationIds);
			setPendingInvitations((prev) =>
				prev.filter((inv) => !idSet.has(String(inv.id))),
			);
			setSelectedInvitations(new Set());
			await loadPendingInvitations();
		} catch (error) {
			console.error("Failed to delete platform invitations:", error);
		}
	};

	const handleResendInvitation = async (invitationId) => {
		try {
			await resendPlatformInvitation(invitationId);
		} catch (error) {
			console.error("Failed to resend invitation:", error);
		}
	};

	const handleSingleInvitationDelete = async (invitationId) => {
		try {
			await batchDeletePlatformInvitations([invitationId]);
			setPendingInvitations((prev) =>
				prev.filter((inv) => String(inv.id) !== String(invitationId)),
			);
			setSelectedInvitations((prev) => {
				const next = new Set(prev);
				next.delete(invitationId);
				next.delete(String(invitationId));
				return next;
			});
			await loadPendingInvitations();
		} catch (error) {
			console.error("Failed to delete platform invitation:", error);
		}
	};

	return (
		<section>
			<h2 className={`${styles.sectionHeading} ${styles.teachersHeading}`}>
				<GraduationCap size={20} strokeWidth={2} />
				<span>Teachers</span>
			</h2>
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

			<h2 className={`${styles.sectionHeading} ${styles.invitationsHeading}`}>
				<MailOpen size={20} strokeWidth={2} />
				<span>Pending Invitations</span>
			</h2>
			<AdminList
				items={[...pendingInvitations].sort((a, b) => {
					switch (invitationSort) {
						case "date-asc":
							return new Date(a.createdAt) - new Date(b.createdAt);
						case "date-desc":
							return new Date(b.createdAt) - new Date(a.createdAt);
						case "email-asc":
							return a.inviteeEmail.localeCompare(b.inviteeEmail);
						case "email-desc":
							return b.inviteeEmail.localeCompare(a.inviteeEmail);
						default:
							return 0;
					}
				})}
				loading={invitationsLoading}
				selectedItems={selectedInvitations}
				onSelectionChange={setSelectedInvitations}
				bulkActions={[
					{
						key: "resend",
						label: "Resend Selected Invitations",
						disabled: selectedInvitations.size === 0,
					},
					{
						key: "delete",
						label: "Delete Selected Invitations",
						disabled: selectedInvitations.size === 0,
					},
				]}
				onBulkAction={handleInvitationBulkAction}
				sortOptions={[
					{ key: "date-desc", label: "Newest First" },
					{ key: "date-asc", label: "Oldest First" },
					{ key: "email-asc", label: "Email A-Z" },
					{ key: "email-desc", label: "Email Z-A" },
				]}
				currentSort={invitationSort}
				onSortChange={setInvitationSort}
				renderItem={(inv, { isSelected, onSelect }) => (
					<ListItem
						key={inv.id}
						id={inv.id}
						isSelected={isSelected}
						onSelect={onSelect}
						actions={[
							{
								label: "Resend",
								handler: () => handleResendInvitation(inv.id),
							},
							{
								label: "Delete",
								handler: () => handleSingleInvitationDelete(inv.id),
							},
						]}
						renderContent={() => (
							<UserListItem
								user={{
									name: inv.inviteeEmail,
									email: `Invited: ${new Date(inv.createdAt).toLocaleString()} · Expires: ${new Date(inv.expiresAt).toLocaleString()}`,
									invitationStatus: inv.invitationStatus,
								}}
							/>
						)}
					/>
				)}
				emptyMessage="No pending invitations."
				loadingMessage="Loading invitations..."
				className={styles.adminList}
			/>

			<BatchInviteTeachers onInviteComplete={loadPendingInvitations} />

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
