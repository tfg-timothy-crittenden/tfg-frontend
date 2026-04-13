import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	areSetsEqual,
	buildAssignedDisplayItems,
	buildAssignedMaterialsLookup,
	normalizeRoleMaterialItems,
	toMaterialIdSet,
} from "./classroomAssignmentUtils";

const useClassroomAssignmentDraft = ({ libraryMaterials }) => {
	const [selectedTeacherItemIds, setSelectedTeacherItemIds] = useState(
		new Set(),
	);
	const [selectedStudentItemIds, setSelectedStudentItemIds] = useState(
		new Set(),
	);
	const [assignedMaterialsById, setAssignedMaterialsById] = useState({});
	const [hasChanges, setHasChanges] = useState(false);

	const lastFetchedTeacherIds = useRef(new Set());
	const lastFetchedStudentIds = useRef(new Set());

	useEffect(() => {
		const teacherChanged = !areSetsEqual(
			selectedTeacherItemIds,
			lastFetchedTeacherIds.current,
		);
		const studentChanged = !areSetsEqual(
			selectedStudentItemIds,
			lastFetchedStudentIds.current,
		);
		setHasChanges(teacherChanged || studentChanged);
	}, [selectedTeacherItemIds, selectedStudentItemIds]);

	const loadAssignments = useCallback((teacherResponse, studentResponse) => {
		const teacherItems = normalizeRoleMaterialItems(teacherResponse);
		const studentItems = normalizeRoleMaterialItems(studentResponse);
		const teacherIds = toMaterialIdSet(teacherItems);
		const studentIds = toMaterialIdSet(studentItems);

		setSelectedTeacherItemIds(teacherIds);
		setSelectedStudentItemIds(studentIds);
		setAssignedMaterialsById(
			buildAssignedMaterialsLookup(teacherItems, studentItems),
		);
		lastFetchedTeacherIds.current = teacherIds;
		lastFetchedStudentIds.current = studentIds;
	}, []);

	const cancelChanges = useCallback(() => {
		setSelectedTeacherItemIds(new Set(lastFetchedTeacherIds.current));
		setSelectedStudentItemIds(new Set(lastFetchedStudentIds.current));
	}, []);

	const commitChanges = useCallback(() => {
		lastFetchedTeacherIds.current = new Set(selectedTeacherItemIds);
		lastFetchedStudentIds.current = new Set(selectedStudentItemIds);
		setHasChanges(false);
	}, [selectedTeacherItemIds, selectedStudentItemIds]);

	const allAssignedItemIds = useMemo(
		() => new Set([...selectedTeacherItemIds, ...selectedStudentItemIds]),
		[selectedTeacherItemIds, selectedStudentItemIds],
	);

	const teacherAssignedDisplayItems = useMemo(
		() =>
			buildAssignedDisplayItems({
				assignedIds: selectedTeacherItemIds,
				libraryMaterials,
				assignedMaterialsById,
			}),
		[selectedTeacherItemIds, libraryMaterials, assignedMaterialsById],
	);

	const studentAssignedDisplayItems = useMemo(
		() =>
			buildAssignedDisplayItems({
				assignedIds: selectedStudentItemIds,
				libraryMaterials,
				assignedMaterialsById,
			}),
		[selectedStudentItemIds, libraryMaterials, assignedMaterialsById],
	);

	return {
		allAssignedItemIds,
		cancelChanges,
		commitChanges,
		hasChanges,
		loadAssignments,
		selectedStudentItemIds,
		selectedTeacherItemIds,
		setSelectedStudentItemIds,
		setSelectedTeacherItemIds,
		studentAssignedDisplayItems,
		teacherAssignedDisplayItems,
	};
};

export default useClassroomAssignmentDraft;
