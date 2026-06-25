import { useMutation } from "@tanstack/react-query";

import { updateClassroomMaterials } from "../api/classroomApi";
import type { ClassroomMaterialAssignment } from "../types/ClassroomMaterial";

type UpdateClassroomMaterialsInput = {
	classroomId: number;
	materials: ClassroomMaterialAssignment[];
};

export function useUpdateClassroomMaterials() {
	return useMutation({
		mutationFn: ({ classroomId, materials }: UpdateClassroomMaterialsInput) =>
			updateClassroomMaterials(classroomId, materials),
	});
}
