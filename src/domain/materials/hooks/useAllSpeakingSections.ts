import { useQuery } from "@tanstack/react-query";

import { getAllSpeakingSectionSummaries } from "../api/materialApi";
import type { SpeakingSectionSummary } from "../types/SpeakingSectionSummary";

export const allSpeakingSectionsQueryKey = () =>
	["speaking-sections", "all"] as const;

export function useAllSpeakingSections() {
	return useQuery<SpeakingSectionSummary[]>({
		queryKey: allSpeakingSectionsQueryKey(),
		queryFn: getAllSpeakingSectionSummaries,
	});
}
