import { useMutation, useQueryClient } from "@tanstack/react-query";

import { batchDeleteClassrooms } from "../api/classroomApi";
import { classroomsQueryKey } from "./useClassrooms";

export function useBatchDeleteClassrooms(userId: number | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (classroomIds: number[]) => batchDeleteClassrooms(classroomIds),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: classroomsQueryKey(userId ?? 0),
			});
		},
	});
}
