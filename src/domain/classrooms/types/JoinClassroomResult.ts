import type { ClassroomRole } from "./ClassroomRole";

export type JoinClassroomResult = {
	classroomId: string;
	classroomName: string;
	role: ClassroomRole;
};
