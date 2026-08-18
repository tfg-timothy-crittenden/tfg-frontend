import { useMutation, useQueryClient } from "@tanstack/react-query";

import { batchDeletePlatformInvitations } from "../api/userApi";
import { pendingTeacherInvitationsQueryKey } from "./usePendingTeacherInvitations";

export function useBatchDeletePlatformInvitations() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: batchDeletePlatformInvitations,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pendingTeacherInvitationsQueryKey(),
			});
		},
	});
}
