import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/auth/authSlice";
import { buildRoute } from "@/routes/routeConfig";
import { useClassroomMemberRole } from "@/domain/classrooms/hooks/useClassroomMemberRole";

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
	const user = useSelector(selectUser);

	const { data: memberRole } = useClassroomMemberRole(
		Number(classroomId) || undefined,
		user?.userId,
	);
	const hasTeacherRoleInClassroom = memberRole === "TEACHER";

	const { student: studentTaskSummaries, teacher: teacherTaskSummaries } =
		useTaskSummaries(classroomId, hasTeacherRoleInClassroom);
	const selectedSectionId = Number.isNaN(Number(sectionId))
		? sectionId
		: Number(sectionId);

	const teacherItems = useMemo(
		() => teacherTaskSummaries,
		[teacherTaskSummaries],
	);
	const studentItems = useMemo(
		() => studentTaskSummaries,
		[studentTaskSummaries],
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
