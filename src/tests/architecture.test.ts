// @vitest-environment node
/// <reference types="node" />

/**
 * Architecture tests — enforce anti-corruption layer (ACL) boundaries.
 *
 * Allowed dependency flow:
 *
 *   pages / components
 *        ↓
 *      hooks
 *        ↓
 *   api adapter  ←→  mappers
 *        ↓                ↓
 *    generated        domain (pure, no external deps)
 *
 * Rules checked:
 *   1. Only api adapters and mappers may import from src/generated
 *   2. Pages may not import from feature api adapters (must go through hooks)
 *   3. Pages may not import from mappers directly
 *   4. Hooks may not import from mappers
 *   5. Domain types must be pure (no generated, no api, no hooks, no mappers)
 *   6. App-level components may not import from generated
 */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, "..").replace(/\\/g, "/");

// ─── File collection ──────────────────────────────────────────────────────────

function collectFiles(dir: string): string[] {
	const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
	const IGNORED_DIRS = new Set(["generated", "node_modules", "__snapshots__"]);

	const entries = fs.readdirSync(dir, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const full = path.join(dir, entry.name).replace(/\\/g, "/");
		if (entry.isDirectory()) {
			return IGNORED_DIRS.has(entry.name) ? [] : collectFiles(full);
		}
		// Exclude test/spec files — they intentionally cross layer boundaries via mocks
		if (entry.name.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) return [];
		if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) return [full];
		return [];
	});
}

// ─── Import extraction ────────────────────────────────────────────────────────

function extractImports(filePath: string): string[] {
	const content = fs.readFileSync(filePath, "utf-8");
	// Matches: import ... from "...", export ... from "...", import("...")
	const re = /(?:from|import)\s*['"]([^'"]+)['"]/g;
	const results: string[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(content)) !== null) {
		results.push(m[1]);
	}
	return results;
}

/** Resolve an import specifier to an absolute path, or null for external packages. */
function resolveImport(fromFile: string, imp: string): string | null {
	if (imp.startsWith("@/")) {
		return (SRC + "/" + imp.slice(2)).replace(/\/\//g, "/");
	}
	if (imp.startsWith(".")) {
		return path.resolve(path.dirname(fromFile), imp).replace(/\\/g, "/");
	}
	return null; // external npm package — not relevant
}

// ─── Path classifiers ─────────────────────────────────────────────────────────

const matchesLayer = (layer: string) => (p: string) =>
	new RegExp(`/domain/[^/]+/${layer}/`).test(p);

const isGenerated = (p: string) => p.includes("/generated/");
const isFeatureApi = matchesLayer("api");
const isFeatureMappers = matchesLayer("mappers");
const isFeatureHooks = matchesLayer("hooks");

const isPageFile = matchesLayer("pages");
const isHookFile = matchesLayer("hooks");
const isDomainFile = matchesLayer("types");
const isMapperFile = matchesLayer("mappers");
const isAppComponentFile = (p: string) =>
	p.includes("/components/") && !matchesLayer("pages")(p);

// ─── Rule engine ──────────────────────────────────────────────────────────────

interface Violation {
	file: string;
	importPath: string;
}

function findViolations(
	allFiles: string[],
	fileFilter: (f: string) => boolean,
	importFilter: (resolvedPath: string) => boolean,
): Violation[] {
	return allFiles.filter(fileFilter).flatMap((file) =>
		extractImports(file)
			.map((imp) => ({ imp, resolved: resolveImport(file, imp) }))
			.filter(({ resolved }) => resolved !== null && importFilter(resolved!))
			.map(({ imp }) => ({
				file: path.relative(SRC, file).replace(/\\/g, "/"),
				importPath: imp,
			})),
	);
}

function report(violations: Violation[]): string {
	return (
		"\n" +
		violations
			.map((v) => `  ${v.file}\n    └─ imports "${v.importPath}"`)
			.join("\n")
	);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const allFiles = collectFiles(SRC);

describe("Architecture: ACL boundary enforcement", () => {
	it("Rule 1a — pages must not import from src/generated (use hooks instead)", () => {
		const violations = findViolations(allFiles, isPageFile, isGenerated);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 1b — hooks must not import from src/generated (use api adapter instead)", () => {
		const violations = findViolations(allFiles, isHookFile, isGenerated);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 1c — app-level components must not import from src/generated", () => {
		const violations = findViolations(
			allFiles,
			isAppComponentFile,
			isGenerated,
		);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 1d — domain types must not import from src/generated", () => {
		const violations = findViolations(allFiles, isDomainFile, isGenerated);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 2 — pages must not import from feature api adapters (must go through hooks)", () => {
		const violations = findViolations(allFiles, isPageFile, isFeatureApi);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 3 — pages must not import from mappers directly", () => {
		const violations = findViolations(allFiles, isPageFile, isFeatureMappers);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 4 — hooks must not import from mappers directly (mappers belong to the adapter)", () => {
		const violations = findViolations(allFiles, isHookFile, isFeatureMappers);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 5a — domain types must not import from feature api adapters", () => {
		const violations = findViolations(allFiles, isDomainFile, isFeatureApi);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 5b — domain types must not import from feature hooks", () => {
		const violations = findViolations(allFiles, isDomainFile, isFeatureHooks);
		expect(violations, report(violations)).toHaveLength(0);
	});

	it("Rule 5c — domain types must not import from mappers", () => {
		const violations = findViolations(allFiles, isDomainFile, isFeatureMappers);
		expect(violations, report(violations)).toHaveLength(0);
	});
});
