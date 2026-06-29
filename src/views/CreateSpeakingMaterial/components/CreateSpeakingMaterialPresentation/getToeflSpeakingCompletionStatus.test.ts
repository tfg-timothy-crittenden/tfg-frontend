import { describe, expect, it } from "vitest";
import { getToeflSpeakingCompletionStatus } from "./getToeflSpeakingCompletionStatus";
import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

// ─── helpers ────────────────────────────────────────────────────────────────

const mockAudioFile = new File(["audio"], "q.mp3", { type: "audio/mpeg" });

function makeQuestion(
	transcript: string,
	audio: File | string | null,
): ToeflSpeakingFormValues["part1Questions"][number] {
	return { transcript, audio };
}

function makeCompleteQuestion(index = 0) {
	return makeQuestion(`Transcript for question ${index}`, mockAudioFile);
}

function makeValues(
	overrides: Partial<ToeflSpeakingFormValues> = {},
): ToeflSpeakingFormValues {
	return {
		title: "My material",
		description: "",
		part1Image: new File(["img"], "image.png", { type: "image/png" }),
		part1Questions: Array.from({ length: 7 }, (_, i) =>
			makeCompleteQuestion(i),
		),
		part2Questions: Array.from({ length: 4 }, (_, i) =>
			makeCompleteQuestion(i),
		),
		...overrides,
	};
}

// ─── materialInfoValid ────────────────────────────────────────────────────────

describe("getToeflSpeakingCompletionStatus — materialInfoValid", () => {
	it("is false when title is empty", () => {
		const { materialInfoValid } = getToeflSpeakingCompletionStatus(
			makeValues({ title: "" }),
		);
		expect(materialInfoValid).toBe(false);
	});

	it("is false when title is whitespace only", () => {
		const { materialInfoValid } = getToeflSpeakingCompletionStatus(
			makeValues({ title: "   " }),
		);
		expect(materialInfoValid).toBe(false);
	});

	it("is true when title has content", () => {
		const { materialInfoValid } = getToeflSpeakingCompletionStatus(
			makeValues({ title: "TOEFL Speaking Test" }),
		);
		expect(materialInfoValid).toBe(true);
	});
});

// ─── hasPart1Image ────────────────────────────────────────────────────────────

describe("getToeflSpeakingCompletionStatus — hasPart1Image", () => {
	it("is false when part1Image is null", () => {
		const { hasPart1Image } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Image: null }),
		);
		expect(hasPart1Image).toBe(false);
	});

	it("is true when part1Image is a File", () => {
		const { hasPart1Image } = getToeflSpeakingCompletionStatus(
			makeValues({
				part1Image: new File(["img"], "image.png", { type: "image/png" }),
			}),
		);
		expect(hasPart1Image).toBe(true);
	});

	it("is true when part1Image is an existing URL string", () => {
		const { hasPart1Image } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Image: "https://example.com/image.png" }),
		);
		expect(hasPart1Image).toBe(true);
	});
});

// ─── part1QuestionsValid ──────────────────────────────────────────────────────

describe("getToeflSpeakingCompletionStatus — part1QuestionsValid", () => {
	it("is true when all 7 questions have transcript and audio", () => {
		const { part1QuestionsValid } =
			getToeflSpeakingCompletionStatus(makeValues());
		expect(part1QuestionsValid).toBe(true);
	});

	it("is false when one question is missing a transcript", () => {
		const questions = Array.from({ length: 7 }, (_, i) =>
			makeCompleteQuestion(i),
		);
		questions[3] = makeQuestion("", mockAudioFile);

		const { part1QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Questions: questions }),
		);
		expect(part1QuestionsValid).toBe(false);
	});

	it("is false when one question has a whitespace-only transcript", () => {
		const questions = Array.from({ length: 7 }, (_, i) =>
			makeCompleteQuestion(i),
		);
		questions[0] = makeQuestion("   ", mockAudioFile);

		const { part1QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Questions: questions }),
		);
		expect(part1QuestionsValid).toBe(false);
	});

	it("is false when one question is missing audio", () => {
		const questions = Array.from({ length: 7 }, (_, i) =>
			makeCompleteQuestion(i),
		);
		questions[6] = makeQuestion("A transcript", null);

		const { part1QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Questions: questions }),
		);
		expect(part1QuestionsValid).toBe(false);
	});

	it("is true when audio is an existing URL string", () => {
		const questions = Array.from({ length: 7 }, (_, i) =>
			makeQuestion(`Transcript ${i}`, "https://example.com/audio.mp3"),
		);

		const { part1QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Questions: questions }),
		);
		expect(part1QuestionsValid).toBe(true);
	});

	it("is false when all questions are empty", () => {
		const questions = Array.from({ length: 7 }, () => makeQuestion("", null));

		const { part1QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part1Questions: questions }),
		);
		expect(part1QuestionsValid).toBe(false);
	});
});

// ─── part2QuestionsValid ──────────────────────────────────────────────────────

describe("getToeflSpeakingCompletionStatus — part2QuestionsValid", () => {
	it("is true when all 4 questions have transcript and audio", () => {
		const { part2QuestionsValid } =
			getToeflSpeakingCompletionStatus(makeValues());
		expect(part2QuestionsValid).toBe(true);
	});

	it("is false when one question is missing a transcript", () => {
		const questions = Array.from({ length: 4 }, (_, i) =>
			makeCompleteQuestion(i),
		);
		questions[1] = makeQuestion("", mockAudioFile);

		const { part2QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part2Questions: questions }),
		);
		expect(part2QuestionsValid).toBe(false);
	});

	it("is false when one question is missing audio", () => {
		const questions = Array.from({ length: 4 }, (_, i) =>
			makeCompleteQuestion(i),
		);
		questions[2] = makeQuestion("Some transcript", null);

		const { part2QuestionsValid } = getToeflSpeakingCompletionStatus(
			makeValues({ part2Questions: questions }),
		);
		expect(part2QuestionsValid).toBe(false);
	});
});

// ─── combined output ──────────────────────────────────────────────────────────

describe("getToeflSpeakingCompletionStatus — combined", () => {
	it("returns all true for a fully complete form", () => {
		expect(getToeflSpeakingCompletionStatus(makeValues())).toEqual({
			materialInfoValid: true,
			hasPart1Image: true,
			part1QuestionsValid: true,
			part2QuestionsValid: true,
		});
	});

	it("returns all false for an empty form", () => {
		const empty: ToeflSpeakingFormValues = {
			title: "",
			description: "",
			part1Image: null,
			part1Questions: Array.from({ length: 7 }, () => makeQuestion("", null)),
			part2Questions: Array.from({ length: 4 }, () => makeQuestion("", null)),
		};

		expect(getToeflSpeakingCompletionStatus(empty)).toEqual({
			materialInfoValid: false,
			hasPart1Image: false,
			part1QuestionsValid: false,
			part2QuestionsValid: false,
		});
	});

	it("each flag is independent — partial completion is reflected accurately", () => {
		const values = makeValues({
			title: "", // materialInfoValid → false
			part1Image: null, // hasPart1Image     → false
			// part1Questions and part2Questions remain complete
		});

		expect(getToeflSpeakingCompletionStatus(values)).toEqual({
			materialInfoValid: false,
			hasPart1Image: false,
			part1QuestionsValid: true,
			part2QuestionsValid: true,
		});
	});
});
