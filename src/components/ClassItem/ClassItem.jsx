import Select from "react-select";
import ClassroomIcon from "../ClassroomIcon";
import styles from "./ClassItem.module.css";

/**
 * Individual class item component for displaying class information and teacher assignment
 */

const ClassItem = ({
	classItem,
	teachers,
	allTeachers,
	onTeacherAssignment,
}) => {
	// Map teacherList to the actual objects from allTeachers by userId/id for reference equality
	const teacherList = Array.isArray(teachers) ? teachers : [];

	const selectedTeacherOptions = teacherList
		.map((t) => allTeachers.find((at) => at.id === (t.userId ?? t.id)))
		.filter(Boolean)
		.map((t) => ({
			value: t.id,
			label: `${t.name} ${t.surname}`,
			teacherObj: t,
		}));

	// selectedOptions will be array of teacher objects
	const handleTeacherChange = async (selectedOptions) => {
		// Always use the selected options as the new list of teachers
		const teachers = (selectedOptions || []).map((opt) => opt.teacherObj);

		try {
			await onTeacherAssignment(classItem.id, teachers);
		} catch (err) {
			console.error("Failed to assign teachers:", err);
			alert("Failed to assign teachers. Please try again.");
		}
	};

	return (
		<div className={styles.classContainer}>
			<div className={styles.class_info_and_logo}>
				{/* Class Icon */}
				<div className={styles.classIcon}>
					<ClassroomIcon size={48} className={styles.classroomIcon} />
				</div>

				{/* Class Info */}
				<div className={styles.classInfo}>
					<div className={styles.classHeader}>
						<span className={styles.className}>{classItem.name}</span>
					</div>
					<span className={styles.classSubject}>
						{classItem.subject || "No subject specified"}
					</span>
				</div>
			</div>

			{/* Teachers Assignment Section */}
			<div className={styles.teachersSection}>
				<Select
					isMulti
					options={allTeachers.map((t) => ({
						value: t.id,
						label: `${t.name} ${t.surname}`,
						teacherObj: t,
					}))}
					value={selectedTeacherOptions}
					onChange={handleTeacherChange}
					placeholder="No teacher assigned"
					menuPortalTarget={document.body}
					menuPosition="fixed"
					className={styles.teacherSelect}
				/>
			</div>
		</div>
	);
};

export default ClassItem;
