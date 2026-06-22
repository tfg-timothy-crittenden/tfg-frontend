export type ClassroomRole = "TEACHER" | "STUDENT";

export type JoinClassroomResult = {
	classroomId: string;
	classroomName: string;
	role: ClassroomRole;
};
