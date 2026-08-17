import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resendPlatformInvitation } from "../api/userApi";
import { pendingTeacherInvitationsQueryKey } from "./usePendingTeacherInvitations";

export function useResendPlatformInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resendPlatformInvitation,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: pendingTeacherInvitationsQueryKey(),
			});
		},
	});
}
