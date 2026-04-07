import httpClient from "@/api/httpClient";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const createMockSpeakingTests = () => [
	{ id: 1, name: "CIC 1", part: 2 },
	{ id: 2, name: "CIC 2", part: 2 },
	{ id: 3, name: "CIC 3", part: 3 },
	{ id: 4, name: "CIC 4", part: 3 },
	{ id: 5, name: "CIC 5", part: 4 },
	{ id: 6, name: "CIC 6", part: 4 },
	{ id: 7, name: "CIC 7", part: 2 },
	{ id: 8, name: "CIC 8", part: 3 },
	{ id: 9, name: "CIC 9", part: 4 },
	{ id: 10, name: "CIC 10", part: 2 },
];

const mockSpeakingTests = createMockSpeakingTests();

// Keyed by classroom id -> { teacher: number[], student: number[] }
const mockClassAssignments = {
	1001: { teacher: [4008, 4009, 4010], student: [4004, 4005, 4006] },
	1002: { teacher: [4001, 4002], student: [4003, 4007] },
	1003: { teacher: [], student: [] },
};

const getTestsFromIds = (ids = []) => {
	const idSet = new Set(ids.map((id) => Number(id)));
	return mockSpeakingTests.filter((test) => idSet.has(Number(test.id)));
};

const buildMockTaskSummariesForRole = (classroomId, role) => {
	const key = String(classroomId);
	const assignment = mockClassAssignments[key] || {
		teacher: [],
		student: [],
	};

	const roleIds = role === "teacher" ? assignment.teacher : assignment.student;
	const roleTests = getTestsFromIds(roleIds);

	// Ensure sidebar has useful mock data even for empty/unassigned classes.
	const effectiveTests =
		roleTests.length > 0
			? roleTests
			: mockSpeakingTests
					.filter((test) => test.part >= 2 && test.part <= 4)
					.slice(0, 3);

	const summaries = {
		testNames: effectiveTests.map((test) => test.name),
		part2: [],
		part3: [],
		part4: [],
	};

	effectiveTests.forEach((test) => {
		const keyByPart = `part${test.part}`;
		if (!summaries[keyByPart]) {
			summaries[keyByPart] = [];
		}

		summaries[keyByPart].push({
			testId: Number(test.id),
			title: test.name,
		});
	});

	return summaries;
};

const mockResponse = (data) => Promise.resolve({ data });

export const getSpeakingTaskTwoSummaries = async () => {
	const response = await httpClient.get("/speaking-tasks/2/summary");

	return response.data; // just an array of { id, title, readingTitle }
};

// Speaking tests API functions

export const getAllSpeakingTests = async () => {
	if (USE_MOCK_API) {
		return [...mockSpeakingTests];
	}

	const response = await httpClient.get("/admin/tests");
	return response.data;
};

export const getTestsByClassId = async (classroomId) => {
	try {
		if (USE_MOCK_API) {
			const key = String(classroomId);
			const assignment = mockClassAssignments[key] || {
				teacher: [],
				student: [],
			};

			return {
				teacherMaterial: getTestsFromIds(assignment.teacher),
				studentMaterial: getTestsFromIds(assignment.student),
			};
		}

		const response = await httpClient.get(
			`/material/classrooms/${classroomId}/tests`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching classroom tests:", error);
		throw error;
	}
};

export const assignTestsToClassroom = async (classroomId, assignments) => {
	if (USE_MOCK_API) {
		const key = String(classroomId);
		const teacher = [];
		const student = [];

		(assignments || []).forEach(({ testId, role }) => {
			if (role === "teacher") teacher.push(Number(testId));
			if (role === "student") student.push(Number(testId));
		});

		mockClassAssignments[key] = { teacher, student };
		return mockResponse({ success: true });
	}

	return httpClient.post(`/material/classrooms/${classroomId}/tests`, {
		assignments,
	});
};

export const getClassroomStudentTaskSummaries = async (classroomId) => {
	if (USE_MOCK_API) {
		return buildMockTaskSummariesForRole(classroomId, "student");
	}

	const { data } = await httpClient.get(
		`material/classrooms/${classroomId}/student-task-summaries`,
	);
	return data; // Expected shape: { part2: [...], part3: [...], part4: [...] }
};
export const getClassroomTeacherTaskSummaries = async (classroomId) => {
	if (USE_MOCK_API) {
		return buildMockTaskSummariesForRole(classroomId, "teacher");
	}

	const { data } = await httpClient.get(
		`material/classrooms/${classroomId}/teacher-task-summaries`,
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
