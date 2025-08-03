import styles from "./ClassroomHeader.module.css";

const ClassroomHeader = ({ classrooms, onClassroomChange }) => {
	return (
		<div className={styles.classroomHeader_container}>
			<h3>Classroom</h3>

			{classrooms && classrooms.length > 0 ? (
				<select
					onChange={(e) => onClassroomChange(e.target.value)}
					className={styles.classroom_selector}
				>
					{classrooms.map((classroom) => (
						<option key={classroom.id} value={classroom.id}>
							{classroom.name}
						</option>
					))}
				</select>
			) : (
				<p>No classrooms available</p>
			)}
		</div>
	);
};

export default ClassroomHeader;
