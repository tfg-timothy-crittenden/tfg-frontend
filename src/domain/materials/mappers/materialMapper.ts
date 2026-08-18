import type {
	SpeakingSectionSummaryDto,
	SpeakingSectionEditDto,
	QuestionEditDto,
	MaterialAssetDto,
	MaterialNodeWithAssetsDto,
} from "@/generated/material-api/model";

import type { SpeakingSectionSummary } from "../types/SpeakingSectionSummary";
import type {
	SpeakingSectionEdit,
	QuestionEdit,
} from "../types/SpeakingSectionEdit";
import type { MaterialAsset } from "../types/MaterialAsset";
import type { MaterialNode } from "../types/MaterialNode";

function toQuestionEdit(dto: QuestionEditDto): QuestionEdit {
	return {
		index: dto.index,
		questionNodeId: dto.questionNodeId,
		transcriptText: dto.transcriptText,
		config: dto.config,
		audioStorageKey: dto.audioStorageKey,
	};
}

function toMaterialAsset(dto: MaterialAssetDto): MaterialAsset {
	return {
		id: dto.id,
		kind: dto.kind,
		storageKey: dto.storageKey,
		displayOrder: dto.displayOrder,
	};
}

export function toSpeakingSectionSummaries(
	dtos: SpeakingSectionSummaryDto[],
): SpeakingSectionSummary[] {
	return dtos.map((dto) => ({
		materialId: dto.materialId,
		sectionId: dto.sectionId,
		sectionTitle: dto.sectionTitle,
		part1Id: dto.part1Id,
		part1Title: dto.part1Title,
		part2Id: dto.part2Id,
		part2Title: dto.part2Title,
		status: dto.status,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt,
	}));
}

export function toSpeakingSectionEdit(
	dto: SpeakingSectionEditDto,
): SpeakingSectionEdit {
	return {
		materialId: dto.materialId,
		sectionId: dto.sectionId,
		status: dto.status,
		materialTitle: dto.materialTitle,
		materialDescription: dto.materialDescription,
		partTitle: dto.partTitle,
		partImageStorageKey: dto.partImageStorageKey,
		questions: dto.questions.map(toQuestionEdit),
		part2Title: dto.part2Title,
		part2Questions: dto.part2Questions.map(toQuestionEdit),
	};
}

export function toMaterialAssets(dtos: MaterialAssetDto[]): MaterialAsset[] {
	return dtos.map(toMaterialAsset);
}

export function toMaterialNode(dto: MaterialNodeWithAssetsDto): MaterialNode {
	return {
		id: dto.id,
		parentNodeId: dto.parentNodeId,
		kind: dto.kind,
		title: dto.title,
		displayOrder: dto.displayOrder,
		transcriptText: dto.transcriptText,
		assets: dto.assets.map(toMaterialAsset),
		config: dto.config,
	};
}
