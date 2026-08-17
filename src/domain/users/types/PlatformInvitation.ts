import type { UserRole } from "./UserRole";

export type PlatformInvitationStatus =
	| "PENDING"
	| "ACCEPTED"
	| "EXPIRED"
	| "CANCELLED";

export type PlatformInvitation = {
	id: number;
	createdByUserId?: number;
	inviteeEmail: string;
	createdAt: string;
	expiresAt: string;
	confirmedAt?: string;
	invitationStatus: PlatformInvitationStatus;
	roleType: UserRole;
};
