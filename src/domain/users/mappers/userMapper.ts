import type {
	BatchDeleteResponse,
	PlatformInvitationDto,
	UserDto,
} from "@/generated/user-api/model";

import type { BatchDeleteResult } from "../types/BatchDeleteResult";
import type { PlatformInvitation } from "../types/PlatformInvitation";
import type { User } from "../types/User";
import type { UserRole } from "../types/UserRole";

const toUserRoles = (roles: string[] | undefined): UserRole[] =>
	(roles ?? []).filter((role): role is UserRole =>
		["TEACHER", "STUDENT", "ADMIN"].includes(role),
	);

export function toUser(dto: UserDto): User {
	return {
		id: dto.id ?? 0,
		username: dto.username,
		name: dto.name ?? "",
		surname: dto.surname,
		email: dto.email ?? "",
		roles: toUserRoles(dto.roles),
		verified: dto.verified ?? false,
	};
}

export function toUsers(dtos: UserDto[]): User[] {
	return dtos.map(toUser);
}

export function toPlatformInvitation(
	dto: PlatformInvitationDto,
): PlatformInvitation {
	return {
		id: dto.id ?? 0,
		createdByUserId: dto.createdByUserId,
		inviteeEmail: dto.inviteeEmail ?? "",
		createdAt: dto.createdAt ?? "",
		expiresAt: dto.expiresAt ?? "",
		confirmedAt: dto.confirmedAt,
		invitationStatus: dto.invitationStatus ?? "PENDING",
		roleType: dto.roleType ?? "TEACHER",
	};
}

export function toPlatformInvitations(
	dtos: PlatformInvitationDto[],
): PlatformInvitation[] {
	return dtos.map(toPlatformInvitation);
}

export function toBatchDeleteResult(
	dto: BatchDeleteResponse | undefined,
): BatchDeleteResult {
	return {
		deleted: dto?.deleted ?? [],
		notFound: dto?.notFound ?? [],
	};
}
