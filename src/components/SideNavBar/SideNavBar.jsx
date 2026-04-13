import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/auth/authSlice";
import { buildRoute } from "@/routes/routeConfig";
import { getClassroomMemberRole } from "@/api/classes/classesAPI";

import ClassroomTeacherMenu from "@/components/ClassroomTeacherMenu/ClassroomTeacherMenu";
import { GraduationCap } from "lucide-react";
import AccordionList from "@/components/AccordionList/AccordionList";

import { useTaskSummaries } from "./useTaskSummaries";
import styles from "./SideNavBar.module.css";

export default function SideNavBar({
	classrooms,
	onClassroomChange,
	setShowMaterial,
	showMaterial,
	isOpen,
	setIsOpen,
}) {
	const {
		id: classroomId,
		sectionId,
		partNumber,
		questionNumber,
	} = useParams();
	const navigate = useNavigate();
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);
	const [hasTeacherRoleInClassroom, setHasTeacherRoleInClassroom] =
		useState(false);
	const classroomRoleCacheRef = useRef(new Map());
	const user = useSelector(selectUser);
	const memberIdCandidates = useMemo(() => {
		const ids = [user?.memberId, user?.userId, user?.id]
			.map((id) => String(id || "").trim())
			.filter(Boolean);
		return [...new Set(ids)];
	}, [user]);
	const currentUserCacheKey = useMemo(
		() => [...memberIdCandidates].sort().join("|"),
		[memberIdCandidates],
	);

	useEffect(() => {
		let cancelled = false;

		if (!classroomId || memberIdCandidates.length === 0) {
			setHasTeacherRoleInClassroom(false);
			return () => {
				cancelled = true;
			};
		}

		const cacheKey = `${classroomId}::${currentUserCacheKey}`;
		const cachedValue = classroomRoleCacheRef.current.get(cacheKey);
		if (typeof cachedValue === "boolean") {
			setHasTeacherRoleInClassroom(cachedValue);
			return () => {
				cancelled = true;
			};
		}

		(async () => {
			try {
				let resolvedRole = null;

				for (const memberId of memberIdCandidates) {
					try {
						resolvedRole = await getClassroomMemberRole(classroomId, memberId);
						if (resolvedRole) break;
					} catch (error) {
						const status = error?.response?.status;
						if (status === 404 || status === 400) {
							continue;
						}
						throw error;
					}
				}

				const isTeacher = resolvedRole === "TEACHER";
				classroomRoleCacheRef.current.set(cacheKey, isTeacher);

				if (!cancelled) {
					setHasTeacherRoleInClassroom(isTeacher);
				}
			} catch (error) {
				classroomRoleCacheRef.current.set(cacheKey, false);
				if (!cancelled) {
					setHasTeacherRoleInClassroom(false);
				}
				console.error("Failed to resolve classroom teacher membership:", error);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [classroomId, memberIdCandidates, currentUserCacheKey]);

	const { student: studentTaskSummaries, teacher: teacherTaskSummaries } =
		useTaskSummaries(classroomId, hasTeacherRoleInClassroom);
	const selectedSectionId = Number.isNaN(Number(sectionId))
		? sectionId
		: Number(sectionId);

	const buildTaskTitleList = useCallback((tasks = []) => {
		if (!Array.isArray(tasks)) return [];
		return tasks.map((task) => ({
			testId: task.id ?? task.materialId,
			title: task.name || task.description,
		}));
	}, []);

	const teacherItems = useMemo(
		() => buildTaskTitleList(teacherTaskSummaries),
		[buildTaskTitleList, teacherTaskSummaries],
	);
	const studentItems = useMemo(
		() => buildTaskTitleList(studentTaskSummaries),
		[buildTaskTitleList, studentTaskSummaries],
	);

	const selectedSection = useMemo(() => {
		if (!sectionId) return null;
		if (
			teacherItems.some((item) => String(item.testId) === String(sectionId))
		) {
			return "teacher";
		}
		if (
			studentItems.some((item) => String(item.testId) === String(sectionId))
		) {
			return "student";
		}
		return null;
	}, [sectionId, teacherItems, studentItems]);

	const rafId = useRef(null);
	useEffect(
		() => () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		},
		[],
	);

	useEffect(() => {
		if (!isOpen) {
			setShowTeacherList(false);
			setShowStudentList(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!hasTeacherRoleInClassroom) {
			setShowTeacherList(false);
		}
	}, [hasTeacherRoleInClassroom]);

	const handleAccordionClick = (type) => {
		if (!isOpen && setIsOpen) {
			setIsOpen(true);
			rafId.current = requestAnimationFrame(() => {
				if (type === "teacher") setShowTeacherList(true);
				if (type === "student") setShowStudentList(true);
			});
		} else {
			if (type === "teacher") setShowTeacherList((prev) => !prev);
			if (type === "student") setShowStudentList((prev) => !prev);
		}
	};

	const handleSelectSection = useCallback(
		(sectionId, part = 1) => {
			const resolvedPartNumber = part || "1";
			const resolvedQuestionNumber = questionNumber || "1";
			navigate(
				buildRoute.sectionQuestion(
					classroomId,
					sectionId,
					resolvedPartNumber,
					resolvedQuestionNumber,
				),
			);
		},
		[navigate, classroomId, questionNumber],
	);

	return (
		<div className={styles.test_menu}>
			<section>
				<ClassroomTeacherMenu
					classrooms={classrooms}
					onClassroomChange={onClassroomChange}
					setShowMaterial={setShowMaterial}
					showMaterial={showMaterial}
					showButtonText={isOpen}
				/>
			</section>

			{showMaterial && (
				<section className={styles.accordion_section}>
					{hasTeacherRoleInClassroom && (
						<AccordionList
							icon={<GraduationCap size={24} />}
							label="Teacher Material"
							labelIsVisible={isOpen}
							chevronIsVisible={isOpen}
							listIsOpen={showTeacherList}
							onHeaderClick={() => handleAccordionClick("teacher")}
							items={teacherItems}
							activeItemId={
								selectedSection === "teacher" ? selectedSectionId : null
							}
							onItemClick={(t) => handleSelectSection(t.testId, partNumber)}
							headerIsHighlighted={
								selectedSection === "teacher" && !showTeacherList
							}
						/>
					)}

					<AccordionList
						icon={
							<img
								src="/assets/student_desk.png"
								alt="Student Material"
								className={styles.icon}
							/>
						}
						label="Student Material"
						labelIsVisible={isOpen}
						chevronIsVisible={isOpen}
						listIsOpen={showStudentList}
						onHeaderClick={() => handleAccordionClick("student")}
						items={studentItems}
						activeItemId={
							selectedSection === "student" ? selectedSectionId : null
						}
						onItemClick={(t) => handleSelectSection(t.testId, partNumber)}
						headerIsHighlighted={
							selectedSection === "student" && !showStudentList
						}
					/>
				</section>
			)}
		</div>
	);
}
