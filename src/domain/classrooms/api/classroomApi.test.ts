import { describe, it, expect, beforeEach, vi } from "vitest";
import { joinClassroomResponse } from "@/generated/classroom-api/classroom-controller/classroom-controller.zod";
import { joinClassroomByCode, createClassroom } from "./classroomApi";

// Hoist mock functions so they are available inside vi.mock factory
const { mockJoinClassroom, mockCreateClassroom } = vi.hoisted(() => ({
	mockJoinClassroom: vi.fn(),
	mockCreateClassroom: vi.fn(),
}));

vi.mock(
	"@/generated/classroom-api/classroom-controller/classroom-controller",
	() => ({
		getClassroomController: () => ({
			joinClassroom: mockJoinClassroom,
			createClassroom: mockCreateClassroom,
			getClassroomSummariesByMember: vi.fn(),
		}),
	}),
);

// Test data constants
const TEST_JOIN_CODE = "ABC123";
const TEST_CLASSROOM_ID = 123;
const TEST_CLASSROOM_NAME = "TOEFLV1500";
const TEST_ROLE = "STUDENT";
const TEST_MESSAGE = "Successfully joined";

const validResponseData = joinClassroomResponse.parse({
	classroomId: TEST_CLASSROOM_ID,
	classroomName: TEST_CLASSROOM_NAME,
	role: TEST_ROLE,
	message: TEST_MESSAGE,
});

describe("joinClassroomByCode", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJoinClassroom.mockResolvedValue(validResponseData);
	});

	it("should join classroom and return mapped domain result", async () => {
		const result = await joinClassroomByCode(TEST_JOIN_CODE);

		expect(result).toEqual({
			classroomId: String(TEST_CLASSROOM_ID),
			classroomName: TEST_CLASSROOM_NAME,
			role: TEST_ROLE,
		});
	});

	it("should call the API with the validated join code body", async () => {
		await joinClassroomByCode(TEST_JOIN_CODE);

		expect(mockJoinClassroom).toHaveBeenCalledWith({
			joinCode: TEST_JOIN_CODE,
		});
	});

	it("should throw when the API returns invalid data", async () => {
		mockJoinClassroom.mockResolvedValueOnce({ invalid: "data" });

		await expect(joinClassroomByCode(TEST_JOIN_CODE)).rejects.toThrow();
	});
});

describe("createClassroom", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateClassroom.mockResolvedValue(undefined);
	});

	it("should call the API with name and description", async () => {
		await createClassroom("Advanced TOEFL", "For students aiming for 100+");

		expect(mockCreateClassroom).toHaveBeenCalledWith({
			name: "Advanced TOEFL",
			description: "For students aiming for 100+",
		});
	});

	it("should call the API with name only", async () => {
		await createClassroom("Basic TOEFL");

		expect(mockCreateClassroom).toHaveBeenCalledWith({
			name: "Basic TOEFL",
			description: undefined,
		});
	});

	it("should throw when name is empty", async () => {
		await expect(createClassroom("")).rejects.toThrow();
	});
});
