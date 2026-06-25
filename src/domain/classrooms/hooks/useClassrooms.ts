import { useQuery } from "@tanstack/react-query";

import { fetchClassroomsForUser } from "../api/classroomApi";
import type { ClassroomSummary } from "../types/ClassroomSummary";

export const classroomsQueryKey = (userId: number) =>
	["classrooms", "member", userId] as const;

export function useClassrooms(userId: number | undefined) {
	return useQuery<ClassroomSummary[]>({
		queryKey: classroomsQueryKey(userId ?? 0),
		queryFn: () => fetchClassroomsForUser(userId!),
		enabled: Boolean(userId),
	});
}
