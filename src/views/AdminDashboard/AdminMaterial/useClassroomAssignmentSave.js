import { useCallback } from "react";

import { useUpdateClassroomMaterials } from "@/domain/classrooms/hooks/useUpdateClassroomMaterials";

import { createAssignmentsPayload } from "./classroomAssignmentUtils";

const useClassroomAssignmentSave = ({
	selectedClassId,
	libraryMaterials,
	selectedStudentItemIds,
	selectedTeacherItemIds,
	onSaved,
}) => {
	const updateMaterials = useUpdateClassroomMaterials();

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

			await updateMaterials.mutateAsync({
				classroomId: Number(selectedClassId),
				materials: assignments,
			});
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
		updateMaterials,
	]);

	return { handleSave };
};

export default useClassroomAssignmentSave;
