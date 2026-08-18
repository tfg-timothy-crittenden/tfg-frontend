import type { SpeakingSectionStatus } from "./SpeakingSectionStatus";

export type QuestionEdit = {
	index: number;
	questionNodeId: number;
	transcriptText: string;
	/** Parsed config object returned by the backend. Structure depends on question type. */
	config: Record<string, unknown>;
	audioStorageKey: string;
};

export type SpeakingSectionEdit = {
	materialId: number;
	sectionId: number;
	status: SpeakingSectionStatus;
	materialTitle: string;
	materialDescription: string;
	partTitle: string;
	partImageStorageKey: string;
	questions: QuestionEdit[];
	part2Title: string;
	part2Questions: QuestionEdit[];
};
