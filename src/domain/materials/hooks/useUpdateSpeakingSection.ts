import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSpeakingSection } from "../api/materialApi";
import { speakingSectionEditQueryKey } from "./useSpeakingSectionForEdit";

type UpdateSpeakingSectionInput = {
	materialId: number;
	formData: FormData;
};

export function useUpdateSpeakingSection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ materialId, formData }: UpdateSpeakingSectionInput) =>
			updateSpeakingSection(materialId, formData),
		onSuccess: (_data, { materialId }) => {
			// Only the specific section's edit data changes — summaries are unaffected
			// unless the title/description was updated, but we don't track that granularly.
			// Invalidating the edit query is sufficient; let the user trigger a summary
			// refresh if needed (e.g. navigating back to the list).
			queryClient.invalidateQueries({
				queryKey: speakingSectionEditQueryKey(materialId),
			});
		},
	});
}
