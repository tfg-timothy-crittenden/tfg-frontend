import { useMutation, useQueryClient } from "@tanstack/react-query";

import { publishSpeakingSection } from "../api/materialApi";
import { allSpeakingSectionsQueryKey } from "./useAllSpeakingSections";
import { draftSpeakingSectionsQueryKey } from "./useDraftSpeakingSections";
import { speakingSectionEditQueryKey } from "./useSpeakingSectionForEdit";

export function usePublishSpeakingSection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (materialId: number) => publishSpeakingSection(materialId),
		onSuccess: (_data, materialId) => {
			// Publishing moves the section from drafts → published, so both lists change.
			queryClient.invalidateQueries({
				queryKey: allSpeakingSectionsQueryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: draftSpeakingSectionsQueryKey(),
			});
			// The status field inside the edit view also changes from DRAFT to PUBLISHED.
			queryClient.invalidateQueries({
				queryKey: speakingSectionEditQueryKey(materialId),
			});
		},
	});
}
