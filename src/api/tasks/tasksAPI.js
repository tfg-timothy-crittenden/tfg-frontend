import httpClient from "@/api/httpClient";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const createMockSpeakingTests = () => [
	{ id: 1, name: "CIC 1" },
	{ id: 2, name: "CIC 2" },
	{ id: 3, name: "CIC 3" },
	{ id: 4, name: "CIC 4" },
	{ id: 5, name: "CIC 5" },
	{ id: 6, name: "CIC 6" },
	{ id: 7, name: "CIC 7" },
	{ id: 8, name: "CIC 8" },
	{ id: 9, name: "CIC 9" },
	{ id: 10, name: "CIC 10" },
];

const mockSpeakingTests = createMockSpeakingTests();

// Keyed by classroom id -> [sectionIds]
const mockClassSections = {
	1001: [1, 3, 5],
	1002: [7, 8, 9],
	1003: [2, 4, 6],
};

// Keyed by classroom id -> { teacher: number[], student: number[] }
const mockClassAssignments = {
	1001: { teacher: [1, 3, 5], student: [2, 4, 6] },
	1002: { teacher: [7, 8], student: [9, 10] },
	1003: { teacher: [3, 4], student: [1, 2] },
};

const getSectionsFromIds = (ids = []) => {
	const idSet = new Set(ids.map((id) => Number(id)));
	return mockSpeakingTests.filter((section) => idSet.has(Number(section.id)));
};

const buildMockSectionsForClassroom = (classroomId) => {
	const key = String(classroomId);
	const sectionIds =
		mockClassSections[key] || mockSpeakingTests.map((section) => section.id);
	return getSectionsFromIds(sectionIds);
};

const buildMockTaskSummariesForRole = (classroomId, role) => {
	const key = String(classroomId);
	const assignment = mockClassAssignments[key] || {
		teacher: [],
		student: [],
	};

	const roleIds = role === "teacher" ? assignment.teacher : assignment.student;
	return getSectionsFromIds(roleIds);
};

const normalizeSectionsResponse = (data) => {
	if (Array.isArray(data)) {
		return data;
	}

	return data?.sections || [];
};

const fetchClassroomSpeakingSections = async (classroomId) => {
	if (USE_MOCK_API) {
		return buildMockSectionsForClassroom(classroomId);
	}

	const { data } = await httpClient.get(
		`/material/classrooms/${classroomId}/sections`,
	);
	return normalizeSectionsResponse(data);
};

const mockResponse = (data) => Promise.resolve({ data });

export const getClassroomSpeakingSections = async (classroomId) =>
	fetchClassroomSpeakingSections(classroomId);

export const getClassroomStudentTaskSummaries = async (classroomId) => {
	if (USE_MOCK_API) {
		return buildMockTaskSummariesForRole(classroomId, "student");
	}

	const { data } = await httpClient.get(
		`/material/classrooms/${classroomId}/student-task-summaries`,
	);
	return data;
};

export const getClassroomTeacherTaskSummaries = async (classroomId) => {
	if (USE_MOCK_API) {
		return buildMockTaskSummariesForRole(classroomId, "teacher");
	}

	const { data } = await httpClient.get(
		`/material/classrooms/${classroomId}/teacher-task-summaries`,
	);
	return data;
};

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
