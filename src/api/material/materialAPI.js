import httpClient from "@/api/httpClient";

const MATERIALS_BASE_URL = import.meta.env.VITE_MATERIALS_API_URL;

if (!MATERIALS_BASE_URL) {
	throw new Error(
		"VITE_MATERIALS_API_URL is not set. Please set it in your .env file to the materials API base URL.",
	);
}

const normalizeMaterialList = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.materials)) return payload.materials;
	if (Array.isArray(payload?.items)) return payload.items;
	if (Array.isArray(payload?.materialNodes)) return payload.materialNodes;
	if (Array.isArray(payload?.content)) return payload.content;
	if (Array.isArray(payload?.data)) return payload.data;
	if (payload && typeof payload === "object") {
		return Object.values(payload).filter(
			(value) => value && typeof value === "object",
		);
	}
	return [];
};

// // API method to fetch immediate child material nodes for a given parentId
// export const getImmediateChildrenByParentId = async (parentId) => {
// 	const { data } = await httpClient.get(
// 		`/material-aggregation/children/${parentId}`,
// 		{
// 			baseURL: MATERIALS_BASE_URL,
// 		},
// 	);
// 	return data;
// };

// //Use this method to fetch the first material_node of a material based on the materialId. This is useful when you want to start traversing a material tree from the root node.
// export const getFirstMaterialNodeByMaterialId = async (materialId) => {
// 	const { data } = await httpClient.get(
// 		`/material-nodes/first-by-material-id/${materialId}`,
// 		{
// 			baseURL: MATERIALS_BASE_URL,
// 		},
// 	);
// 	return data;
// };

// //Use this method when you want a specfic child material node based on the parentId and the display order of the child.
// export const getMaterialByParentIdAndOrder = async (parentId, displayOrder) => {
// 	const { data } = await httpClient.get(
// 		"/material-nodes/by-parent-id-and-display-order",
// 		{
// 			baseURL: MATERIALS_BASE_URL,
// 			params: {
// 				parentId,
// 				displayOrder,
// 			},
// 		},
// 	);
// 	return data;
// };

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

export const getAllMaterial = async () => {
	const [publishedResult, draftsResult] = await Promise.allSettled([
		httpClient.get(`/toefl-speaking/sections-summaries`, {
			baseURL: MATERIALS_BASE_URL,
		}),
		httpClient.get(`/toefl-speaking/sections-summaries/drafts`, {
			baseURL: MATERIALS_BASE_URL,
		}),
	]);

	const publishedData =
		publishedResult.status === "fulfilled" ? publishedResult.value.data : [];
	const draftsData =
		draftsResult.status === "fulfilled" ? draftsResult.value.data : [];

	const combined = [
		...normalizeMaterialList(publishedData),
		...normalizeMaterialList(draftsData),
	];

	const uniqueByMaterialId = new Map();
	for (const item of combined) {
		const id = item?.materialId ?? item?.material_id ?? item?.id;
		const key = id === null || id === undefined ? null : String(id);
		if (!key) continue;
		if (!uniqueByMaterialId.has(key)) {
			uniqueByMaterialId.set(key, item);
		}
	}

	return Array.from(uniqueByMaterialId.values());
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

//Cache presigined URLS in memory to reduce repeated calls to the backend for the same object.
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

export const uploadPart1Speaking = async (formData) => {
	console.log("FormData entries:");
	for (let pair of formData.entries()) {
		console.log(pair[0], pair[1]);
	}
	const { data } = await httpClient.post(
		"/toefl-speaking/material/part1/upload",
		formData,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const uploadSpeakingSection = async (formData) => {
	console.log("FormData entries:");
	for (let pair of formData.entries()) {
		console.log(pair[0], pair[1]);
	}
	const { data } = await httpClient.post(
		"/toefl-speaking/material/section/upload",
		formData,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
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

export const getDraftSpeakingSectionsSummaries = async () => {
	const { data } = await httpClient.get(
		`/toefl-speaking/sections-summaries/drafts`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const publishSpeakingMaterial = async (materialId) => {
	const { data } = await httpClient.patch(
		`/toefl-speaking/material/${materialId}/publish`,
		{},
		{ baseURL: MATERIALS_BASE_URL },
	);
	return data;
};

export const deleteSpeakingMaterial = async (materialId) => {
	if (!materialId) {
		throw new Error("materialId is required to delete a speaking material.");
	}

	const deletePaths = [
		`/toefl-speaking/material/${materialId}`,
		`/toefl-speaking/material/${materialId}/section`,
		`/toefl-speaking/material/section/${materialId}`,
	];

	let lastError = null;
	for (const path of deletePaths) {
		try {
			const { data } = await httpClient.delete(path, {
				baseURL: MATERIALS_BASE_URL,
			});
			return data;
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError || new Error("Failed to delete speaking material.");
};
