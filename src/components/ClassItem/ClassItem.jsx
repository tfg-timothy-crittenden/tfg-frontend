import Select from "react-select";
import ClassroomIcon from "../ClassroomIcon";
import styles from "./ClassItem.module.css";

/**
 * Individual class item component for displaying class information and teacher assignment
 */
const ClassItem = ({ classItem, allTeachers, onTeacherAssignment }) => {
	const handleTeacherChange = async (selectedOptions) => {
		const ids = (selectedOptions || []).map((opt) => Number(opt.value));
		try {
			await onTeacherAssignment(classItem.id, ids);
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
						label: `${t.name} (${t.status})`,
					}))}
					value={classItem.teachers.map((t) => ({
						value: t.id,
						label: `${t.name} (${t.status})`,
					}))}
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
