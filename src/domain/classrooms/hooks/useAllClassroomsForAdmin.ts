import { useQuery } from "@tanstack/react-query";

import { getAllClassroomsForAdmin } from "../api/classroomApi";
import type { ClassroomSummary } from "../types/ClassroomSummary";

export const allClassroomsQueryKey = () =>
	["classrooms", "admin", "all"] as const;

export function useAllClassroomsForAdmin() {
	return useQuery<ClassroomSummary[]>({
		queryKey: allClassroomsQueryKey(),
		queryFn: getAllClassroomsForAdmin,
	});
}
