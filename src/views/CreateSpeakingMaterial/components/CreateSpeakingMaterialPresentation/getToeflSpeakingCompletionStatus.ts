import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

export function getToeflSpeakingCompletionStatus(
	values: ToeflSpeakingFormValues,
) {
	return {
		materialInfoValid: values.title.trim().length > 0,

		hasPart1Image: values.part1Image != null,

		part1QuestionsValid: values.part1Questions.every(
			(question) =>
				question.transcript.trim().length > 0 && question.audio != null,
		),

		part2QuestionsValid: values.part2Questions.every(
			(question) =>
				question.transcript.trim().length > 0 && question.audio != null,
		),
	};
}
