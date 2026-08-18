/**
 * User API adapter — the anti-corruption layer between generated Orval code and the app.
 *
 * Regenerate with `npm run generate:user-api` after the user-service OpenAPI spec changes.
 * Adapter functions validate generated params/bodies, call generated controllers, and return
 * domain types instead of raw DTOs.
 */

import { getPlatformInvitationController } from "@/generated/user-api/platform-invitation-controller/platform-invitation-controller";
import {
	deleteInvitationsBody,
	resendInvitationParams,
} from "@/generated/user-api/platform-invitation-controller/platform-invitation-controller.zod";
import { getUserController } from "@/generated/user-api/user-controller/user-controller";
import { removeRoleParams } from "@/generated/user-api/user-controller/user-controller.zod";

import {
	toBatchDeleteResult,
	toPlatformInvitations,
	toUser,
	toUsers,
} from "../mappers/userMapper";
import type { BatchDeleteResult } from "../types/BatchDeleteResult";
import type { PlatformInvitation } from "../types/PlatformInvitation";
import type { User } from "../types/User";

const users = getUserController();
const invitations = getPlatformInvitationController();

export async function getAllTeachers(): Promise<User[]> {
	const raw = await users.getAllTeachers();
	return toUsers(raw);
}

export async function removeTeacherRole(userId: number): Promise<User> {
	const params = removeRoleParams.parse({ id: userId, roleType: "TEACHER" });
	const raw = await users.removeRole(params.id, params.roleType);
	return toUser(raw);
}

export async function getPendingTeacherInvitations(): Promise<
	PlatformInvitation[]
> {
	const raw = await invitations.getPendingTeacherInvitations();
	return toPlatformInvitations(raw);
}

export async function resendPlatformInvitation(
	invitationId: number,
): Promise<void> {
	const params = resendInvitationParams.parse({ id: invitationId });
	await invitations.resendInvitation(params.id);
}

export async function batchDeletePlatformInvitations(
	invitationIds: number[] = [],
): Promise<BatchDeleteResult> {
	if (invitationIds.length === 0) {
		return { deleted: [], notFound: [] };
	}

	const body = deleteInvitationsBody.parse({ ids: invitationIds });
	const raw = await invitations.deleteInvitations(body);
	return toBatchDeleteResult(raw);
}
