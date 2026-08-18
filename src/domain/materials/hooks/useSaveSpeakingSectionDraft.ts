import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveSpeakingSectionDraft } from "../api/materialApi";
import { allSpeakingSectionsQueryKey } from "./useAllSpeakingSections";
import { draftSpeakingSectionsQueryKey } from "./useDraftSpeakingSections";

export function useSaveSpeakingSectionDraft() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (formData: FormData) => saveSpeakingSectionDraft(formData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: draftSpeakingSectionsQueryKey(),
			});
			// Invalidate all summaries too — a re-upload of an existing draft
			// (materialId provided) could update its title in the published list.
			queryClient.invalidateQueries({
				queryKey: allSpeakingSectionsQueryKey(),
			});
		},
	});
}
