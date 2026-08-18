import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadSpeakingSection } from "../api/materialApi";
import { allSpeakingSectionsQueryKey } from "./useAllSpeakingSections";
import { draftSpeakingSectionsQueryKey } from "./useDraftSpeakingSections";

export function useUploadSpeakingSection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (formData: FormData) => uploadSpeakingSection(formData),
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
