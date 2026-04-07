import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, shallowEqual } from "react-redux";
import { selectHasRole } from "@/store/auth/authSlice";

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
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();
	const selectedTestId = Number.isNaN(Number(testId)) ? testId : Number(testId);

	const [selectedSection, setSelectedSection] = useState(null);
	const [showStudentList, setShowStudentList] = useState(true);
	const [showTeacherList, setShowTeacherList] = useState(false);

	const hasTeacherRole = useSelector(selectHasRole(["teacher"]), shallowEqual);

	const { student: studentTaskSummaries, teacher: teacherTaskSummaries } =
		useTaskSummaries(classroomId, hasTeacherRole);

	const buildTaskTitleList = useCallback((taskSummaries = {}) => {
		if (
			Array.isArray(taskSummaries.testNames) &&
			taskSummaries.testNames.length > 0
		) {
			if (taskSummaries.testNames[0]?.testId) {
				return taskSummaries.testNames.map((task, index) => ({
					testId: Number(task.testId) || index + 1,
					title: task.title,
				}));
			}
			return taskSummaries.testNames.map((title, index) => ({
				testId: index + 1,
				title,
			}));
		}

		const allTasks = [];
		Object.values(taskSummaries).forEach((partTasks) => {
			if (Array.isArray(partTasks)) {
				allTasks.push(...partTasks);
			}
		});

		const uniqueTasks = [];
		const seenTestIds = new Set();
		allTasks.forEach((task) => {
			if (!task?.testId || seenTestIds.has(task.testId)) return;
			const numericTestId = Number(task.testId);
			const resolvedTestId = Number.isNaN(numericTestId)
				? task.testId
				: numericTestId;
			if (seenTestIds.has(resolvedTestId)) return;
			seenTestIds.add(resolvedTestId);
			uniqueTasks.push({
				testId: resolvedTestId,
				title: task.title,
			});
		});

		return uniqueTasks;
	}, []);

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
		(newTestId, part = 1, section = null) => {
			setSelectedSection(section);
			navigate(`/my/classrooms/${classroomId}/test/${newTestId}/part/${part}`);
		},
		[navigate, classroomId],
	);

	// rAF instead of fixed timeout for accordion open-then-toggle
	const rafId = useRef(null);
	useEffect(
		() => () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		},
		[],
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

	const teacherItems = useMemo(
		() => buildTaskTitleList(teacherTaskSummaries),
		[buildTaskTitleList, teacherTaskSummaries],
	);
	const studentItems = useMemo(
		() => buildTaskTitleList(studentTaskSummaries),
		[buildTaskTitleList, studentTaskSummaries],
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
					{/* Teacher material */}
					<AccordionList
						icon={<GraduationCap size={24} />}
						label="Teacher Material"
						labelIsVisible={isOpen}
						chevronIsVisible={isOpen}
						listIsOpen={showTeacherList}
						onHeaderClick={() => handleAccordionClick("teacher")}
						items={teacherItems}
						activeItemId={selectedSection === "teacher" ? selectedTestId : null}
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
						activeItemId={selectedSection === "student" ? selectedTestId : null}
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
