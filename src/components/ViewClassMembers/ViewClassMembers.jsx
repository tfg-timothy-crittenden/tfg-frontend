import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import {
	getClassroomTeachers,
	getClassroomStudents,
	removeStudentsFromClass,
} from "@/api/classes/classesAPI";

import { Users, GraduationCap } from "lucide-react";

import useAdminList from "@/hooks/useAdminList";
import { AdminList, ListItem } from "@/components/AdminList";
import { UserListItem } from "@/components/UserListItem";
import AdminDeleteModal from "@/components/AdminDeleteModal";

import {
	personSortOptions,
	sortPeople,
} from "@/components/AdminList/adminUtils";

import styles from "./ViewClassMembers.module.css";

const ViewClassMembers = ({ classroomId: propId }) => {
	const params = useParams();
	const classroomId = propId ?? params.id;

	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");
	const [teachers, setTeachers] = useState([]);
	const [studentSort, setStudentSort] = useState("name-asc");

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setErr("");

		Promise.all([
			getClassroomTeachers(classroomId),
			getClassroomStudents(classroomId),
		])
			.then(([teachersRes, studentsRes]) => {
				console.log("teachers:", teachersRes);
				if (!mounted) return;
				setTeachers(teachersRes || []);
				setInitialStudents(studentsRes || []);
			})
			.catch((e) =>
				setErr(e?.response?.data?.error || "Failed to load members"),
			)
			.finally(() => mounted && setLoading(false));

		return () => {
			mounted = false;
		};
	}, [classroomId]);

	// Memoize API loaders so useAdminList doesn't see a new function each render
	const loadStudents = useCallback(
		async () => await getClassroomStudents(classroomId),
		[classroomId],
	);

	// Single delete wraps API expecting array
	const deleteOneStudent = useCallback(
		async (student) => {
			const id = typeof student === "object" ? student?.id : student;
			if (!id) return;
			await removeStudentsFromClass(classroomId, [id]);
		},
		[classroomId],
	);

	const deleteManyStudents = useCallback(
		async (ids) => {
			const valid = (ids || []).filter(Boolean);
			if (!valid.length) return;
			await removeStudentsFromClass(classroomId, valid);
		},
		[classroomId],
	);

	const studentAdmin = useAdminList({
		loadItems: loadStudents,
		deleteItem: deleteOneStudent,
		deleteMultipleItems: deleteManyStudents,
		itemName: "student",
		itemNamePlural: "students",
	});

	const {
		items: studentItems,
		loading: studentsLoading,
		selectedItems: selectedStudents,
		handleSelectionChange: handleStudentSelectionChange,
		confirmSingleDelete: confirmDeleteStudent,
		confirmBulkDelete: confirmBulkDeleteStudents,
		handleDeleteConfirm: handleStudentDeleteConfirm,
		cancelDelete: cancelStudentDelete,
		itemToDelete: studentToDelete,
		bulkDelete: studentBulkDelete,
		deleteConfirmText: studentDeleteConfirmText,
		setDeleteConfirmText: setStudentDeleteConfirmText,
		modalRef: studentDeleteModalRef,
		isDeleteModalOpen: isStudentDeleteModalOpen,
		bulkActions: studentBulkActions,
		refreshItems: refreshStudentItems,
	} = studentAdmin;

	// Trigger a refresh when classroomId changes (after hook is ready)
	useEffect(() => {
		refreshStudentItems();
	}, [classroomId, refreshStudentItems]);

	//Usememo prevents rerender when items are selected, which would trigger fade_in effect.
	const GroupHeader = React.useMemo(
		() =>
			function GroupHeader({ icon, title, count }) {
				return (
					<div className={styles.groupHeader + " fade_in"}>
						<div className={styles.groupTitle}>
							{icon}
							<span>{title}</span>
							<span className={styles.badge}>{count}</span>
						</div>
					</div>
				);
			},
		[classroomId],
	);

	// Ensure each teacher has a unique 'id' property for AdminList
	const teacherList = (teachers || []).map((teacher) => ({
		...teacher,
		name: `${teacher.name} ${teacher.surname}`,
		id: teacher.userId,
	}));

	const renderTeacher = (teacher, { isSelected, onSelect }) => {
		return (
			<div className={styles.dumb_list_item}>
				<UserListItem user={teacher} />
			</div>
		);
	};

	// Ensure each student has a unique 'id' property for AdminList
	const studentList = (studentItems || []).map((student) => ({
		...student,
		name: `${student.name} ${student.surname}`,
		id: student.userId,
	}));

	const renderStudentItem = (student, { isSelected, onSelect }) => {
		// student already has a unique id and formatted name
		return (
			<ListItem
				id={student.id}
				isSelected={isSelected}
				onSelect={onSelect}
				actions={[
					{
						label: "Remove",
						handler: () => confirmDeleteStudent(student),
					},
				]}
				renderContent={() => <UserListItem user={student} />}
			/>
		);
	};

	return (
		<div className="full-height-mobile-content">
			<div className={styles.wrap + " " + "fade_in"}>
				<section className={styles.group}>
					<GroupHeader
						icon={<GraduationCap size={18} />}
						title="Teachers"
						count={teachers.length}
					/>
					<AdminList
						items={sortPeople(teacherList, "name-asc")}
						loading={loading}
						selectedItems={new Set()}
						onSelectionChange={() => {}}
						onBulkAction={() => {}}
						bulkActions={[]}
						renderItem={renderTeacher}
						emptyMessage="No teachers in this class."
						className={styles.adminListNoBorder}
						isActionable={false}
					/>
				</section>

				<section className={styles.group}>
					<GroupHeader
						icon={<Users size={18} />}
						title="Students"
						count={studentList.length}
					/>
					<AdminList
						items={sortPeople(studentList, studentSort)}
						loading={studentsLoading}
						selectedItems={selectedStudents}
						onSelectionChange={handleStudentSelectionChange}
						onBulkAction={(key) => {
							if (key === "delete") confirmBulkDeleteStudents();
						}}
						bulkActions={studentBulkActions}
						renderItem={renderStudentItem}
						emptyMessage="No students in this class."
						className={styles.adminListNoBorder}
						sortOptions={personSortOptions}
						currentSort={studentSort}
						onSortChange={setStudentSort}
						isActionable={true}
					/>

					<AdminDeleteModal
						isOpen={isStudentDeleteModalOpen}
						modalRef={studentDeleteModalRef}
						onClose={cancelStudentDelete}
						onConfirm={handleStudentDeleteConfirm}
						itemName="student"
						itemNamePlural="students"
						itemToDelete={studentToDelete}
						bulkDelete={studentBulkDelete}
						selectedCount={selectedStudents ? selectedStudents.size : 0}
						confirmText={studentDeleteConfirmText}
						onConfirmTextChange={setStudentDeleteConfirmText}
						requiresTypeDelete={true}
					/>
				</section>
			</div>
		</div>
	);
};

export default ViewClassMembers;
