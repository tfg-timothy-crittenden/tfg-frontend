import type { UserDto } from "@/generated/user-api/model";
import { getAuthController } from "@/generated/user-api/auth-controller/auth-controller";
import {
	changePasswordBody,
	changePasswordQueryParams,
	confirmEmailQueryParams,
	loginBody,
	requestPasswordResetBody,
	resendVerificationEmailBody,
	sendPlatformInvitationBody,
	signupWithInvitationBody,
} from "@/generated/user-api/auth-controller/auth-controller.zod";
import { getUserController } from "@/generated/user-api/user-controller/user-controller";
import {
	updateBody,
	updateParams,
} from "@/generated/user-api/user-controller/user-controller.zod";

import { toUser } from "../mappers/userMapper";
import type { User } from "../types/User";

type UnknownRecord = Record<string, unknown>;

type AuthSession = {
	token: string;
	user: User;
};

type SignupWithInvitationInput = {
	username: string;
	name: string;
	surname: string;
	invitationToken: string;
	password: string;
};

type ProfileUpdateInput = {
	name?: string;
	surname?: string;
	username?: string;
};

const auth = getAuthController();
const users = getUserController();

const asRecord = (value: unknown): UnknownRecord =>
	value && typeof value === "object" ? (value as UnknownRecord) : {};

const asMessageResponse = (value: unknown): UnknownRecord => asRecord(value);

const extractUserDto = (value: unknown): UserDto => {
	const record = asRecord(value);
	const nestedUser = record.user;
	return asRecord(nestedUser ?? record) as UserDto;
};

const toAuthSession = (value: unknown): AuthSession => {
	const record = asRecord(value);
	return {
		token: typeof record.token === "string" ? record.token : "",
		user: toUser(extractUserDto(record.user)),
	};
};

export async function loginRequest(credentials: {
	username: string;
	password: string;
}): Promise<AuthSession> {
	const body = loginBody.parse(credentials);
	const raw = await auth.login(body);
	return toAuthSession(raw);
}

export async function meRequest(): Promise<{ user: User }> {
	const raw = await auth.me();
	return { user: toUser(extractUserDto(raw)) };
}

export async function resetPasswordRequest(
	email: string,
): Promise<UnknownRecord> {
	const body = requestPasswordResetBody.parse({ email });
	const raw = await auth.requestPasswordReset(body);
	return asMessageResponse(raw);
}

export async function validateResetToken(
	token: string | null,
): Promise<{ valid: boolean }> {
	return { valid: Boolean(token) };
}

export async function confirmPasswordReset(
	token: string,
	password: string,
): Promise<UnknownRecord> {
	const params = changePasswordQueryParams.parse({ token });
	const body = changePasswordBody.parse({ newPassword: password });
	const raw = await auth.changePassword(body, params);
	return asMessageResponse(raw);
}

export async function confirmEmail(token: string): Promise<UnknownRecord> {
	const params = confirmEmailQueryParams.parse({ token });
	const raw = await auth.confirmEmail(params);
	return asMessageResponse(raw);
}

export async function resendVerificationEmail(
	email: string,
): Promise<UnknownRecord> {
	try {
		const body = resendVerificationEmailBody.parse({ email });
		const raw = await auth.resendVerificationEmail(body);
		const data = asMessageResponse(raw);

		if (typeof data.error === "string") {
			throw new Error(data.error);
		}

		return data;
	} catch (error: any) {
		const backendMessage =
			error?.response?.data?.error ||
			error?.response?.data?.message ||
			error?.message ||
			"Something went wrong. Please try again.";
		throw new Error(backendMessage);
	}
}

export async function signupWithInvitation(
	input: SignupWithInvitationInput,
): Promise<UnknownRecord> {
	const body = signupWithInvitationBody.parse(input);
	const raw = await auth.signupWithInvitation(body);
	return asMessageResponse(raw);
}

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
	const { user } = await meRequest();

	if (!user.id) {
		throw new Error("Current user id is required to update profile");
	}

	const params = updateParams.parse({ id: user.id });
	const body = updateBody.parse({
		id: user.id,
		username: input.username,
		name: input.name,
		surname: input.surname,
		email: user.email,
		roles: user.roles,
		verified: user.verified,
	});
	const raw = await users.update(params.id, body);
	return toUser(raw);
}

export async function inviteTeacherToPlatform(
	email: string,
): Promise<UnknownRecord> {
	const body = sendPlatformInvitationBody.parse({
		email,
		roleType: "TEACHER",
	});
	const raw = await auth.sendPlatformInvitation(body);
	return asMessageResponse(raw);
}
