import { useQuery } from "@tanstack/react-query";

import { getClassroomMemberRole } from "../api/classroomApi";
import type { ClassroomRole } from "../types/ClassroomRole";

export const classroomMemberRoleQueryKey = (
	classroomId: number,
	userId: number,
) => ["classrooms", "memberRole", classroomId, userId] as const;

export function useClassroomMemberRole(
	classroomId: number | undefined,
	userId: number | undefined,
) {
	return useQuery<ClassroomRole>({
		queryKey: classroomMemberRoleQueryKey(classroomId ?? 0, userId ?? 0),
		queryFn: () => getClassroomMemberRole(classroomId!, userId!),
		enabled: Boolean(classroomId) && Boolean(userId),
	});
}
