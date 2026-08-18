import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteClassroom } from "../api/classroomApi";
import { classroomsQueryKey } from "./useClassrooms";

export function useDeleteClassroom(userId: number | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (classroomId: number) => deleteClassroom(classroomId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: classroomsQueryKey(userId ?? 0),
			});
		},
	});
}
