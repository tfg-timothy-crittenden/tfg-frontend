export type ToeflSpeakingFormValues = {
	title: string;
	description?: string;

	part1Title: string;
	part1Image: File | string | null;
	part1ImageSource: File | null;

	part1Questions: {
		transcript: string;
		audio: File | string | null;
	}[];
	part1Highlights: (Record<string, unknown> | null)[];

	part2Title: string;
	part2Questions: {
		transcript: string;
		audio: File | string | null;
	}[];
};

export const defaultToeflSpeakingFormValues: ToeflSpeakingFormValues = {
	title: "",
	description: "",

	part1Title: "",
	part1Image: null,
	part1ImageSource: null,

	part1Questions: Array.from({ length: 7 }, () => ({
		transcript: "",
		audio: null,
	})),
	part1Highlights: Array.from({ length: 7 }, () => null),

	part2Title: "",
	part2Questions: Array.from({ length: 4 }, () => ({
		transcript: "",
		audio: null,
	})),
};
