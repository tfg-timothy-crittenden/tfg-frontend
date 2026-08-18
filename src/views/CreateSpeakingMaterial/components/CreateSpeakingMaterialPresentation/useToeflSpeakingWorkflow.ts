import { useCallback } from "react";
import { useMachine } from "@xstate/react";

import { toeflSpeakingFormMachine } from "@/domain/materials/machines/toeflSpeakingFormMachine";
import { getToeflSpeakingCompletionStatus } from "./getToeflSpeakingCompletionStatus";
import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

type LoadSucceededInput = {
	materialId?: number;
	sectionStatus?: "DRAFT" | "PUBLISHED" | null;
};

export function useToeflSpeakingWorkflow() {
	const [state, send] = useMachine(toeflSpeakingFormMachine);

	const syncCompletion = useCallback(
		(values: ToeflSpeakingFormValues) => {
			send({
				type: "FORM_COMPLETION_CHANGED",
				...getToeflSpeakingCompletionStatus(values),
			});
		},
		[send],
	);

	const fieldChanged = useCallback(() => {
		send({ type: "FIELD_CHANGED" });
	}, [send]);

	return {
		state,
		context: state.context,
		isMaterialDetails: state.matches({ idle: { step: "materialDetails" } }),
		isPart1Image: state.matches({ idle: { step: "part1Image" } }),
		isPart1Questions: state.matches({ idle: { step: "part1Questions" } }),
		isPart2Questions: state.matches({ idle: { step: "part2Questions" } }),

		canSaveDraft: () => state.can({ type: "SAVE_DRAFT" }),
		canSavePublishedChanges: () =>
			state.can({ type: "SAVE_PUBLISHED_CHANGES" }),
		canPublish: () => state.can({ type: "PUBLISH" }),
		canRevert: () => state.can({ type: "REVERT" }),

		loadSucceeded: (input?: LoadSucceededInput) =>
			send({
				type: "LOAD_SUCCESS",
				materialId: input?.materialId,
				sectionStatus: input?.sectionStatus,
			}),
		loadFailed: (error: string) => send({ type: "LOAD_FAILURE", error }),
		fieldChanged,
		syncCompletion,

		draftSaveStarted: () => send({ type: "SAVE_DRAFT" }),
		draftSaveSucceeded: (materialId: number) =>
			send({ type: "DRAFT_SAVE_SUCCESS", materialId }),
		draftSaveFailed: (error: string) =>
			send({ type: "DRAFT_SAVE_FAILURE", error }),

		publishedSaveStarted: () => send({ type: "SAVE_PUBLISHED_CHANGES" }),
		publishedSaveSucceeded: () => send({ type: "PUBLISHED_SAVE_SUCCESS" }),
		publishedSaveFailed: (error: string) =>
			send({ type: "PUBLISHED_SAVE_FAILURE", error }),

		publishStarted: () => send({ type: "PUBLISH" }),
		publishSucceeded: () => send({ type: "PUBLISH_SUCCESS" }),
		publishFailed: (error: string) => send({ type: "PUBLISH_FAILURE", error }),

		revertStarted: () => send({ type: "REVERT" }),
		revertSucceeded: () => send({ type: "REVERT_SUCCESS" }),

		nextStep: () => send({ type: "NEXT_STEP" }),
		previousStep: () => send({ type: "PREVIOUS_STEP" }),
		nextQuestion: () => send({ type: "NEXT_QUESTION" }),
		previousQuestion: () => send({ type: "PREVIOUS_QUESTION" }),
		setCurrentQuestion: (index: number) =>
			send({ type: "SET_CURRENT_QUESTION", index }),
		nextPart2Question: () => send({ type: "NEXT_PART2_QUESTION" }),
		previousPart2Question: () => send({ type: "PREVIOUS_PART2_QUESTION" }),
		setCurrentPart2Question: (index: number) =>
			send({ type: "SET_CURRENT_PART2_QUESTION", index }),
	};
}
