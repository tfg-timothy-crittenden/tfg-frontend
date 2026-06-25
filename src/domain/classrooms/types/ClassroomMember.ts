import type { ClassroomRole } from "./ClassroomRole";

export type ClassroomMember = {
	userId: number;
	role: ClassroomRole;
	name: string;
	surname: string;
};
