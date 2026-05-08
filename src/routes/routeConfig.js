/**
 * Centralized route configuration
 * This ensures DRY principles and makes route management easier
 */

// Base route segments
export const ROUTE_SEGMENTS = {
	MY: "my",
	CLASSROOMS: "classrooms",
	SECTION: "section",
	PART: "part",
	QUESTION: "question",
	ADMIN_DASHBOARD: "admin_dashboard",
	CREATE_SPEAKING_MATERIAL: "create-speaking-material",
	LOGIN: "login",
	SIGNUP: "signup",
	SIGNUP_WITH_INVITATION: "signup-with-invitation",
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
	MATERIAL_LIBRARY: "material-library",
};

/**
 * Route path builders - these generate the actual route strings
 */
export const ROUTES = {
	// Public routes
	LOGIN: `/${ROUTE_SEGMENTS.LOGIN}`,
	SIGNUP: `/${ROUTE_SEGMENTS.SIGNUP}`,
	SIGNUP_WITH_CODE: `/${ROUTE_SEGMENTS.SIGNUP}/:classCode`,
	SIGNUP_WITH_INVITATION: `/${ROUTE_SEGMENTS.SIGNUP_WITH_INVITATION}`,
	AUTH_CALLBACK: `/${ROUTE_SEGMENTS.AUTH}/${ROUTE_SEGMENTS.CALLBACK}`,
	UNAUTHORISED: `/${ROUTE_SEGMENTS.UNAUTHORISED}`,
	VERIFY_EMAIL: `/${ROUTE_SEGMENTS.VERIFY_EMAIL}`,
	RESET_PASSWORD: `/${ROUTE_SEGMENTS.RESET_PASSWORD}/`,

	PROFILE: "/profile",

	// Private routes
	CLASSROOMS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}`,
	CLASSROOM: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id`,

	CLASSROOM_MEMBERS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/members`,

	// Test routes
	// Section routes
	SECTION_INSTRUCTIONS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${MODE_SEGMENTS.INSTRUCTIONS}`,
	SECTION_PART: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber`,

	// Part-specific mode routes
	PART_INSTRUCTIONS: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber/${MODE_SEGMENTS.INSTRUCTIONS}`,
	PART_PREPARE: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber/${MODE_SEGMENTS.PREPARE}`,
	PART_SPEAK: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber/${MODE_SEGMENTS.SPEAK}`,
	PART_READ: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber/${MODE_SEGMENTS.READ}`,
	PART_LISTEN: `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/:id/${ROUTE_SEGMENTS.SECTION}/:sectionId/${ROUTE_SEGMENTS.PART}/:partNumber/${ROUTE_SEGMENTS.QUESTION}/:questionNumber/${MODE_SEGMENTS.LISTEN}`,

	// Create material route
	CREATE_SPEAKING_MATERIAL: `/${ROUTE_SEGMENTS.CREATE_SPEAKING_MATERIAL}/:id`,
	EDIT_SPEAKING_MATERIAL: `/${ROUTE_SEGMENTS.CREATE_SPEAKING_MATERIAL}/:id/edit`,

	// Admin routes
	ADMIN_DASHBOARD: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}`,
	ADMIN_TEACHERS: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.TEACHERS}`,
	ADMIN_CLASSES: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.CLASSES}`,
	ADMIN_MATERIAL: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.MATERIAL}`,
	ADMIN_MATERIAL_LIBRARY: `/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}/${ADMIN_SEGMENTS.MATERIAL_LIBRARY}`,
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
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${testId}/${MODE_SEGMENTS.INSTRUCTIONS}`,

	sectionPart: (classroomId, sectionId, partNumber) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${sectionId}/${ROUTE_SEGMENTS.PART}/${partNumber}/${ROUTE_SEGMENTS.QUESTION}/1`,

	sectionQuestion: (classroomId, sectionId, partNumber, questionNumber) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${sectionId}/${ROUTE_SEGMENTS.PART}/${partNumber}/${ROUTE_SEGMENTS.QUESTION}/${questionNumber}`,

	partMode: (classroomId, sectionId, partNumber, questionNumber, mode) => {
		const validModes = Object.values(MODE_SEGMENTS);
		if (!validModes.includes(mode)) {
			throw new Error(
				`Invalid mode: ${mode}. Valid modes are: ${validModes.join(", ")}`,
			);
		}
		const resolvedQuestionNumber = questionNumber || "1";
		return `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${sectionId}/${ROUTE_SEGMENTS.PART}/${partNumber}/${ROUTE_SEGMENTS.QUESTION}/${resolvedQuestionNumber}/${mode}`;
	},
	questionMode: (classroomId, sectionId, partNumber, questionNumber, mode) => {
		const validModes = Object.values(MODE_SEGMENTS);
		if (!validModes.includes(mode)) {
			throw new Error(
				`Invalid mode: ${mode}. Valid modes are: ${validModes.join(", ")}`,
			);
		}
		return `/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${sectionId}/${ROUTE_SEGMENTS.PART}/${partNumber}/${ROUTE_SEGMENTS.QUESTION}/${questionNumber}/${mode}`;
	},

	signupWithCode: (classCode) =>
		`/${ROUTE_SEGMENTS.SIGNUP}/${encodeURIComponent(classCode)}`,

	signupWithQuery: (classCode) =>
		`/${ROUTE_SEGMENTS.SIGNUP}?classCode=${encodeURIComponent(classCode)}`,

	// Backward compatibility functions - these call the new ones
	testPart: (classroomId, sectionId, partNumber) =>
		buildRoute.sectionPart(classroomId, sectionId, partNumber),

	sectionInstructions: (classroomId, sectionId) =>
		buildRoute.testInstructions(classroomId, sectionId),

	testInstructions: (classroomId, sectionId) =>
		`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}/${classroomId}/${ROUTE_SEGMENTS.SECTION}/${sectionId}/${MODE_SEGMENTS.INSTRUCTIONS}`,

	editSpeakingMaterial: (materialId) =>
		`/${ROUTE_SEGMENTS.CREATE_SPEAKING_MATERIAL}/${materialId}/edit`,
};

/**
 * Route pattern matchers - useful for checking current route
 */
export const routeMatchers = {
	isClassroomRoute: (pathname) =>
		pathname.startsWith(`/${ROUTE_SEGMENTS.MY}/${ROUTE_SEGMENTS.CLASSROOMS}`),

	isAdminRoute: (pathname) =>
		pathname.startsWith(`/${ROUTE_SEGMENTS.ADMIN_DASHBOARD}`),

	isSectionRoute: (pathname) =>
		pathname.includes(`/${ROUTE_SEGMENTS.SECTION}/`),

	isPartRoute: (pathname) => pathname.includes(`/${ROUTE_SEGMENTS.PART}/`),

	getPartModeFromPath: (pathname) => {
		const segments = pathname.split("/");
		const questionIndex = segments.indexOf(ROUTE_SEGMENTS.QUESTION);
		if (questionIndex !== -1 && segments[questionIndex + 2]) {
			const mode = segments[questionIndex + 2];
			return Object.values(MODE_SEGMENTS).includes(mode) ? mode : null;
		}
		return null;
	},

	isGlobalInstructions: (pathname) =>
		pathname.includes(`/${MODE_SEGMENTS.INSTRUCTIONS}`) &&
		!pathname.includes(`/${ROUTE_SEGMENTS.PART}/`) &&
		pathname.includes(`/${ROUTE_SEGMENTS.SECTION}/`),

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

	getSectionIdFromPath: (pathname) => {
		const segments = pathname.split("/");
		const sectionIndex = segments.indexOf(ROUTE_SEGMENTS.SECTION);
		if (sectionIndex !== -1 && segments[sectionIndex + 1]) {
			return segments[sectionIndex + 1];
		}
		return null;
	},

	getQuestionNumberFromPath: (pathname) => {
		const segments = pathname.split("/");
		const questionIndex = segments.indexOf(ROUTE_SEGMENTS.QUESTION);
		if (questionIndex !== -1 && segments[questionIndex + 1]) {
			return segments[questionIndex + 1];
		}
		return null;
	},
};
