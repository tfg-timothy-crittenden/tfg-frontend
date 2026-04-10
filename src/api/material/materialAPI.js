import httpClient from "@/api/httpClient";

const MATERIALS_BASE_URL =
	import.meta.env.VITE_MATERIALS_API_URL ||
	"http://localhost:8080/materials/api";

export const getImmediateChildrenByParentId = async (parentId) => {
	const { data } = await httpClient.get(
		`/material-aggregation/children/${parentId}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

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
