import httpClient from "@/api/httpClient";

//get user classrooms based on current user
export const getUserClassrooms = async () => {
	const response = await httpClient.get("/me/classrooms");
	if (response.status !== 200) {
		throw new Error("Failed to fetch user classrooms");
	}
	return response.data; // Assuming the API returns an array of classrooms
};
