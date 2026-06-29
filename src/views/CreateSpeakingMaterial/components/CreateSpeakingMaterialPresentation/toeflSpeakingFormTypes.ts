export type ToeflSpeakingFormValues = {
	title: string;
	description?: string;

	part1Image: File | string | null;

	part1Questions: {
		transcript: string;
		audio: File | string | null;
	}[];

	part2Questions: {
		transcript: string;
		audio: File | string | null;
	}[];
};

export const defaultToeflSpeakingFormValues: ToeflSpeakingFormValues = {
	title: "",
	description: "",

	part1Image: null,

	part1Questions: Array.from({ length: 7 }, () => ({
		transcript: "",
		audio: null,
	})),

	part2Questions: Array.from({ length: 4 }, () => ({
		transcript: "",
		audio: null,
	})),
};
