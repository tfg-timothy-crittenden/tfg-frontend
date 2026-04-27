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

// API method to fetch immediate child material nodes for a given parentId
export const getImmediateChildrenByParentId = async (parentId) => {
	const { data } = await httpClient.get(
		`/material-aggregation/children/${parentId}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

//Use this method to fetch the first material_node of a material based on the materialId. This is useful when you want to start traversing a material tree from the root node.
export const getFirstMaterialNodeByMaterialId = async (materialId) => {
	const { data } = await httpClient.get(
		`/material-nodes/first-by-material-id/${materialId}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

//Use this method when you want a specfic child material node based on the parentId and the display order of the child.
export const getMaterialByParentIdAndOrder = async (parentId, displayOrder) => {
	const { data } = await httpClient.get(
		"/material-nodes/by-parent-id-and-display-order",
		{
			baseURL: MATERIALS_BASE_URL,
			params: {
				parentId,
				displayOrder,
			},
		},
	);
	return data;
};

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
	const { data } = await httpClient.get(`/materials`, {
		baseURL: MATERIALS_BASE_URL,
	});
	return normalizeMaterialList(data);
};

export const getMaterialNodeAssets = async (materialNodeId) => {
	const { data } = await httpClient.get(
		`/material-nodes/${materialNodeId}/assets`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const getPresignedUrl = async ({
	bucket,
	objectKey,
	expirationSeconds = 3600,
}) => {
	const { data } = await httpClient.get("/storage/presigned-url", {
		baseURL: MATERIALS_BASE_URL,
		params: {
			bucket,
			objectKey,
			expirationSeconds,
		},
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
