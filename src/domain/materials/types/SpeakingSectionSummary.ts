import type { SpeakingSectionStatus } from "./SpeakingSectionStatus";

export type SpeakingSectionSummary = {
	materialId: number;
	sectionId: number;
	sectionTitle: string;
	part1Id: number;
	part1Title: string;
	part2Id: number;
	part2Title: string;
	status: SpeakingSectionStatus;
	createdAt: string;
	updatedAt: string;
};
