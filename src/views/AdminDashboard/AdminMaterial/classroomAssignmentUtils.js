import { getMaterialId, normalizeMaterialForUI } from "./materialUtils";

// Detects if teacher or student assignments have changed since the last save.
// Used to enable/disable the Save and Cancel buttons in the UI.
export const areSetsEqual = (left, right) => {
	if (left.size !== right.size) return false;

	for (const value of left) {
		if (!right.has(value)) return false;
	}

	return true;
};

// Converts classroom role API responses (materialId, name) into a consistent UI shape.
// Needed because the classroom service and material service use different field names for the ID of the material.
export const normalizeRoleMaterialItems = (items) =>
	Array.isArray(items)
		? items.map((item) => normalizeMaterialForUI(item)).filter(Boolean)
		: [];

// Extracts material IDs into a Set for fast membership checks.
// Used to determine which library items to grey out (already assigned) and for comparisons.
export const toMaterialIdSet = (items) =>
	new Set(items.map((item) => getMaterialId(item)).filter((id) => id !== null));

// Creates a map of ID -> item for all assigned materials across both roles.
// Needed for quick lookups when rendering assigned lists and for rendering fallback items.
export const buildAssignedMaterialsLookup = (...itemGroups) => {
	const lookup = {};

	itemGroups.flat().forEach((item) => {
		const id = getMaterialId(item);
		if (id !== null) lookup[id] = item;
	});

	return lookup;
};

const getAssignmentMaterial = (materialId, libraryMaterialsMap) => {
	const material = libraryMaterialsMap.get(materialId);
	const resolvedMaterialId =
		material?.materialId ?? material?.material_id ?? material?.id ?? materialId;
	const materialName =
		material?.name || material?.title || `Material ${materialId}`;
	const materialDescription =
		material?.description || material?.name || material?.title || materialName;

	return {
		materialId: Number.isNaN(Number(resolvedMaterialId))
			? resolvedMaterialId
			: Number(resolvedMaterialId),
		name: materialName,
		description: materialDescription,
	};
};

// Transforms the current teacher and student ID Sets into the API payload format.
// The classroom service expects an array of material records with a role per entry.
export const createAssignmentsPayload = (
	teacherIds,
	studentIds,
	libraryMaterials,
) => {
	const libraryMaterialsMap = new Map(
		(libraryMaterials || [])
			.map((item) => [getMaterialId(item), item])
			.filter(([materialId]) => materialId !== null),
	);

	const assignments = [];

	teacherIds.forEach((materialId) =>
		assignments.push({
			...getAssignmentMaterial(materialId, libraryMaterialsMap),
			assignedToRole: "TEACHER",
		}),
	);

	studentIds.forEach((materialId) =>
		assignments.push({
			...getAssignmentMaterial(materialId, libraryMaterialsMap),
			assignedToRole: "STUDENT",
		}),
	);

	return assignments;
};

// Looks up the full item objects for a set of assigned IDs, preferring library items.
// Renders the assigned lists in the UI with proper names and fields; falls back to stub items
// if an ID was assigned but not yet in either data source.
export const buildAssignedDisplayItems = ({
	assignedIds,
	libraryMaterials,
	assignedMaterialsById,
}) => {
	const byId = new Map();

	libraryMaterials.forEach((item) => {
		const itemId = getMaterialId(item);
		if (itemId !== null) byId.set(itemId, item);
	});

	Object.entries(assignedMaterialsById).forEach(([id, item]) => {
		if (item) byId.set(id, item);
	});

	return [...assignedIds]
		.map((id) => byId.get(id) || normalizeMaterialForUI({ materialId: id }))
		.filter(Boolean);
};
