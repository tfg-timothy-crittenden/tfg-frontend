import { describe, expect, it } from "vitest";

import { createAssignmentsPayload } from "./classroomAssignmentUtils";

describe("createAssignmentsPayload", () => {
	it("resolves library materials when selected IDs use a different primitive type", () => {
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
				name: "Integrated speaking drill",
				description: "Practice material",
				part1Title: "Read and listen",
				part2Title: "Speak",
				assignedToRole: "TEACHER",
			},
		]);
	});
});
