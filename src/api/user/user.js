import httpClient from "@/api/httpClient";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const mockUserClassrooms = [
	{
		id: 1001,
		name: "TOEFL Morning A",
		subject: "Speaking",
		code: "TMORNA",
		teachers: ["Aina Ferrer"],
	},
	{
		id: 1002,
		name: "TOEFL Evening B",
		subject: "Speaking",
		code: "TEVBNG",
		teachers: ["Roger Costa"],
	},
	{
		id: 1003,
		name: "Independent Practice",
		subject: "Self-study",
		code: "INDPRC",
		teachers: [],
	},
];

//get user classrooms based on current user
export const getUserClassrooms = async () => {
	if (USE_MOCK_API) {
		return [...mockUserClassrooms];
	}

	const response = await httpClient.get("/me/classrooms");
	if (response.status !== 200) {
		throw new Error("Failed to fetch user classrooms");
	}
	return response.data; // Assuming the API returns an array of classrooms
};

export const checkEmailExists = async (email) => {
	if (!email) return false;
	const res = await httpClient.get(
		`/student/check-email?email=${encodeURIComponent(email)}`,
	);
	return res.data.exists;
};
