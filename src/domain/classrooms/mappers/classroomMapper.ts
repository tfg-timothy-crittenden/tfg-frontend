import type {
	getClassroomSummariesByMemberResponse,
	getStudentsByClassroomResponse,
	getTeachersByClassroomResponse,
	getMaterialsByClassroomAndRoleResponse,
	joinClassroomResponse,
} from "@/generated/classroom-api/classroom-controller/classroom-controller.zod";
import type { z } from "zod";

import type { ClassroomMember } from "../types/ClassroomMember";
import type { ClassroomMaterialReference } from "../types/ClassroomMaterial";
import type { ClassroomSummary } from "../types/ClassroomSummary";
import type { JoinClassroomResult } from "../types/JoinClassroomResult";

type JoinClassroomResponseDto = z.infer<typeof joinClassroomResponse>;
type ClassroomSummaryListDto = z.infer<
	typeof getClassroomSummariesByMemberResponse
>;

export function toJoinClassroomResult(
	dto: JoinClassroomResponseDto,
): JoinClassroomResult {
	return {
		classroomId: String(dto.classroomId),
		classroomName: dto.classroomName,
		role: dto.role,
	};
}

export function toClassroomSummaries(
	dto: ClassroomSummaryListDto,
): ClassroomSummary[] {
	return dto.map((item) => ({
		id: item.id,
		name: item.name,
		description: item.description ?? undefined,
		createdAt: item.createdAt,
		updatedAt: item.updatedAt,
		studentCount: item.studentCount,
		materialCount: item.materialCount,
		teachers: item.teachers,
	}));
}

type ClassroomStudentsDto = z.infer<typeof getStudentsByClassroomResponse>;
type ClassroomTeachersDto = z.infer<typeof getTeachersByClassroomResponse>;
type ClassroomMemberDto =
	| ClassroomStudentsDto[number]
	| ClassroomTeachersDto[number];

function toClassroomMembers(
	dto: ClassroomMemberDto[],
	defaultRole: ClassroomMember["role"],
): ClassroomMember[] {
	return dto
		.filter((item) => typeof item.userId === "number")
		.map((item) => ({
			userId: item.userId as number,
			role: item.role ?? defaultRole,
			name: item.firstName ?? "Unknown",
			surname: item.lastName ?? "",
		}));
}

export function toClassroomStudents(
	dto: ClassroomStudentsDto,
): ClassroomMember[] {
	return toClassroomMembers(dto, "STUDENT");
}

type ClassroomMaterialsDto = z.infer<
	typeof getMaterialsByClassroomAndRoleResponse
>;

export function toClassroomTeachers(
	dto: ClassroomTeachersDto,
): ClassroomMember[] {
	return toClassroomMembers(dto, "TEACHER");
}

export function toClassroomMaterialReferences(
	dto: ClassroomMaterialsDto,
): ClassroomMaterialReference[] {
	return dto
		.filter((item) => typeof item.materialId === "number")
		.map((item) => ({
			materialId: item.materialId as number,
			name: item.name ?? "Untitled material",
			description: item.description ?? undefined,
			part1Title: item.part1Title ?? "",
			part2Title: item.part2Title ?? "",
		}));
}
