import type { UserRole } from "./UserRole";

export type User = {
	id: number;
	username?: string;
	name: string;
	surname?: string;
	email: string;
	roles: UserRole[];
	verified: boolean;
};
