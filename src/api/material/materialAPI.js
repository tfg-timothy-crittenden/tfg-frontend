import httpClient from "@/api/httpClient";

const MATERIALS_BASE_URL =
	import.meta.env.VITE_MATERIALS_API_URL || "/materials/api";

export const getImmediateChildrenByParentId = async (parentId) => {
	const { data } = await httpClient.get(
		`/material-aggregation/children/${parentId}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};

export const getSpeakingPartOneQuestionByPartIdAndQuestionOrder = async (
	partId,
	questionOrder,
) => {
	const { data } = await httpClient.get(
		`/speaking/part-one/question/${partId}/${questionOrder}`,
		{
			baseURL: MATERIALS_BASE_URL,
		},
	);
	return data;
};
