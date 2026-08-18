import { useQuery } from "@tanstack/react-query";

import { getSpeakingSectionForEdit } from "../api/materialApi";
import type { SpeakingSectionEdit } from "../types/SpeakingSectionEdit";

export const speakingSectionEditQueryKey = (materialId: number) =>
	["speaking-sections", materialId, "edit"] as const;

export function useSpeakingSectionForEdit(materialId: number | undefined) {
	return useQuery<SpeakingSectionEdit>({
		queryKey: speakingSectionEditQueryKey(materialId ?? 0),
		queryFn: () => getSpeakingSectionForEdit(materialId!),
		enabled: Boolean(materialId),
	});
}
