import { describe, expect, it } from "vitest";

import { createAssignmentsPayload } from "./classroomAssignmentUtils";

describe("createAssignmentsPayload", () => {
	it("creates role assignments from selected material IDs", () => {
		const payload = createAssignmentsPayload(new Set([42]), new Set(), [
			{
				id: "42",
				name: "Integrated speaking drill",
				description: "Practice material",
				part1Title: "Read and listen",
				part2Title: "Speak",
			},
		]);

		expect(payload).toEqual([
			{
				materialId: 42,
				assignedToRole: "TEACHER",
			},
		]);
	});
});
