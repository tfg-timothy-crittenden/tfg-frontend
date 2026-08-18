import { useQuery } from "@tanstack/react-query";

import { getAllTeachers } from "../api/userApi";
import type { User } from "../types/User";

export const allTeachersQueryKey = () => ["users", "teachers", "all"] as const;

export function useAllTeachers() {
	return useQuery<User[]>({
		queryKey: allTeachersQueryKey(),
		queryFn: getAllTeachers,
	});
}
