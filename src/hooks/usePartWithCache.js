// usePartWithCache.js
import { useState, useEffect, useRef } from "react";

const usePartWithCache = (classroomId, fetchSummariesFn, fetchTaskFn) => {
	const [tests, setTests] = useState([]);
	const [currentTest, setCurrentTest] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const cache = useRef({}); // Cache summaries per classroom

	const loadTest = async (testId) => {
		try {
			const task = await fetchTaskFn(testId);
			setCurrentTest(task);
		} catch (err) {
			console.error("Failed to load test:", err);
			setError("Failed to load test");
		}
	};

	useEffect(() => {
		if (!classroomId) return;

		const fetch = async () => {
			setLoading(true);
			setError(null);

			if (cache.current[classroomId]) {
				setTests(cache.current[classroomId]);
				loadTest(cache.current[classroomId][0]?.testId);
				setLoading(false);
			} else {
				try {
					const summaries = await fetchSummariesFn(classroomId);
					cache.current[classroomId] = summaries;
					setTests(summaries);
					loadTest(summaries[0]?.testId);
				} catch (err) {
					console.error("Failed to fetch summaries:", err);
					setError("Failed to load summaries");
				} finally {
					setLoading(false);
				}
			}
		};

		fetch();
	}, [classroomId, fetchSummariesFn]);

	return {
		tests,
		currentTest,
		setCurrentTest,
		loadTest,
		loading,
		error,
	};
};

export default usePartWithCache;
