import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignTeachersToClass } from "../api/classroomApi";
import type { TeacherAssignment } from "../types/TeacherAssignment";
import { allClassroomsQueryKey } from "./useAllClassroomsForAdmin";

type AssignTeachersInput = {
	classroomId: number;
	teachers: TeacherAssignment[];
};

export function useAssignTeachersToClassroom() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ classroomId, teachers }: AssignTeachersInput) =>
			assignTeachersToClass(classroomId, teachers),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: allClassroomsQueryKey() });
		},
	});
}
