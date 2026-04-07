import httpClient from "@/api/httpClient";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const createMockTeachers = () => [
	{
		id: 101,
		name: "Aina Ferrer",
		email: "aina.ferrer@fundaciocic.org",
		status: "active",
	},
	{
		id: 102,
		name: "Roger Costa",
		email: "roger.costa@fundaciocic.org",
		status: "active",
	},
	{
		id: 201,
		name: "Marta Vila",
		email: "marta.vila@fundaciocic.org",
		status: "invited",
	},
	{
		id: 202,
		name: "Nuria Puig",
		email: "nuria.puig@fundaciocic.org",
		status: "invited",
	},
];

let mockTeachers = createMockTeachers();

const createMockClasses = () => [
	{
		id: 1001,
		name: "TOEFL Morning A",
		subject: "Speaking",
		code: "TMORNA",
		teachers: [
			{
				id: 101,
				name: "Aina Ferrer",
				status: "active",
			},
		],
	},
	{
		id: 1002,
		name: "TOEFL Evening B",
		subject: "Speaking",
		code: "TEVBNG",
		teachers: [
			{
				id: 102,
				name: "Roger Costa",
				status: "active",
			},
		],
	},
	{
		id: 1003,
		name: "Independent Practice",
		subject: "Self-study",
		code: "INDPRC",
		teachers: [],
	},
];

let mockClasses = createMockClasses();

const mockResponse = (data) => Promise.resolve({ data });

const generateClassCode = () =>
	Math.random().toString(36).slice(2, 8).toUpperCase();

export const inviteTeacher = ({ name, email }) => {
	if (USE_MOCK_API) {
		const nextId =
			mockTeachers.reduce(
				(maxId, teacher) => Math.max(maxId, Number(teacher.id) || 0),
				0,
			) + 1;

		mockTeachers = [
			...mockTeachers,
			{
				id: nextId,
				name,
				email,
				status: "invited",
			},
		];

		return mockResponse({ success: true });
	}

	return httpClient.post("/admin/teachers/invite", {
		name,
		email,
	});
};

export const removeTeacherFromSchool = (teacherId) => {
	if (USE_MOCK_API) {
		mockTeachers = mockTeachers.filter(
			(teacher) => !(teacher.id === teacherId && teacher.status === "active"),
		);
		return mockResponse({ success: true });
	}

	return httpClient.delete(`/admin/teachers/${teacherId}`);
};

export const createClass = (classData) => {
	if (USE_MOCK_API) {
		const nextId =
			mockClasses.reduce(
				(maxId, cls) => Math.max(maxId, Number(cls.id) || 0),
				0,
			) + 1;

		const newClass = {
			id: nextId,
			name: classData?.name || `Class ${nextId}`,
			subject: classData?.subject || "",
			code: generateClassCode(),
			teachers: [],
		};

		mockClasses = [...mockClasses, newClass];
		return mockResponse(newClass);
	}

	return httpClient.post("/admin/classes", classData);
};

export const deleteClass = (classId) => {
	if (USE_MOCK_API) {
		mockClasses = mockClasses.filter(
			(cls) => String(cls.id) !== String(classId),
		);
		return mockResponse({ success: true });
	}

	return httpClient.delete(`/admin/classes/${classId}`);
};

export const fetchAllClassesAndTeachers = () => {
	if (USE_MOCK_API) {
		return mockResponse(mockClasses);
	}

	return httpClient.get("/admin/classes");
};

export const assignTeachersToClass = (classId, teacherIds) => {
	if (USE_MOCK_API) {
		const selectedTeacherIds = new Set(
			(teacherIds || []).map((id) => Number(id)),
		);
		const selectedTeachers = mockTeachers
			.filter((teacher) => selectedTeacherIds.has(Number(teacher.id)))
			.map((teacher) => ({
				id: teacher.id,
				name: teacher.name,
				status: teacher.status,
			}));

		mockClasses = mockClasses.map((cls) =>
			String(cls.id) === String(classId)
				? {
						...cls,
						teachers: selectedTeachers,
					}
				: cls,
		);

		return mockResponse({ success: true });
	}

	return httpClient.post(`/admin/classes/${classId}/teachers`, {
		teacherIds,
	});
};

export const fetchAllTeachers = () => {
	if (USE_MOCK_API) {
		return mockResponse(mockTeachers);
	}

	return httpClient.get("/admin/all-teachers");
};

export const fetchInvitedTeachers = () => {
	if (USE_MOCK_API) {
		return mockResponse(
			mockTeachers.filter((teacher) => teacher.status === "invited"),
		);
	}

	return httpClient.get("/admin/invited-teachers");
};

export const fetchActiveTeachers = () => {
	if (USE_MOCK_API) {
		return mockResponse(
			mockTeachers.filter((teacher) => teacher.status === "active"),
		);
	}

	return httpClient.get("/admin/active-teachers");
};

export const cancelInvite = (id) => {
	if (USE_MOCK_API) {
		mockTeachers = mockTeachers.filter(
			(teacher) => !(teacher.id === id && teacher.status === "invited"),
		);
		return mockResponse({ success: true });
	}

	return httpClient.patch(`/admin/cancel-invite/${id}`);
};

export const resendInvite = (id) => {
	if (USE_MOCK_API) {
		return mockResponse({ success: true });
	}

	return httpClient.post(`/admin/resend-invite/${id}`);
};
