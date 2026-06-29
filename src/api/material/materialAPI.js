import httpClient from "@/api/httpClient";

const MATERIALS_BASE_URL = import.meta.env.VITE_MATERIALS_API_URL;

if (!MATERIALS_BASE_URL) {
	throw new Error(
		"VITE_MATERIALS_API_URL is not set. Please set it in your .env file to the materials API base URL.",
	);
}

export const getToeflSpeakingMaterialQuestion = async (
	materialId,
	partNumber,
	questionNumber,
) => {
	const { data } = await httpClient.get(
		`/toefl-speaking/material/${materialId}/part/${partNumber}/question/${questionNumber}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const getMaterialNodeAssets = async (materialNodeId) => {
	const { data } = await httpClient.get(
		`/toefl-speaking/material-nodes/${materialNodeId}/assets`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

//Problem: Repeated requests for presigned URLS for the same object.
//Solution: A simple in-memory cache to store presigned URLs with their expiration times.
//          Before making a request for a presigned URL, check the cache first. If a valid
//          URL is found, return it instead of making a new API call.

const presignedUrlCache = new Map();

export const getPresignedUrl = async ({
	bucket,
	objectKey,
	expirationSeconds = 3600,
}) => {
	const cacheKey = `${bucket}:${objectKey}`;
	const cached = presignedUrlCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.data;
	}

	const { data } = await httpClient.get("/storage/presigned-url", {
		baseURL: MATERIALS_BASE_URL,
		params: {
			bucket,
			objectKey,
			expirationSeconds,
		},
	});

	// Cache with a 60-second safety buffer before actual expiry
	presignedUrlCache.set(cacheKey, {
		data,
		expiresAt: Date.now() + (expirationSeconds - 60) * 1000,
	});

	return data;
};

export const uploadSpeakingSectionDraft = async (formData) => {
	console.log("FormData entries:");
	for (let pair of formData.entries()) {
		console.log(pair[0], pair[1]);
	}
	const { data } = await httpClient.post(
		"/toefl-speaking/material/section/draft",
		formData,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const getSpeakingSectionByMaterialId = async (materialId) => {
	const { data } = await httpClient.get(
		`/toefl-speaking/material/${materialId}/section`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const updateSpeakingSection = async (materialId, formData) => {
	const { data } = await httpClient.patch(
		`/toefl-speaking/material/${materialId}/section`,
		formData,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const getAllSpeakingSectionsSummaries = async () => {
	const { data } = await httpClient.get(`/toefl-speaking/sections-summaries`, {
		baseURL: MATERIALS_BASE_URL,
	});
	return data;
};

// export const getDraftSpeakingSectionsSummaries = async () => {
// 	const { data } = await httpClient.get(
// 		`/toefl-speaking/sections-summaries/drafts`,
// 		{
// 			baseURL: MATERIALS_BASE_URL,
// 		},
// 	);
// 	return data;
// };

export const publishSpeakingMaterial = async (materialId) => {
	const { data } = await httpClient.patch(
		`/toefl-speaking/material/${materialId}/publish`,
		{},
		{ baseURL: MATERIALS_BASE_URL },
	);
	return data;
};

// export const deleteSpeakingMaterial = async (materialId) => {
// 	const { data } = await httpClient.delete(
// 		`/toefl-speaking/material/${materialId}`,
// 		{ baseURL: MATERIALS_BASE_URL },
// 	);
// 	return data;
// };
