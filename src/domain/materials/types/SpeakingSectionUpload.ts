export type QuestionUploadInput = {
	transcriptText: string;
	audio: File;
	/** Serialized JSON string, e.g. '{"prepTimeSeconds":15}' */
	config?: string;
};

export type SpeakingSectionUploadInput = {
	materialTitle: string;
	materialDescription?: string;
	/** Provide when re-uploading an existing draft. */
	materialId?: number;
	partImage: File;
	partTitle: string;
	questions: QuestionUploadInput[];
	part2Title: string;
	/** Must contain exactly 4 questions. */
	part2Questions: QuestionUploadInput[];
};

export type QuestionUpdateInput = {
	transcriptText?: string;
	/** Serialized JSON string. */
	config?: string;
	audio?: File;
	removeAudio?: boolean;
};

export type SpeakingSectionUpdateInput = {
	materialTitle?: string;
	materialDescription?: string;
	partTitle?: string;
	partImage?: File;
	removePartImage?: boolean;
	questions?: QuestionUpdateInput[];
	part2Title?: string;
	part2Questions?: QuestionUpdateInput[];
};
