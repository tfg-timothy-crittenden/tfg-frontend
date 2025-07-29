import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // if using react-router-dom
import { getUserClassrooms } from "@/api/user/user";
import styles from "./UserClassrooms.module.css";

const UserClassrooms = () => {
	const [classrooms, setClassrooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();

	useEffect(() => {
		const fetchClassrooms = async () => {
			try {
				const data = await getUserClassrooms();
				setClassrooms(data);
			} catch (err) {
				console.error("Failed to fetch classrooms", err);
				setError("Unable to load classrooms.");
			} finally {
				setLoading(false);
			}
		};

		fetchClassrooms();
	}, []);

	const handleClassroomClick = (classroomId) => {
		navigate(`/classroom/${classroomId}`);
	};

	return (
		<>
			<div className={styles.classroomsContainer}>
				<h2>Your Classrooms</h2>

				{loading && <p>Loading...</p>}
				{error && <p className={styles.error}>{error}</p>}

				{!loading && classrooms.length === 0 && (
					<p className={styles.emptyState}>
						You’re not enrolled in any classrooms yet.
					</p>
				)}

				<ul className={styles.classroomsList}>
					{classrooms.map((classroom) => (
						<li
							key={classroom.id}
							className={styles.classroomItem}
							onClick={() => handleClassroomClick(classroom.id)}
						>
							{classroom.name}
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default UserClassrooms;
