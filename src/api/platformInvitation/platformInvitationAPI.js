import httpClient from "@/api/httpClient";

const BASE_URL = "/users/api/platform-invitations";

export const getPendingTeacherInvitations = async () => {
	const { data } = await httpClient.get(`${BASE_URL}/pending-teachers`);
	return Array.isArray(data) ? data : [];
};

export const resendPlatformInvitation = async (invitationId) => {
	const { data } = await httpClient.post(`${BASE_URL}/${invitationId}/resend`);
	return data;
};

export const batchDeletePlatformInvitations = async (invitationIds = []) => {
	if (!Array.isArray(invitationIds) || invitationIds.length === 0) {
		return { deleted: [], notFound: [] };
	}

	const { data } = await httpClient.delete(`${BASE_URL}`, {
		data: { ids: invitationIds },
	});

	return data || { deleted: [], notFound: [] };
};
