import { defineConfig } from "orval";
import type { OpenAPIObject } from "@orval/core";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"] as const;
const ERROR_CODES = ["400", "401", "403", "503"];

/**
 * Strips error response schemas from every operation before orval processes
 * the spec. This prevents orval from generating per-operation error type alias
 * files (e.g. DeleteSpeakingSection400.ts) that are never used by app code.
 * The backend spec remains fully documented — this only affects code generation.
 */
function stripErrorResponses(spec: OpenAPIObject): OpenAPIObject {
	for (const pathItem of Object.values(spec.paths ?? {})) {
		for (const method of HTTP_METHODS) {
			const operation = (pathItem as Record<string, any>)[method];
			if (operation?.responses) {
				for (const code of ERROR_CODES) {
					delete operation.responses[code];
				}
			}
		}
	}
	return spec;
}

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
	materialApi: {
		input: {
			target: "http://localhost:8082/v3/api-docs",
			transformer: stripErrorResponses,
		},
		output: {
			client: "axios",
			mode: "tags-split",
			target: "./src/generated/material-api/endpoints.ts",
			schemas: "./src/generated/material-api/model",
			override: {
				mutator: {
					path: "./src/api/mutator/custom-instance.ts",
					name: "customInstance",
				},
			},
		},
	},
	materialApiZod: {
		input: {
			target: "http://localhost:8082/v3/api-docs",
			transformer: stripErrorResponses,
		},
		output: {
			client: "zod",
			mode: "tags-split",
			target: "./src/generated/material-api/endpoints.ts",
			fileExtension: ".zod.ts",
		},
	},
});
