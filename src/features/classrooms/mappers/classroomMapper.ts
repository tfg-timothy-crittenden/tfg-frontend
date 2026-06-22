import type { JoinClassroomResponseDto } from "../api/classroomDtoTypes";
import type { JoinClassroomResult } from "../domain/JoinClassroomResult";

export function toJoinClassroomResult(
	dto: JoinClassroomResponseDto,
): JoinClassroomResult {
	return {
		classroomId: String(dto.classroomId),
		classroomName: dto.classroomName,
		role: dto.role,
	};
}
