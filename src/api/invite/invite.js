import httpClient from "@/api/httpClient";

export const checkInviteToken = (token) => {
	return httpClient.get(`/invite/accept/${token}`).then((res) => res.data);
};

export const acceptInvite = (token, { username, password }) => {
	return httpClient.post(`/invite/accept/${token}`, {
		username,
		password,
	});
};
