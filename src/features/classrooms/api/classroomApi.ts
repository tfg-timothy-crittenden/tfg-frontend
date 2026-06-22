import httpClient from "@/api/httpClient";
import {
	joinClassroomBody,
	joinClassroomResponse,
} from "@/generated/classroom-zod";

import type { JoinClassroomResult } from "../domain/JoinClassroomResult";
import { toJoinClassroomResult } from "../mappers/classroomMapper";

const CLASSROOMS_API_BASE = import.meta.env.VITE_CLASSROOMS_API_URL;

export async function joinClassByCode(
	joinCode: string,
): Promise<JoinClassroomResult> {
	const body = joinClassroomBody.parse({ joinCode });

	const { data } = await httpClient.post(`${CLASSROOMS_API_BASE}/join`, body);

	const dto = joinClassroomResponse.parse(data);

	return toJoinClassroomResult(dto);
}
