// src/routes/routeConfig.js
/**
 * Centralized route configuration for the TOEFL Speaking app
 * This ensures DRY principles and makes route management easier
 */

// Base route segments
export const ROUTE_SEGMENTS = {
	MY: "my",
	CLASSROOMS: "classrooms",
	TEST: "test",
	PART: "part",
	ADMIN_DASHBOARD: "admin_dashboard",
	LOGIN: "login",
	SIGNUP: "signup",
	AUTH: "auth",
	CALLBACK: "callback",
	UNAUTHORISED: "unauthorised",
	VERIFY_EMAIL: "verify-email",
	RESET_PASSWORD: "password-reset",
};

// Mode segments
export const MODE_SEGMENTS = {
	INSTRUCTIONS: "instructions",
	PREPARE: "prepare",
	SPEAK: "speak",
	READ: "read",
	LISTEN: "listen",
};

// Admin route segments
export const ADMIN_SEGMENTS = {
	TEACHERS: "teachers",
	CLASSES: "classes",
	MATERIALS: "materials",
};

/**
 * Route path builders - these generate the actual route strings
 */
export const ROUTES = {
	// Public routes
	LOGIN: `/${ROUTE_SEGMENTS.LOGIN}`,
	SIGNUP: `/${ROUTE_SEGMENTS.SIGNUP}`,
	SIGNUP_WITH_CODE: `/${ROUTE_SEGMENTS.SIGNUP}/:classCode`,
	AUTH_CALLBACK: `/${ROUTE_SEGMENTS.AUTH}/${ROUTE_SEGMENTS.CALLBACK}`,
	UNAUTHORISED: `/${ROUTE_SEGMENTS.UNAUTHORISED}`,
	VERIFY_EMAIL: `/${ROUTE_SEGMENTS.VERIFY_EMAIL}`,
	VERIFY_EMAIL_WITH_TOKEN: `/${ROUTE_SEGMENTS.VERIFY_EMAIL}/:token`,
	RESET_PASSWORD: `/${ROUTE_SEGMENTS.RESET_PASSWORD}/`,

	// Private routes
	CLASSROOMS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}`,
	CLASSROOM: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id`,

	CLASSROOM_MEMBERS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/members`,

	// Test routes
	TEST_INSTRUCTIONS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${MODE_SEGMENTS.INSTRUCTIONS}`,
	TEST_PART: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber`,

	// Topic route for Part 1
	PART_TOPIC: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/topic/:topicName`,

	// Part-specific mode routes
	PART_INSTRUCTIONS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/${MODE_SEGMENTS.INSTRUCTIONS}`,
	PART_PREPARE: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/${MODE_SEGMENTS.PREPARE}`,
	PART_SPEAK: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/${MODE_SEGMENTS.SPEAK}`,
	PART_READ: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/${MODE_SEGMENTS.READ}`,
	PART_LISTEN: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.TEST}/:testId/${ROUTE_SEGMENTS.PART}/:partNumber/${MODE_SEGMENTS.LISTEN}`,

	// Admin routes
	ADMIN_DASHBOARD: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}`,
	ADMIN_TEACHERS: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.TEACHERS}`,
	ADMIN_CLASSES: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.CLASSES}`,
	ADMIN_MATERIAL: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.MATERIAL}`,
};

/**
 * Route builders - generate URLs with actual values
 */
export const buildRoute = {
	classroom: (classroomId) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}`,

	classroomMembers: (classroomId) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/members`,

	testInstructions: (classroomId, testId) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.TEST}/${testId}/${MODE_SEGMENTS.INSTRUCTIONS}`,

	testPart: (classroomId, testId, partNumber) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.TEST}/${testId}/${ROUTE_SEGMENTS.PART}/${partNumber}`,

	partMode: (classroomId, testId, partNumber, mode) => {
		const validModes = Object.values(MODE_SEGMENTS);
		if (!validModes.includes(mode)) {
			throw new Error(
				`Invalid mode: ${mode}. Valid modes are: ${validModes.join(", ")}`
			);
		}
		return `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.TEST}/${testId}/${ROUTE_SEGMENTS.PART}/${partNumber}/${mode}`;
	},
	partTopic: (classroomId, testId, mode, topic) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.TEST}/${testId}/${ROUTE_SEGMENTS.PART}/1/${mode}?topic=${topic}`,

	signupWithCode: (classCode) =>
		`/${ROUTE_SEGMENTS.SIGNUP}/${encodeURIComponent(classCode)}`,

	signupWithQuery: (classCode) =>
		`/${ROUTE_SEGMENTS.SIGNUP}?classCode=${encodeURIComponent(classCode)}`,
};

/**
 * Route pattern matchers - useful for checking current route
 */
export const routeMatchers = {
	isClassroomRoute: (pathname) =>
		pathname.startsWith(`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}`),

	isAdminRoute: (pathname) =>
		pathname.startsWith(`/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}`),

	isTestRoute: (pathname) => pathname.includes(`/${ROUTE_SEGMENTS.TEST}/`),

	isPartRoute: (pathname) => pathname.includes(`/${ROUTE_SEGMENTS.PART}/`),

	getPartModeFromPath: (pathname) => {
		const segments = pathname.split("/");
		const partIndex = segments.indexOf(ROUTE_SEGMENTS.PART);
		if (partIndex !== -1 && segments[partIndex + 2]) {
			const mode = segments[partIndex + 2];
			return Object.values(MODE_SEGMENTS).includes(mode) ? mode : null;
		}
		return null;
	},

	isGlobalInstructions: (pathname) =>
		pathname.includes(`/${MODE_SEGMENTS.INSTRUCTIONS}`) &&
		!pathname.includes(`/${ROUTE_SEGMENTS.PART}/`),

	getTopicFromPath: (pathname) => {
		const segments = pathname.split("/");
		const topicIndex = segments.indexOf("topic");
		if (topicIndex !== -1 && segments[topicIndex + 1]) {
			return decodeURIComponent(segments[topicIndex + 1]);
		}
		return null;
	},
	isClassroomMembers: (pathname) =>
		/^\/my\/classrooms\/[^/]+\/members$/.test(pathname),
};
