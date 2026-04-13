import { useCallback } from "react";

import { updateClassroomMaterials } from "@/api/classes/classesAPI";

import { createAssignmentsPayload } from "./classroomAssignmentUtils";

const useClassroomAssignmentSave = ({
	selectedClassId,
	libraryMaterials,
	selectedStudentItemIds,
	selectedTeacherItemIds,
	onSaved,
}) => {
	const handleSave = useCallback(async () => {
		try {
			const assignments = createAssignmentsPayload(
				selectedTeacherItemIds,
				selectedStudentItemIds,
				libraryMaterials,
			);

			console.log("Save payload:", {
				classroomId: selectedClassId,
				materials: assignments,
				teacherCount: selectedTeacherItemIds.size,
				studentCount: selectedStudentItemIds.size,
			});

			await updateClassroomMaterials(selectedClassId, assignments);
			onSaved();
			alert("Materials assigned successfully.");
		} catch (err) {
			console.error("Error assigning materials:", err);
			alert("Failed to assign materials.");
		}
	}, [
		selectedClassId,
		libraryMaterials,
		selectedTeacherItemIds,
		selectedStudentItemIds,
		onSaved,
	]);

	return { handleSave };
};

export default useClassroomAssignmentSave;
