import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClassroom } from "../api/classroomApi";
import { classroomsQueryKey } from "./useClassrooms";
import { allClassroomsQueryKey } from "./useAllClassroomsForAdmin";

type CreateClassroomInput = {
	name: string;
	description?: string;
};

export function useCreateClassroom(userId: number | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ name, description }: CreateClassroomInput) =>
			createClassroom(name, description),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: classroomsQueryKey(userId ?? 0),
			});
			queryClient.invalidateQueries({
				queryKey: allClassroomsQueryKey(),
			});
		},
	});
}
