export const hasDirtyLeaf = (value) => {
	if (value === true) return true;
	if (!value || typeof value !== "object") return false;
	return Object.values(value).some((entry) => hasDirtyLeaf(entry));
};
