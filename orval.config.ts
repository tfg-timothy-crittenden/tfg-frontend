import { defineConfig } from "orval";

export default defineConfig({
	classroomApi: {
		input: {
			target: "http://localhost:8083/v3/api-docs",
			filters: {
				tags: ["classroom-controller"],
			},
		},
		output: {
			client: "axios",
			mode: "tags-split",
			target: "./src/generated/classroom-api/endpoints.ts",
			schemas: "./src/generated/classroom-api/model",
			override: {
				mutator: {
					path: "./src/api/mutator/custom-instance.ts",
					name: "customInstance",
				},
			},
		},
	},
	classroomApiZod: {
		input: {
			target: "http://localhost:8083/v3/api-docs",
			filters: {
				tags: ["classroom-controller"],
			},
		},
		output: {
			client: "zod",
			mode: "tags-split",
			target: "./src/generated/classroom-api/endpoints.ts",
			fileExtension: ".zod.ts",
		},
	},
});
