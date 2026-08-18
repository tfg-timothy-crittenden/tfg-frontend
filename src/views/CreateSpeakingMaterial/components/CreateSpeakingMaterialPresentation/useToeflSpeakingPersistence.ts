import { useEffect, useState } from "react";

import { generatePresignedUrl } from "@/domain/materials/api/materialApi";
import { usePublishSpeakingSection } from "@/domain/materials/hooks/usePublishSpeakingSection";
import { useSaveSpeakingSectionDraft } from "@/domain/materials/hooks/useSaveSpeakingSectionDraft";
import { useSpeakingSectionForEdit } from "@/domain/materials/hooks/useSpeakingSectionForEdit";
import { useUpdateSpeakingSection } from "@/domain/materials/hooks/useUpdateSpeakingSection";
import { buildSpeakingSectionFormData } from "./buildSpeakingSectionFormData";
import { mapSpeakingSectionEditToFormValues } from "./mapSpeakingSectionEditToFormValues";
import type { ToeflSpeakingRouterPort } from "./useToeflSpeakingRouter";
import type { ToeflSpeakingFormValues } from "./toeflSpeakingFormTypes";

type ToeflSpeakingPersistenceFormPort = {
	getValues: () => ToeflSpeakingFormValues;
	reset: (values: ToeflSpeakingFormValues) => void;
};

type ToeflSpeakingPersistenceWorkflowPort = {
	context: {
		materialId: number | null;
	};
	canSaveDraft: () => boolean;
	canSavePublishedChanges: () => boolean;
	canPublish: () => boolean;
	canRevert: () => boolean;
	loadSucceeded: (input?: {
		materialId?: number;
		sectionStatus?: "DRAFT" | "PUBLISHED" | null;
	}) => void;
	loadFailed: (error: string) => void;
	syncCompletion: (values: ToeflSpeakingFormValues) => void;
	draftSaveStarted: () => void;
	draftSaveSucceeded: (materialId: number) => void;
	draftSaveFailed: (error: string) => void;
	publishedSaveStarted: () => void;
	publishedSaveSucceeded: () => void;
	publishedSaveFailed: (error: string) => void;
	publishStarted: () => void;
	publishSucceeded: () => void;
	publishFailed: (error: string) => void;
	revertStarted: () => void;
	revertSucceeded: () => void;
};

type UseToeflSpeakingPersistenceInput = {
	materialId?: number;
	form: ToeflSpeakingPersistenceFormPort;
	workflow: ToeflSpeakingPersistenceWorkflowPort;
	router: ToeflSpeakingRouterPort;
};

async function resolveStorageKey(
	key: string | null | undefined,
): Promise<string | null> {
	if (!key) return null;
	return generatePresignedUrl("toefl", key, 3600);
}

export function useToeflSpeakingPersistence({
	materialId,
	form,
	workflow,
	router,
}: UseToeflSpeakingPersistenceInput) {
	const sectionQuery = useSpeakingSectionForEdit(materialId);
	const saveDraftMutation = useSaveSpeakingSectionDraft();
	const updateMutation = useUpdateSpeakingSection();
	const publishMutation = usePublishSpeakingSection();

	const [lastSavedValues, setLastSavedValues] =
		useState<ToeflSpeakingFormValues | null>(null);

	useEffect(() => {
		if (!sectionQuery.isSuccess || !sectionQuery.data) return;

		const section = sectionQuery.data;
		let cancelled = false;

		(async () => {
			const values = await mapSpeakingSectionEditToFormValues({
				section,
				resolveStorageUrl: resolveStorageKey,
			});
			if (cancelled) return;

			workflow.loadSucceeded({
				materialId: section.materialId,
				sectionStatus: section.status,
			});
			form.reset(values);
			workflow.syncCompletion(values);
			setLastSavedValues(values);
		})();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionQuery.isSuccess, workflow.syncCompletion]);

	useEffect(() => {
		if (sectionQuery.isError) {
			workflow.loadFailed(
				sectionQuery.error instanceof Error
					? sectionQuery.error.message
					: "Could not load material",
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionQuery.isError]);

	useEffect(() => {
		if (materialId == null) {
			workflow.loadSucceeded();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function saveDraft() {
		if (!workflow.canSaveDraft()) return;

		workflow.draftSaveStarted();

		try {
			const values = form.getValues();
			const currentMaterialId = workflow.context.materialId;
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

			workflow.draftSaveSucceeded(nextMaterialId);
			workflow.syncCompletion(values);

			if (currentMaterialId == null) {
				router.goToEditMaterial(nextMaterialId);
			}
		} catch {
			workflow.draftSaveFailed("Could not save draft");
		}
	}

	async function savePublishedChanges() {
		if (!workflow.canSavePublishedChanges()) return;

		workflow.publishedSaveStarted();

		try {
			const values = form.getValues();
			const currentMaterialId = workflow.context.materialId;

			if (currentMaterialId == null) throw new Error("Missing material id");

			const fd = buildSpeakingSectionFormData(values, currentMaterialId);
			await updateMutation.mutateAsync({
				materialId: currentMaterialId,
				formData: fd,
			});

			form.reset(values);
			setLastSavedValues(values);

			workflow.publishedSaveSucceeded();
			workflow.syncCompletion(values);
		} catch {
			workflow.publishedSaveFailed("Could not save changes");
		}
	}

	async function publish() {
		if (!workflow.canPublish()) return;

		workflow.publishStarted();

		try {
			const materialId = workflow.context.materialId;

			if (materialId == null) throw new Error("Missing material id");

			await publishMutation.mutateAsync(materialId);

			workflow.publishSucceeded();
		} catch {
			workflow.publishFailed("Could not publish material");
		}
	}

	function revert() {
		if (!workflow.canRevert()) return;
		if (!lastSavedValues) return;

		workflow.revertStarted();
		form.reset(lastSavedValues);
		workflow.revertSucceeded();
		workflow.syncCompletion(lastSavedValues);
	}

	return {
		saveDraft,
		savePublishedChanges,
		publish,
		revert,
	};
}
