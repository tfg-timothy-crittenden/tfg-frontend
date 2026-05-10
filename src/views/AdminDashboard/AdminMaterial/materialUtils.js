export const getMaterialId = (item) => {
	const value = item?.id ?? item?.materialId ?? item?.material_id ?? null;
	return value === null || value === undefined ? null : String(value);
};

export const normalizeMaterialForUI = (item) => {
	const materialId = getMaterialId(item);
	if (materialId === null) return null;

	const sectionTitle =
		item?.sectionTitle ||
		item?.materialTitle ||
		item?.sectionName ||
		item?.name ||
		item?.title ||
		`Material ${materialId}`;
	const part1Title = item?.part1Title || item?.partTitle || "";
	const part2Title = item?.part2Title || item?.partTwoTitle || "";

	return {
		...item,
		id: materialId,
		materialId,
		sectionTitle,
		part1Title,
		part2Title,
		name: item?.name || item?.title || sectionTitle,
	};
};
