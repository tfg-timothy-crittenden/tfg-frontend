import { useEffect, useState } from "react";
import { getClassroomMaterialListByRole } from "@/api/classes/classesAPI";

const normalizeTaskSummary = (task = {}) => {
	const testId = task.id ?? task.materialId;

	return {
		...task,
		testId,
		sectionTitle: task.sectionTitle || task.name || "Untitled section",
		part1Title: task.part1Title || "",
		part2Title: task.part2Title || "",
	};
};

const normalizeTaskSummaryList = (tasks) => {
	if (!Array.isArray(tasks)) return [];
	return tasks.map(normalizeTaskSummary);
};

export function useTaskSummaries(classroomId, hasTeacherRole) {
	const [student, setStudent] = useState([]);
	const [teacher, setTeacher] = useState([]);

	useEffect(() => {
		let cancelled = false;
		setStudent([]);
		setTeacher([]);

		if (!classroomId) {
			return () => {
				cancelled = true;
			};
		}

		(async () => {
			try {
				const data = await getClassroomMaterialListByRole(
					classroomId,
					"student",
				);
				if (!cancelled) setStudent(normalizeTaskSummaryList(data));
			} catch (e) {
				console.error("Failed to load student summaries:", e);
			}
		})();

		(async () => {
			if (!hasTeacherRole) {
				setTeacher([]);
				return;
			}
			try {
				const data = await getClassroomMaterialListByRole(
					classroomId,
					"teacher",
				);
				if (!cancelled) setTeacher(normalizeTaskSummaryList(data));
			} catch (e) {
				console.error("Failed to load teacher summaries:", e);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [classroomId, hasTeacherRole]);

	return { student, teacher };
}
