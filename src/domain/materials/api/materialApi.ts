/**
 * Material API adapter — the anti-corruption layer between generated Orval code and the app.
 *
 * HOW TO ADD A NEW ENDPOINT
 * ─────────────────────────
 * 1. Run `npm run generate:material-api` to regenerate the factory and Zod schemas
 *    after the backend OpenAPI spec changes.
 *
 * 2. Call `ctrl.<methodName>` or `storage.<methodName>` directly in the adapter function below.
 *
 * 3. Write a new async adapter function that:
 *    a. Validates inputs with the relevant Zod schema from toefl-speaking-controller.zod.ts (if any).
 *    b. Calls the destructured generated function.
 *    c. Validates the response with the relevant Zod response schema.
 *    d. Maps the validated DTO to a domain type using materialMapper.ts.
 *    e. Returns the domain type — never a raw DTO.
 *
 * 4. If a new domain type is needed, add it to ../types/.
 *    If a new mapping is needed, add it to ../mappers/materialMapper.ts.
 *
 * 5. Expose the new adapter function via a custom TanStack Query hook in ../hooks/.
 *    Components should import from hooks only — never from this file directly.
 */

import { getToeflSpeakingController } from "@/generated/material-api/toefl-speaking-controller/toefl-speaking-controller";
import { getStorageController } from "@/generated/material-api/storage-controller/storage-controller";
import {
	deleteSpeakingSectionParams,
	getAssetsByMaterialNodeIdParams,
	getAssetsByMaterialNodeIdResponse,
	getAllSpeakingSectionSummariesResponse,
	getDraftSpeakingSectionSummariesResponse,
	getQuestionParams,
	getQuestionResponse,
	getSpeakingSectionForEditParams,
	getSpeakingSectionForEditResponse,
	publishSpeakingSectionParams,
	saveSpeakingSectionDraftResponse,
	updateSpeakingSectionParams,
	uploadSpeakingSectionResponse,
} from "@/generated/material-api/toefl-speaking-controller/toefl-speaking-controller.zod";
import type { DraftSaveResponseDto } from "@/generated/material-api/model";
import { customInstance } from "@/api/mutator/custom-instance";

import type { SpeakingSectionSummary } from "../types/SpeakingSectionSummary";
import type { SpeakingSectionEdit } from "../types/SpeakingSectionEdit";
import type { MaterialAsset } from "../types/MaterialAsset";
import type { MaterialNode } from "../types/MaterialNode";
import {
	toMaterialAssets,
	toMaterialNode,
	toSpeakingSectionEdit,
	toSpeakingSectionSummaries,
} from "../mappers/materialMapper";

const ctrl = getToeflSpeakingController();
const storage = getStorageController();

// Multipart upload endpoints: accept pre-built FormData directly.
// The Orval-generated serialization (JSON.stringify per question) is incompatible
// with the indexed multipart format the backend expects (questions[0].audio, etc.).
export async function uploadSpeakingSection(
	formData: FormData,
): Promise<{ materialId: number }> {
	const raw = await customInstance<DraftSaveResponseDto>({
		url: "/api/toefl-speaking/material/section/upload",
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
	const dto = uploadSpeakingSectionResponse.parse(raw);
	return { materialId: dto.materialId };
}

export async function saveSpeakingSectionDraft(
	formData: FormData,
): Promise<{ materialId: number }> {
	const raw = await customInstance<DraftSaveResponseDto>({
		url: "/api/toefl-speaking/material/section/draft",
		method: "POST",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
	const dto = saveSpeakingSectionDraftResponse.parse(raw);
	return { materialId: dto.materialId };
}

const normalizeString = (v: unknown): string => (v == null ? "" : String(v));

const normalizeSectionEdit = (raw: unknown) => {
	const r = raw as Record<string, unknown>;
	const normalizeQuestion = (q: unknown) => {
		const qr = q as Record<string, unknown>;
		return {
			...qr,
			transcriptText: normalizeString(qr.transcriptText),
			audioStorageKey: normalizeString(qr.audioStorageKey),
			config: qr.config ?? {},
		};
	};
	return {
		...r,
		materialTitle: normalizeString(r.materialTitle),
		materialDescription: normalizeString(r.materialDescription),
		partTitle: normalizeString(r.partTitle),
		partImageStorageKey: normalizeString(r.partImageStorageKey),
		part2Title: normalizeString(r.part2Title),
		questions: Array.isArray(r.questions)
			? r.questions.map(normalizeQuestion)
			: [],
		part2Questions: Array.isArray(r.part2Questions)
			? r.part2Questions.map(normalizeQuestion)
			: [],
	};
};

export async function getSpeakingSectionForEdit(
	materialId: number,
): Promise<SpeakingSectionEdit> {
	const params = getSpeakingSectionForEditParams.parse({ materialId });
	const raw = await ctrl.getSpeakingSectionForEdit(params.materialId);
	const dto = getSpeakingSectionForEditResponse.parse(
		normalizeSectionEdit(raw),
	);
	return toSpeakingSectionEdit(dto);
}

export async function updateSpeakingSection(
	materialId: number,
	formData: FormData,
): Promise<void> {
	const params = updateSpeakingSectionParams.parse({ materialId });
	await customInstance<void>({
		url: `/api/toefl-speaking/material/${params.materialId}/section`,
		method: "PATCH",
		headers: { "Content-Type": "multipart/form-data" },
		data: formData,
	});
}

export async function publishSpeakingSection(
	materialId: number,
): Promise<void> {
	const params = publishSpeakingSectionParams.parse({ materialId });
	await ctrl.publishSpeakingSection(params.materialId);
}

// Summaries from the backend can have null part titles when parts haven't been
// named yet. The generated Zod schema uses zod.string() (non-nullable), so we
// coerce nulls to empty strings before validation.
const normalizeSummaries = (raw: unknown[]) =>
	raw.map((item) => ({
		...(item as object),
		part1Title: (item as Record<string, unknown>).part1Title ?? "",
		part2Title: (item as Record<string, unknown>).part2Title ?? "",
	}));

export async function getAllSpeakingSectionSummaries(): Promise<
	SpeakingSectionSummary[]
> {
	const raw = await ctrl.getAllSpeakingSectionSummaries();
	const dto = getAllSpeakingSectionSummariesResponse.parse(
		normalizeSummaries(raw),
	);
	return toSpeakingSectionSummaries(dto);
}

export async function getDraftSpeakingSectionSummaries(): Promise<
	SpeakingSectionSummary[]
> {
	const raw = await ctrl.getDraftSpeakingSectionSummaries();
	const dto = getDraftSpeakingSectionSummariesResponse.parse(
		normalizeSummaries(raw),
	);
	return toSpeakingSectionSummaries(dto);
}

export async function getQuestion(
	materialId: number,
	partNumber: number,
	questionNumber: number,
): Promise<MaterialNode> {
	const params = getQuestionParams.parse({
		materialId,
		partNumber,
		questionNumber,
	});
	const raw = await ctrl.getQuestion(
		params.materialId,
		params.partNumber,
		params.questionNumber,
	);
	const dto = getQuestionResponse.parse(raw);
	return toMaterialNode(dto);
}

export async function getMaterialNodeAssets(
	nodeId: number,
): Promise<MaterialAsset[]> {
	const params = getAssetsByMaterialNodeIdParams.parse({ nodeId });
	const raw = await ctrl.getAssetsByMaterialNodeId(params.nodeId);
	const dto = getAssetsByMaterialNodeIdResponse.parse(raw);
	return toMaterialAssets(dto);
}

export async function deleteSpeakingSection(materialId: number): Promise<void> {
	const params = deleteSpeakingSectionParams.parse({ materialId });
	await ctrl.deleteSpeakingSection(params.materialId);
}

type PresignedUrlCacheEntry = {
	data?: string;
	promise?: Promise<string>;
	expiresAt: number;
};

const PRESIGNED_URL_EXPIRY_BUFFER_SECONDS = 60;
const presignedUrlCache = new Map<string, PresignedUrlCacheEntry>();

const getPresignedUrlCacheKey = (bucket: string, objectKey: string) =>
	`${bucket.trim()}:${objectKey.trim()}`;

export async function generatePresignedUrl(
	bucket: string,
	objectKey: string,
	expirationSeconds = 3600,
): Promise<string> {
	const cacheKey = getPresignedUrlCacheKey(bucket, objectKey);
	const cached = presignedUrlCache.get(cacheKey);
	if (cached?.data && cached.expiresAt > Date.now()) {
		return cached.data;
	}
	if (cached?.promise) {
		return cached.promise;
	}

	const request = customInstance<string>({
		url: "/api/storage/presigned-url",
		method: "GET",
		params: {
			bucket: bucket.trim(),
			objectKey: objectKey.trim(),
			expirationSeconds,
		},
	})
		.then((url) => {
			presignedUrlCache.set(cacheKey, {
				data: url,
				expiresAt:
					Date.now() +
					Math.max(expirationSeconds - PRESIGNED_URL_EXPIRY_BUFFER_SECONDS, 0) *
						1000,
			});
			return url;
		})
		.catch((error) => {
			if (presignedUrlCache.get(cacheKey)?.promise === request) {
				presignedUrlCache.delete(cacheKey);
			}
			throw error;
		});

	presignedUrlCache.set(cacheKey, {
		promise: request,
		expiresAt: Number.POSITIVE_INFINITY,
	});

	return request;
}
