import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeMemberFromClassroom } from "../api/classroomApi";
import { allClassroomsQueryKey } from "./useAllClassroomsForAdmin";
import type { RemoveMemberInput } from "../types/RemoveMemberInput";

export function useRemoveMemberFromClassroom() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ classroomId, userId }: RemoveMemberInput) =>
			removeMemberFromClassroom(classroomId, userId),
		onSuccess: () => {
			// Invalidate the admin classroom list — studentCount changes after member removal.
			queryClient.invalidateQueries({ queryKey: allClassroomsQueryKey() });
		},
	});
}
