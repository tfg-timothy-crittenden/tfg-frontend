import { useQuery } from "@tanstack/react-query";

import { getDraftSpeakingSectionSummaries } from "../api/materialApi";
import type { SpeakingSectionSummary } from "../types/SpeakingSectionSummary";

export const draftSpeakingSectionsQueryKey = () =>
	["speaking-sections", "drafts"] as const;

export function useDraftSpeakingSections() {
	return useQuery<SpeakingSectionSummary[]>({
		queryKey: draftSpeakingSectionsQueryKey(),
		queryFn: getDraftSpeakingSectionSummaries,
	});
}
