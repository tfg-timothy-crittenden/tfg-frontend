import { useEffect, useState } from "react";
import { useMachine } from "@xstate/react";
import { useForm } from "react-hook-form";

import { toeflSpeakingFormMachine } from "@/domain/materials/machines/toeflSpeakingFormMachine";
import {
	defaultToeflSpeakingFormValues,
	type ToeflSpeakingFormValues,
} from "./toeflSpeakingFormTypes";

import { getToeflSpeakingCompletionStatus } from "./getToeflSpeakingCompletionStatus";

export function useToeflSpeakingFormController() {
	const [state, send] = useMachine(toeflSpeakingFormMachine);

	//DELETE ONCE IMPLEMENTED: Mock the succesful loading a test first
	useEffect(() => {
		send({
			type: "LOAD_SUCCESS",
			materialId: 123,
			sectionStatus: "DRAFT",
		});
	}, []);

	const form = useForm<ToeflSpeakingFormValues>({
		defaultValues: defaultToeflSpeakingFormValues,
		mode: "onChange",
	});

	const [lastSavedValues, setLastSavedValues] =
		useState<ToeflSpeakingFormValues | null>(null);

	// RHF is the single source of truth for dirty state.
	// When isDirty flips to true the machine transitions persistence: clean → dirty.
	// Sending FIELD_CHANGED when already dirty is a no-op (machine ignores it).
	const { isDirty } = form.formState;
	useEffect(() => {
		if (isDirty) send({ type: "FIELD_CHANGED" });
	}, [isDirty, send]);

	// Use the subscription form of watch so the effect only fires when form
	// values actually change, not on every render.
	useEffect(() => {
		const subscription = form.watch((values) => {
			send({
				type: "FORM_COMPLETION_CHANGED",
				...getToeflSpeakingCompletionStatus(values as ToeflSpeakingFormValues),
			});
		});
		return () => subscription.unsubscribe();
	}, [form, send]);

	function nextStep() {
		send({ type: "NEXT_STEP" });
	}

	function previousStep() {
		send({ type: "PREVIOUS_STEP" });
	}

	async function saveDraft() {
		if (!state.can({ type: "SAVE_DRAFT" })) return;

		send({ type: "SAVE_DRAFT" });

		try {
			const values = form.getValues();

			// TODO: call generated React Query mutation here

			const response = {
				materialId: state.context.materialId ?? 123,
			};

			form.reset(values);
			setLastSavedValues(values);

			send({
				type: "DRAFT_SAVE_SUCCESS",
				materialId: response.materialId,
			});
		} catch {
			send({
				type: "DRAFT_SAVE_FAILURE",
				error: "Could not save draft",
			});
		}
	}

	async function savePublishedChanges() {
		if (!state.can({ type: "SAVE_PUBLISHED_CHANGES" })) return;

		send({ type: "SAVE_PUBLISHED_CHANGES" });

		try {
			const values = form.getValues();

			// TODO: call generated React Query update mutation here

			form.reset(values);
			setLastSavedValues(values);

			send({ type: "PUBLISHED_SAVE_SUCCESS" });
		} catch {
			send({
				type: "PUBLISHED_SAVE_FAILURE",
				error: "Could not save changes",
			});
		}
	}

	async function publish() {
		if (!state.can({ type: "PUBLISH" })) return;

		send({ type: "PUBLISH" });

		try {
			const materialId = state.context.materialId;

			if (materialId == null) {
				throw new Error("Missing material id");
			}

			// TODO: call generated React Query publish mutation here

			send({ type: "PUBLISH_SUCCESS" });
		} catch {
			send({
				type: "PUBLISH_FAILURE",
				error: "Could not publish material",
			});
		}
	}

	function revert() {
		if (!state.can({ type: "REVERT" })) return;
		if (!lastSavedValues) return;

		send({ type: "REVERT" });

		form.reset(lastSavedValues);

		send({ type: "REVERT_SUCCESS" });
	}

	const isMaterialDetails = state.matches({
		idle: { step: "materialDetails" },
	});
	const isPart1Image = state.matches({ idle: { step: "part1Image" } });
	const isPart1Questions = state.matches({ idle: { step: "part1Questions" } });
	const isPart2Questions = state.matches({ idle: { step: "part2Questions" } });

	return {
		form,
		state,
		context: state.context,

		// Step flags — use these in the component instead of inspecting state directly
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,

		nextStep,
		previousStep,

		nextQuestion: () => send({ type: "NEXT_QUESTION" }),
		previousQuestion: () => send({ type: "PREVIOUS_QUESTION" }),
		nextPart2Question: () => send({ type: "NEXT_PART2_QUESTION" }),
		previousPart2Question: () => send({ type: "PREVIOUS_PART2_QUESTION" }),

		saveDraft,
		savePublishedChanges,
		publish,
		revert,
	};
}
