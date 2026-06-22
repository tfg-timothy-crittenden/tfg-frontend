import { defineConfig } from "orval";

export default defineConfig({
	classroomZod: {
		input: {
			target: "http://localhost:8083/v3/api-docs",
		},
		output: {
			client: "zod",
			mode: "single",
			target: "./src/generated/classroom-zod.ts",
		},
	},
});
