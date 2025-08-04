import httpClient from "@/api/httpClient";

export const getSpeakingTaskTwoSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/2/summary");

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

export const getClassroomStudentTaskSummaries = async (classroomId) => {
	const { data } = await httpClient.get(
		`material/classrooms/${classroomId}/student-task-summaries`
	);
	return data; // Expected shape: { part2: [...], part3: [...], part4: [...] }
};
export const getClassroomTeacherTaskSummaries = async (classroomId) => {
	const { data } = await httpClient.get(
		`material/classrooms/${classroomId}/teacher-task-summaries`
	);
	return data; // Expected shape: { part2: [...], part3: [...], part4: [...] }
};

// api/tasks/tasksAPI.js

//TEMPORARY: This is a temporary solution to fetch the list of topics for speaking part 1
//TODO: Replace with a proper API endpoint when available
export const getSpeakingTaskOneTopics = async () => {
	const response = await fetch("/questions_part_1_and_officials.json");
	const data = await response.json();
	const topics = Object.keys(data);
	console.log("Response from /questions_part_1_and_officials.json:", topics);
	return topics;
};

//TEMPORARY: This is a temporary solution to fetch a random speaking task by topic ID
//TODO: Replace with a proper API endpoint when available
export const getRandomSpeakingTaskOneByTopic = async (topic) => {
	try {
		console.log("Fetching random speaking task for topic:", topic);
		const response = await fetch("/questions_part_1_and_officials.json");

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}

		const data = await response.json();
		const questions = data[topic];

		if (!Array.isArray(questions) || questions.length === 0) {
			console.warn(`No questions found for topic: ${topic}`);
			return null;
		}

		const randomIndex = Math.floor(Math.random() * questions.length);
		return questions[randomIndex];
	} catch (error) {
		console.error("Error fetching speaking tasks:", error);
		return null;
	}
};

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
