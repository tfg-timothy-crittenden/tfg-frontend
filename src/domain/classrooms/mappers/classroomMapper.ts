import type {
	getClassroomSummariesByMemberResponse,
	getStudentsByClassroomResponse,
	getTeachersByClassroomResponse,
	updateClassroomMaterialsResponse,
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

export function toClassroomStudents(
	dto: ClassroomStudentsDto,
): ClassroomMember[] {
	return dto.map((item) => ({
		userId: item.userId,
		role: item.role,
		name: item.name,
		surname: item.surname,
	}));
}

type ClassroomTeachersDto = z.infer<typeof getTeachersByClassroomResponse>;
type ClassroomMaterialsDto = z.infer<typeof updateClassroomMaterialsResponse>;

export function toClassroomTeachers(
	dto: ClassroomTeachersDto,
): ClassroomMember[] {
	return dto.map((item) => ({
		userId: item.userId,
		role: item.role,
		name: item.name,
		surname: item.surname,
	}));
}

export function toClassroomMaterialReferences(
	dto: ClassroomMaterialsDto,
): ClassroomMaterialReference[] {
	return dto.map((item) => ({
		materialId: item.materialId,
		name: item.name,
		description: item.description ?? undefined,
		part1Title: item.part1Title,
		part2Title: item.part2Title,
	}));
}
