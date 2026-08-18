import type { SpeakingSectionEdit } from "@/domain/materials/types/SpeakingSectionEdit";
import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

export type StorageUrlResolver = (
	key: string | null | undefined,
) => Promise<string | null>;

type MapSpeakingSectionEditToFormValuesInput = {
	section: SpeakingSectionEdit;
	resolveStorageUrl: StorageUrlResolver;
};

export async function mapSpeakingSectionEditToFormValues({
	section,
	resolveStorageUrl,
}: MapSpeakingSectionEditToFormValuesInput): Promise<ToeflSpeakingFormValues> {
	const [part1Image, ...questionUrls] = await Promise.all([
		resolveStorageUrl(section.partImageStorageKey),
		...section.questions.map((q) => resolveStorageUrl(q.audioStorageKey)),
	]);

	const part2QuestionUrls = await Promise.all(
		section.part2Questions.map((q) => resolveStorageUrl(q.audioStorageKey)),
	);

	return {
		title: section.materialTitle,
		description: section.materialDescription,
		part1Title: section.partTitle,
		part1Image,
		part1ImageSource: null,
		part1Questions: section.questions.map((q, i) => ({
			transcript: q.transcriptText,
			audio: questionUrls[i],
		})),
		part1Highlights: section.questions.map(
			(q) =>
				(q.config.highlight_data as Record<string, unknown> | undefined) ??
				null,
		),
		part2Title: section.part2Title,
		part2Questions: section.part2Questions.map((q, i) => ({
			transcript: q.transcriptText,
			audio: part2QuestionUrls[i],
		})),
	};
}
