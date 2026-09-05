/**
 * Classroom API adapter — the anti-corruption layer between generated Orval code and the app.
 *
 * HOW TO ADD A NEW ENDPOINT
 * ─────────────────────────
 * 1. Run `npm run generate:classroom-api` to regenerate the factory and Zod schemas
 *    after the backend OpenAPI spec changes.
 *
 * 2. Call `ctrl.<methodName>` directly in the adapter function below.
 *
 * 3. Write a new async adapter function below that:
 *    a. Validates inputs with the relevant Zod schema from classroom-controller.zod.ts (if any).
 *    b. Calls the destructured generated function.
 *    c. Validates the response with the relevant Zod response schema.
 *    d. Maps the validated DTO to a domain type using a mapper in ../mappers/classroomMapper.ts.
 *    e. Returns the domain type — never a raw DTO.
 *
 * 4. If a new domain type is needed, add it to ../domain/.
 *    If a new mapping is needed, add it to ../mappers/classroomMapper.ts.
 *
 * 5. Expose the new adapter function via a custom TanStack Query hook in ../hooks/.
 *    Components should import from hooks only — never from this file directly.
 */

import { getClassroomController } from "@/generated/classroom-api/classroom-controller/classroom-controller";
import {
	createClassroomBody,
	deleteClassroomParams,
	deleteClassroomsBatchBody,
	getClassroomSummariesByMemberResponse,
	joinClassroomBody,
	joinClassroomResponse,
	getAllClassroomSummariesResponse,
	removeMemberFromClassroomParams,
	getStudentsByClassroomParams,
	getStudentsByClassroomResponse,
	getTeachersByClassroomParams,
	getTeachersByClassroomResponse,
	getRoleInClassroomParams,
	getRoleInClassroomResponse,
	updateClassroomMaterialsParams,
	updateClassroomMaterialsBody,
	getMaterialsByClassroomAndRoleParams,
	getMaterialsByClassroomAndRoleResponse,
	syncTeachersParams,
	syncTeachersBody,
	getJoinCodeParams,
	getJoinCodeResponse,
} from "@/generated/classroom-api/classroom-controller/classroom-controller.zod";

import type { ClassroomMember } from "../types/ClassroomMember";
import type {
	ClassroomMaterialAssignment,
	ClassroomMaterialReference,
} from "../types/ClassroomMaterial";
import type { ClassroomSummary } from "../types/ClassroomSummary";
import type { TeacherAssignment } from "../types/TeacherAssignment";
import type { ClassroomRole } from "../types/ClassroomRole";
import type { JoinClassroomResult } from "../types/JoinClassroomResult";
import {
	toClassroomMaterialReferences,
	toClassroomStudents,
	toClassroomSummaries,
	toJoinClassroomResult,
	toClassroomTeachers,
} from "../mappers/classroomMapper";

const ctrl = getClassroomController();

function normalizeClassroomSummaryResponse<
	T extends {
		description?: string | null;
		teachers?: Array<{ name?: string | null; surname?: string | null }>;
	},
>(items: T[]) {
	return items.map((item) => ({
		...item,
		description: item.description ?? undefined,
		teachers: item.teachers?.map((teacher) => ({
			...teacher,
			name: teacher.name ?? "Unknown",
			surname: teacher.surname ?? "Teacher",
		})),
	}));
}

export async function fetchClassroomsForUser(
	userId: number,
): Promise<ClassroomSummary[]> {
	const raw = await ctrl.getClassroomSummariesByMember(userId);

	const normalized = normalizeClassroomSummaryResponse(raw);

	const dto = getClassroomSummariesByMemberResponse.parse(normalized);
	return toClassroomSummaries(dto);
}

export async function joinClassroomByCode(
	code: string,
): Promise<JoinClassroomResult> {
	const body = joinClassroomBody.parse({ joinCode: code });
	const raw = await ctrl.joinClassroom(body);
	const dto = joinClassroomResponse.parse(raw);
	return toJoinClassroomResult(dto);
}

export async function createClassroom(
	name: string,
	description?: string,
): Promise<void> {
	const body = createClassroomBody.parse({ name, description });
	await ctrl.createClassroom(body);
}

export async function deleteClassroom(classroomId: number): Promise<void> {
	const params = deleteClassroomParams.parse({ classroomId });
	await ctrl.deleteClassroom(params.classroomId);
}

export async function batchDeleteClassrooms(
	classroomIds: number[],
): Promise<void> {
	const body = deleteClassroomsBatchBody.parse({ classroomIds });
	await ctrl.deleteClassroomsBatch(body);
}

// These should return frontend types, not generated DTOS!
export async function getAllClassroomsForAdmin(): Promise<ClassroomSummary[]> {
	// Fetch raw DTO array from the backend (admin endpoint — returns all classrooms).
	const raw = await ctrl.getAllClassroomSummaries();

	const normalized = normalizeClassroomSummaryResponse(raw);

	// Validate the normalized response shape at the ACL boundary.
	const dto = getAllClassroomSummariesResponse.parse(normalized);

	// Map validated DTOs to domain types — never return raw generated types outward.
	return toClassroomSummaries(dto);
}

export async function removeMemberFromClassroom(
	classroomId: number,
	userId: number,
): Promise<void> {
	const params = removeMemberFromClassroomParams.parse({ classroomId, userId });
	await ctrl.removeMemberFromClassroom(params.classroomId, params.userId);
}

export async function getClassroomStudents(
	classroomId: number,
): Promise<ClassroomMember[]> {
	const params = getStudentsByClassroomParams.parse({ classroomId });
	const raw = await ctrl.getStudentsByClassroom(params.classroomId);
	const dto = getStudentsByClassroomResponse.parse(raw);
	return toClassroomStudents(dto);
}

export async function getClassroomTeachers(
	classroomId: number,
): Promise<ClassroomMember[]> {
	const params = getTeachersByClassroomParams.parse({ classroomId });
	const raw = await ctrl.getTeachersByClassroom(params.classroomId);
	const dto = getTeachersByClassroomResponse.parse(raw);
	return toClassroomTeachers(dto);
}

export async function getClassroomMemberRole(
	classroomId: number,
	userId: number,
): Promise<ClassroomRole> {
	const params = getRoleInClassroomParams.parse({ classroomId, userId });
	const raw = await ctrl.getRoleInClassroom(params.classroomId, params.userId);
	const dto = getRoleInClassroomResponse.parse(raw);
	return dto.role;
}

export async function updateClassroomMaterials(
	classroomId: number,
	materials: ClassroomMaterialAssignment[],
): Promise<void> {
	const params = updateClassroomMaterialsParams.parse({ classroomId });
	const body = updateClassroomMaterialsBody.parse({ materials });
	await ctrl.updateClassroomMaterials(params.classroomId, body);
}

export async function getClassroomMaterialsByRole(
	classroomId: number,
	role: ClassroomRole,
): Promise<ClassroomMaterialReference[]> {
	const params = getMaterialsByClassroomAndRoleParams.parse({
		classroomId,
		role,
	});
	const raw = await ctrl.getMaterialsByClassroomAndRole(
		params.classroomId,
		params.role,
	);
	const dto = getMaterialsByClassroomAndRoleResponse.parse(raw);
	return toClassroomMaterialReferences(dto);
}

export async function assignTeachersToClass(
	classroomId: number,
	teachers: TeacherAssignment[],
): Promise<void> {
	const params = syncTeachersParams.parse({ classroomId });
	const body = syncTeachersBody.parse({ teachers });
	await ctrl.syncTeachers(params.classroomId, body);
}

export async function getClassroomJoinCode(
	classroomId: number,
): Promise<string> {
	const params = getJoinCodeParams.parse({ classroomId });
	const raw = await ctrl.getJoinCode(params.classroomId);
	return getJoinCodeResponse.parse(raw);
}
