import { useEffect, useState } from "react";
import { getClassroomMaterialListByRole } from "@/api/classes/classesAPI";

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
				if (!cancelled) setStudent(data || []);
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
				if (!cancelled) setTeacher(data || []);
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
