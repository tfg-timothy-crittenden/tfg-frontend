import { useCallback, useEffect } from "react";

import { getClassroomMaterialsByRole } from "@/domain/classrooms/api/classroomApi";

// Fetches classes from the API

const useClassroomAssignmentSync = ({
	materialsLoaded,
	selectedClassId,
	loadAssignments,
}) => {
	const fetchClassMaterials = useCallback(
		async (classId) => {
			if (!classId) return;

			try {
				const [teacherResponse, studentResponse] = await Promise.all([
					getClassroomMaterialsByRole(Number(classId), "TEACHER"),
					getClassroomMaterialsByRole(Number(classId), "STUDENT"),
				]);

				loadAssignments(teacherResponse, studentResponse);
			} catch (err) {
				console.error("Error fetching class materials:", err);
			}
		},
		[loadAssignments],
	);

	useEffect(() => {
		if (materialsLoaded && selectedClassId) {
			fetchClassMaterials(selectedClassId);
		}
	}, [materialsLoaded, selectedClassId, fetchClassMaterials]);

	return { fetchClassMaterials };
};

export default useClassroomAssignmentSync;
