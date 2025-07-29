import httpClient from "@/api/httpClient";

export const getSpeakingTaskTwoSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/2/summary");
	console.log("getSpeakingTaskTwoSummaries response:", response.data);
	return response.data; // just an array of { id, title, readingTitle }
};

// Speaking tests API functions

export const getAllSpeakingTests = async () => {
	const response = await httpClient.get("/admin/tests");
	return response.data;
};

export const getTestsByClassId = async (classroomId) => {
	try {
		const response = await httpClient.get(
			`/material/classrooms/${classroomId}/tests`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching classroom tests:", error);
		throw error;
	}
};

export const assignTestsToClassroom = async (classroomId, assignments) => {
	return httpClient.post(`/material/classrooms/${classroomId}/tests`, {
		assignments,
	});
};

export const getClassroomTaskSummaries = async (classroomId) => {
	const { data } = await httpClient.get(
		`material/classrooms/${classroomId}/task-summaries`
	);
	return data; // Expected shape: { part2: [...], part3: [...], part4: [...] }
};

// api/tasks/tasksAPI.js

export const getSpeakingTaskTwoById = async (id) => {
	const { data } = await httpClient.get(`/material/tasks/part2/${id}`);
	return data;
};

export const getSpeakingTaskThreeById = async (id) => {
	const { data } = await httpClient.get(`/material/tasks/part3/${id}`);
	return data;
};

export const getSpeakingTaskFourById = async (id) => {
	const { data } = await httpClient.get(`/material/tasks/part4/${id}`);
	return data;
};
