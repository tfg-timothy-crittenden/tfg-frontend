import { useEffect, useState } from "react";
import {
	getClassroomStudentTaskSummaries,
	getClassroomTeacherTaskSummaries,
} from "@/api/tasks/tasksAPI";

/** Fetch student + (optionally) teacher summaries; handles role changes & unmount. */
export function useTaskSummaries(classroomId, hasTeacherRole) {
	const [student, setStudent] = useState({});
	const [teacher, setTeacher] = useState({});

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const data = await getClassroomStudentTaskSummaries(classroomId);
				if (!cancelled) setStudent(data || {});
			} catch (e) {
				console.error("Failed to load student summaries:", e);
			}
		})();

		(async () => {
			if (!hasTeacherRole) {
				setTeacher({});
				return;
			}
			try {
				const data = await getClassroomTeacherTaskSummaries(classroomId);
				if (!cancelled) setTeacher(data || {});
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
