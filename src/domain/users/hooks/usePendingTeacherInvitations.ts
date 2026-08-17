import { useQuery } from "@tanstack/react-query";

import { getPendingTeacherInvitations } from "../api/userApi";
import type { PlatformInvitation } from "../types/PlatformInvitation";

export const pendingTeacherInvitationsQueryKey = () =>
	["users", "platform-invitations", "teachers", "pending"] as const;

export function usePendingTeacherInvitations() {
	return useQuery<PlatformInvitation[]>({
		queryKey: pendingTeacherInvitationsQueryKey(),
		queryFn: getPendingTeacherInvitations,
	});
}
