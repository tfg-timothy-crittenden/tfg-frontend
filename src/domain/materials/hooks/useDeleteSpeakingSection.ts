import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSpeakingSection } from "../api/materialApi";
import { allSpeakingSectionsQueryKey } from "./useAllSpeakingSections";
import { draftSpeakingSectionsQueryKey } from "./useDraftSpeakingSections";

export function useDeleteSpeakingSection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (materialId: number) => deleteSpeakingSection(materialId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: allSpeakingSectionsQueryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: draftSpeakingSectionsQueryKey(),
			});
		},
	});
}
