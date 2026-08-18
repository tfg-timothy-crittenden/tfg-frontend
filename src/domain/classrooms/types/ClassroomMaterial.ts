import type { ClassroomRole } from "./ClassroomRole";

export type ClassroomMaterialAssignment = {
	materialId: number;
	name: string;
	description?: string;
	part1Title: string;
	part2Title: string;
	assignedToRole: ClassroomRole;
};

export type ClassroomMaterialReference = {
	materialId: number;
	name: string;
	description?: string;
	part1Title: string;
	part2Title: string;
};
