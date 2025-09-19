import React from "react";

const toArrayOfObjects = (val) => {
	// Already [{ speaker?, line }]
	if (
		Array.isArray(val) &&
		val.every((x) => typeof x === "object" && x !== null)
	) {
		return val.map((x) => ({
			speaker: x.speaker,
			line: x.line ?? String(x.line ?? ""),
		}));
	}

	// Array of strings -> [{ line }]
	if (Array.isArray(val) && val.every((x) => typeof x === "string")) {
		return val.map((line) => ({ line }));
	}

	// Single string (plain text) -> split into chunks
	if (typeof val === "string") {
		const trimmed = val.trim();

		// If it *looks* like JSON, try to parse
		if (/^[\[{]/.test(trimmed)) {
			try {
				const parsed = JSON.parse(trimmed);
				return toArrayOfObjects(parsed);
			} catch (e) {
				// fall through to plain text handling
				console.warn("Invalid JSON; rendering as plain text.", e);
			}
		}

		// Plain text fallback: paragraph/sentence-ish chunks
		const chunks = trimmed
			.split(/\n{2,}/)
			.flatMap((p) => p.split(/(?<=[.?!])\s+(?=[A-Z“"'])/))
			.map((s) => s.trim())
			.filter(Boolean);

		return chunks.map((line) => ({ line }));
	}

	// Anything else -> empty
	return [];
};

const SubtitleViewer = ({ script = null }) => {
	const scriptArray = React.useMemo(() => toArrayOfObjects(script), [script]);

	return (
		<span>
			{scriptArray.map((p, idx) => (
				<p key={idx}>
					{p.speaker ? (
						<>
							<b>{p.speaker}:</b> {p.line}
						</>
					) : (
						p.line
					)}
				</p>
			))}
		</span>
	);
};

export default SubtitleViewer;
