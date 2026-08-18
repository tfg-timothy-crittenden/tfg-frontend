import { useMutation, useQueryClient } from "@tanstack/react-query";

import { joinClassroomByCode } from "../api/classroomApi";
import { classroomsQueryKey } from "./useClassrooms";

export function useJoinClassroom(userId: number | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (code: string) => joinClassroomByCode(code),
		throwOnError: false,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: classroomsQueryKey(userId ?? 0),
			});
		},
	});
}
