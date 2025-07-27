import httpClient from "@/api/httpClient";

export const getSpeakingTaskTwoSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/2/summary");
	console.log("getSpeakingTaskTwoSummaries response:", response.data);
	return response.data; // just an array of { id, title, readingTitle }
};

export const getAllSpeakingTaskTwo = async () => {
	const response = await httpClient.get("/speaking-tasks/2");
	return response.data;
};

export const getSpeakingTaskTwoById = async (id) => {
	const response = await httpClient.get(`/speaking-tasks/2/${id}`);
	return response.data;
};

// Speaking task 3 API functions

export const getSpeakingTaskThreeSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/3/summary");
	console.log("getSpeakingTaskThreeSummaries response:", response.data);
	return response.data; // just an array of { id, title, readingTitle }
};

export const getAllSpeakingTaskThree = async () => {
	const response = await httpClient.get("/speaking-tasks/3");
	return response.data;
};

export const getSpeakingTaskThreeById = async (id) => {
	const response = await httpClient.get(`/speaking-tasks/3/${id}`);
	return response.data;
};

// Speaking task 4 API functions

export const getSpeakingTaskFourSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/4/summary");
	console.log("getSpeakingTaskThreeSummaries response:", response.data);
	return response.data; // just an array of { id, title, readingTitle }
};

export const getAllSpeakingFourThree = async () => {
	const response = await httpClient.get("/speaking-tasks/4");
	return response.data;
};

export const getSpeakingTaskFourById = async (id) => {
	const response = await httpClient.get(`/speaking-tasks/4/${id}`);
	return response.data;
};

// Speaking tests API functions

export const getAllSpeakingTests = async () => {
	const response = await httpClient.get("/admin/tests");
	return response.data;
};

export const getTestsByClassId = async (classId) => {
	const response = await httpClient.get(`/classrooms/${classId}/tests`);
	return response.data;
};
