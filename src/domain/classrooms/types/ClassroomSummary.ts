import type { ClassroomRole } from "./ClassroomRole";
import type { ClassroomTeacher } from "./ClassroomTeacher";

export type ClassroomSummary = {
	id: number;
	name: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	studentCount: number;
	materialCount: number;
	teachers: ClassroomTeacher[];
	role?: ClassroomRole;
};
