import { useEffect, useState, useCallback } from "react";
import { getAllTeachers } from "@/api/user/user";
import {
	getAllClassroomSummaries,
	assignTeachersToClass,
	deleteClassroom,
	batchDeleteClassrooms,
	getClassroomJoinCode,
} from "@/api/classes/classesAPI";
import { AdminList, ListItem } from "@/components/AdminList";
import { ClassItem } from "@/components/ClassItem";
import AdminDeleteModal from "@/components/AdminDeleteModal";
import Modal from "@/components/Modal/Modal";
import useModal from "@/components/Modal/useModal";
import ClassInvite from "@/components/ClassInvite/ClassInvite";
import useAdminList from "@/hooks/useAdminList";
import BatchCreateClasses from "./BatchCreateClassesNew";
import styles from "@/components/AdminList/AdminList.module.css";

const AdminClasses = () => {
	const [allTeachers, setAllTeachers] = useState([]);
	const [selectedClassForCode, setSelectedClassForCode] = useState(null);
	const [joinCode, setJoinCode] = useState("");
	const [joinCodeLoading, setJoinCodeLoading] = useState(false);
	const [currentSort, setCurrentSort] = useState("name-asc");

	// Modal for class code display
	const { modalRef, isOpen, openModal, closeModal } = useModal();

	// Use the admin list hook
	const adminList = useAdminList({
		loadItems: async () => {
			const classes = await getAllClassroomSummaries();
			return Array.isArray(classes) ? classes : [];
		},
		deleteItem: async (classItem) => {
			await deleteClassroom(classItem.id);
		},
		deleteMultipleItems: async (classroomIds) => {
			await batchDeleteClassrooms(classroomIds);
		},
		itemName: "class",
		itemNamePlural: "classes",
	});

	// Memoized handler for teacher assignment (must be after adminList is defined)
	const handleTeacherAssignment = useCallback(
		async (classId, teachers) => {
			const formatted = teachers
				.map((t) => {
					if (!t) return null;
					return {
						userId: t.userId ?? t.id,
						name: t.name,
						surname: t.surname,
					};
				})
				.filter(Boolean);
			await assignTeachersToClass(classId, formatted);
			await adminList.refreshItems();
		},
		[adminList],
	);

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
	];

	// Sort function
	const sortClasses = (classes, sortKey) => {
		return [...classes].sort((a, b) => {
			switch (sortKey) {
				case "name-asc":
					return a.name.localeCompare(b.name);
				case "name-desc":
					return b.name.localeCompare(a.name);
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
			const teachers = await getAllTeachers();
			setAllTeachers(teachers);
		};
		load();
	}, []);

	// Render individual class item
	const renderClassItem = (cls, { isSelected, onSelect }) => {
		// Handler for showing class code
		const handleShowClassCode = async () => {
			setSelectedClassForCode(cls);
			setJoinCode("");
			setJoinCodeLoading(true);
			openModal();
			try {
				const code = await getClassroomJoinCode(cls.id);
				console.log("code", code);
				setJoinCode(code);
			} catch (_e) {
				setJoinCode("");
			}
			setJoinCodeLoading(false);
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

		// Handler for teacher assignment (memoized)

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
						teachers={cls.teachers}
						allTeachers={allTeachers}
						onTeacherAssignment={handleTeacherAssignment}
					/>
				)}
			/>
		);
	};

	return (
		<section>
			<AdminList
				items={sortedClasses}
				loading={loading}
				selectedItems={selectedClasses}
				onSelectionChange={handleSelectionChange}
				onBulkAction={confirmBulkDelete}
				bulkActions={bulkActions}
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
					{joinCodeLoading ? (
						<div>Loading join code...</div>
					) : (
						<ClassInvite
							classCode={joinCode}
							joinUrl={`/join?classCode=${joinCode}`}
							signupUrl={`/signup/${joinCode}`}
							onClose={() => {
								closeModal();
								setSelectedClassForCode(null);
								setJoinCode("");
							}}
						/>
					)}
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
