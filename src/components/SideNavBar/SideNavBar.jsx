import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

import ClassroomTeacherMenu from "@/components/ClassroomTeacherMenu/ClassroomTeacherMenu";
import { GraduationCap } from "lucide-react";
import AccordionList from "@/components/AccordionList/AccordionList";

import { buildPart1Tests } from "./testBuilders";
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
	const DEFAULT_TOPIC = "General";
	const READING_TITLE_PART1 = "Question 1";
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();

	// Simple derived value (cheap): no useMemo
	const activePart = partNumber ? `part${partNumber}` : "part1";

	const [selectedSection, setSelectedSection] = useState(null);
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]), shallowEqual);

	const { student: studentTaskSummaries, teacher: teacherTaskSummaries } =
		useTaskSummaries(classroomId, hasTeacherRole);

	// Cheap lookups: no useMemo needed
	const studentCurrentList = studentTaskSummaries?.[activePart] || [];
	const teacherCurrentList = teacherTaskSummaries?.[activePart] || [];

	// Use useMemo ONLY for the expensive aggregations
	const teacherTestsPart1 = useMemo(() => {
		if (!hasTeacherRole) return [];
		return buildPart1Tests({
			summaries: teacherTaskSummaries,
			readingTitle: READING_TITLE_PART1,
		});
	}, [hasTeacherRole, teacherTaskSummaries]);

	const studentTestsPart1 = useMemo(() => {
		return buildPart1Tests({
			summaries: studentTaskSummaries,
			readingTitle: READING_TITLE_PART1,
		});
	}, [studentTaskSummaries]);

	// Close lists when sidebar closes
	useEffect(() => {
		if (!isOpen) {
			setShowTeacherList(false);
			setShowStudentList(false);
		}
	}, [isOpen]);

	// Reset selection when classroom changes
	useEffect(() => {
		setSelectedSection(null);
	}, [classroomId]);

	const handleSelectTestPart = useCallback(
		(newTestId, part = 1, section = null, topic = DEFAULT_TOPIC) => {
			setSelectedSection(section);
			if (part === 1) {
				navigate(
					`/my/classrooms/${classroomId}/test/${newTestId}/part/1/instructions?topic=${encodeURIComponent(
						topic
					)}`
				);
			} else {
				navigate(
					`/my/classrooms/${classroomId}/test/${newTestId}/part/${part}`
				);
			}
		},
		[navigate, classroomId]
	);

	// rAF instead of fixed timeout for accordion open-then-toggle
	const rafId = useRef(null);
	useEffect(
		() => () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		},
		[]
	);

	const handleAccordionClick = (type) => {
		if (!isOpen && setIsOpen) {
			setIsOpen(true);
			// Wait for sidebar to open before toggling accordion
			setTimeout(() => {
				if (type === "teacher") setShowTeacherList(true);
				if (type === "student") setShowStudentList(true);
			}, 300); // Match your sidebar transition duration
		} else {
			if (type === "teacher") setShowTeacherList((prev) => !prev);
			if (type === "student") setShowStudentList((prev) => !prev);
		}
	};

	const teacherItems =
		activePart === "part1" ? teacherTestsPart1 : teacherCurrentList;
	const studentItems =
		activePart === "part1" ? studentTestsPart1 : studentCurrentList;

	const showEmptyState =
		studentCurrentList.length === 0 &&
		(!hasTeacherRole || teacherCurrentList.length === 0) &&
		activePart !== "part1";

	return (
		<div className={styles.test_menu}>
			{showEmptyState && (
				<div className={styles.no_tests_message}>
					<p>No tests available for this part.</p>
					<p>Contact your teacher to assign materials.</p>
				</div>
			)}

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
					{/* Teacher material */}
					<AccordionList
						icon={<GraduationCap size={20} />}
						label="Teacher Material"
						labelIsVisible={isOpen}
						chevronIsVisible={isOpen}
						listIsOpen={showTeacherList}
						onHeaderClick={() => handleAccordionClick("teacher")}
						items={teacherItems}
						activeItemId={selectedSection === "teacher" ? testId : null}
						onItemClick={(t) =>
							handleSelectTestPart(t.testId, partNumber, "teacher")
						}
						headerIsHighlighted={
							selectedSection === "teacher" && !showTeacherList
						}
					/>

					{/* Student material */}
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
						activeItemId={selectedSection === "student" ? testId : null}
						onItemClick={(t) =>
							handleSelectTestPart(t.testId, partNumber, "student")
						}
						headerIsHighlighted={
							selectedSection === "student" && !showStudentList
						}
					/>
				</section>
			)}
		</div>
	);
}
