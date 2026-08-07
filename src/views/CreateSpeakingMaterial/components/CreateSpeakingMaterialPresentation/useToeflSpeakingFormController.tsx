import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { useForm } from "react-hook-form";

import { buildRoute } from "@/routes/routeConfig";
import { generatePresignedUrl } from "@/domain/materials/api/materialApi";

//API calls
import { usePublishSpeakingSection } from "@/domain/materials/hooks/usePublishSpeakingSection";
import { useSaveSpeakingSectionDraft } from "@/domain/materials/hooks/useSaveSpeakingSectionDraft";
import { useSpeakingSectionForEdit } from "@/domain/materials/hooks/useSpeakingSectionForEdit";
import { useUpdateSpeakingSection } from "@/domain/materials/hooks/useUpdateSpeakingSection";

import { toeflSpeakingFormMachine } from "@/domain/materials/machines/toeflSpeakingFormMachine";
import type { SpeakingSectionEdit } from "@/domain/materials/types/SpeakingSectionEdit";
import { buildSpeakingSectionFormData } from "./buildSpeakingSectionFormData";
import { getToeflSpeakingCompletionStatus } from "./getToeflSpeakingCompletionStatus";
import {
	defaultToeflSpeakingFormValues,
	type ToeflSpeakingFormValues,
} from "./toeflSpeakingFormTypes";

async function resolveStorageKey(
	key: string | null | undefined,
): Promise<string | null> {
	if (!key) return null;
	return generatePresignedUrl("toefl", key, 3600);
}

async function sectionEditToFormValues(
	section: SpeakingSectionEdit,
): Promise<ToeflSpeakingFormValues> {
	const [part1Image, ...questionUrls] = await Promise.all([
		resolveStorageKey(section.partImageStorageKey),
		...section.questions.map((q) => resolveStorageKey(q.audioStorageKey)),
	]);

	const part2QuestionUrls = await Promise.all(
		section.part2Questions.map((q) => resolveStorageKey(q.audioStorageKey)),
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

export function useToeflSpeakingFormController(materialId?: number) {
	const navigate = useNavigate();
	const [state, send] = useMachine(toeflSpeakingFormMachine);

	const sectionQuery = useSpeakingSectionForEdit(materialId);
	const saveDraftMutation = useSaveSpeakingSectionDraft();
	const updateMutation = useUpdateSpeakingSection();
	const publishMutation = usePublishSpeakingSection();

	const form = useForm<ToeflSpeakingFormValues>({
		defaultValues: defaultToeflSpeakingFormValues,
		mode: "onChange",
	});

	const [lastSavedValues, setLastSavedValues] =
		useState<ToeflSpeakingFormValues | null>(null);

	const sendCompletionChanged = useCallback(
		(values: ToeflSpeakingFormValues) => {
			send({
				type: "FORM_COMPLETION_CHANGED",
				...getToeflSpeakingCompletionStatus(values),
			});
		},
		[send],
	);

	useEffect(() => {
		if (!sectionQuery.isSuccess || !sectionQuery.data) return;

		const section = sectionQuery.data;
		let cancelled = false;

		(async () => {
			const values = await sectionEditToFormValues(section);
			if (cancelled) return;

			send({
				type: "LOAD_SUCCESS",
				materialId: section.materialId,
				sectionStatus: section.status,
			});
			form.reset(values);
			sendCompletionChanged(values);
			setLastSavedValues(values);
		})();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionQuery.isSuccess, sendCompletionChanged]);

	useEffect(() => {
		if (sectionQuery.isError) {
			send({
				type: "LOAD_FAILURE",
				error:
					sectionQuery.error instanceof Error
						? sectionQuery.error.message
						: "Could not load material",
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionQuery.isError]);

	useEffect(() => {
		if (materialId == null) {
			send({ type: "LOAD_SUCCESS" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { isDirty } = form.formState;
	useEffect(() => {
		if (isDirty) send({ type: "FIELD_CHANGED" });
	}, [isDirty, send]);

	useEffect(() => {
		const subscription = form.watch((values) => {
			sendCompletionChanged(values as ToeflSpeakingFormValues);
		});
		return () => subscription.unsubscribe();
	}, [form, sendCompletionChanged]);

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
			const currentMaterialId = state.context.materialId;
			const fd = buildSpeakingSectionFormData(values, currentMaterialId);
			let nextMaterialId: number;

			if (currentMaterialId == null) {
				const response = await saveDraftMutation.mutateAsync(fd);
				nextMaterialId = response.materialId;
			} else {
				await updateMutation.mutateAsync({
					materialId: currentMaterialId,
					formData: fd,
				});
				nextMaterialId = currentMaterialId;
			}

			form.reset(values);
			setLastSavedValues(values);

			send({ type: "DRAFT_SAVE_SUCCESS", materialId: nextMaterialId });
			sendCompletionChanged(values);

			if (currentMaterialId == null) {
				navigate(buildRoute.editSpeakingMaterial(nextMaterialId), {
					replace: true,
				});
			}
		} catch {
			send({ type: "DRAFT_SAVE_FAILURE", error: "Could not save draft" });
		}
	}

	async function savePublishedChanges() {
		if (!state.can({ type: "SAVE_PUBLISHED_CHANGES" })) return;

		send({ type: "SAVE_PUBLISHED_CHANGES" });

		try {
			const values = form.getValues();
			const currentMaterialId = state.context.materialId;

			if (currentMaterialId == null) throw new Error("Missing material id");

			const fd = buildSpeakingSectionFormData(values, currentMaterialId);
			await updateMutation.mutateAsync({
				materialId: currentMaterialId,
				formData: fd,
			});

			form.reset(values);
			setLastSavedValues(values);

			send({ type: "PUBLISHED_SAVE_SUCCESS" });
			sendCompletionChanged(values);
		} catch {
			send({ type: "PUBLISHED_SAVE_FAILURE", error: "Could not save changes" });
		}
	}

	async function publish() {
		if (!state.can({ type: "PUBLISH" })) return;

		send({ type: "PUBLISH" });

		try {
			const materialId = state.context.materialId;

			if (materialId == null) throw new Error("Missing material id");

			await publishMutation.mutateAsync(materialId);

			send({ type: "PUBLISH_SUCCESS" });
		} catch {
			send({ type: "PUBLISH_FAILURE", error: "Could not publish material" });
		}
	}

	function revert() {
		if (!state.can({ type: "REVERT" })) return;
		if (!lastSavedValues) return;

		send({ type: "REVERT" });
		form.reset(lastSavedValues);
		send({ type: "REVERT_SUCCESS" });
		sendCompletionChanged(lastSavedValues);
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
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,
		nextStep,
		previousStep,
		nextQuestion: () => send({ type: "NEXT_QUESTION" }),
		previousQuestion: () => send({ type: "PREVIOUS_QUESTION" }),
		setCurrentQuestion: (index: number) =>
			send({ type: "SET_CURRENT_QUESTION", index }),
		nextPart2Question: () => send({ type: "NEXT_PART2_QUESTION" }),
		previousPart2Question: () => send({ type: "PREVIOUS_PART2_QUESTION" }),
		setCurrentPart2Question: (index: number) =>
			send({ type: "SET_CURRENT_PART2_QUESTION", index }),
		saveDraft,
		savePublishedChanges,
		publish,
		revert,
	};
}
