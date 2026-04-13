export const getMaterialId = (item) => {
	const value = item?.materialId ?? item?.material_id ?? item?.id ?? null;
	return value === null || value === undefined ? null : String(value);
};

export const normalizeMaterialForUI = (item) => {
	const materialId = getMaterialId(item);
	if (materialId === null) return null;

	return {
		...item,
		id: materialId,
		materialId,
		name: item?.name || item?.title || `Material ${materialId}`,
	};
};