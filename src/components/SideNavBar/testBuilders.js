/** Accepts ["A","B"] or [{ testId, title }, ...]; adds readingTitle. */
export function normalizeTestNames(testNames, readingTitle) {
	if (!Array.isArray(testNames) || testNames.length === 0) return [];
	if (testNames[0]?.testId) {
		return testNames.map((t) => ({ ...t, readingTitle }));
	}
	return testNames.map((title, i) => ({
		testId: i + 1,
		title,
		readingTitle,
	}));
}

/** Scans all parts, dedupes by testId; adds readingTitle. */
export function aggregateUniqueTestsById(summariesObj, readingTitle) {
	const tasks = [];
	Object.values(summariesObj || {}).forEach((partTasks) => {
		if (Array.isArray(partTasks)) tasks.push(...partTasks);
	});
	const seen = new Set();
	const unique = [];
	for (const task of tasks) {
		if (!seen.has(task.testId)) {
			seen.add(task.testId);
			unique.push({ testId: task.testId, title: task.title, readingTitle });
		}
	}
	return unique;
}

/** Build the Part-1 list using testNames if present; else aggregate. */
export function buildPart1Tests({
	summaries,
	readingTitle,
	allowTestNames = true,
}) {
	if (!summaries) return [];
	if (allowTestNames && summaries.testNames) {
		return normalizeTestNames(summaries.testNames, readingTitle);
	}
	return aggregateUniqueTestsById(summaries, readingTitle);
}
