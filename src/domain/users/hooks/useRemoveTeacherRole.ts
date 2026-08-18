import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeTeacherRole } from "../api/userApi";
import { allTeachersQueryKey } from "./useAllTeachers";

export function useRemoveTeacherRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: removeTeacherRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: allTeachersQueryKey() });
		},
	});
}
