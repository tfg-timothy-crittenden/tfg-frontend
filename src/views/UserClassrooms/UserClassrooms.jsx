import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserClassrooms } from "@/api/user/user";
import styles from "./UserClassrooms.module.css";

const UserClassrooms = () => {
	const [classrooms, setClassrooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const navigate = useNavigate();
	const atRoot = useMatch("/my/classrooms");

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

	if (loading) return <p className={styles.loading}>Loading classrooms...</p>;
	if (error) return <p className={styles.error}>{error}</p>;
	if (classrooms.length === 0)
		return (
			<p className={styles.emptyState}>
				You’re not enrolled in any classrooms yet.
			</p>
		);

	// If at /my/classrooms — show classroom list
	if (atRoot) {
		return (
			<div className={styles.classrooms_container}>
				<h2>Your Classrooms</h2>
				<ul className={styles.classrooms_list}>
					{classrooms.map(
						(classroom) => (
							console.log(classroom),
							(
								<li
									key={classroom.id}
									className={styles.classroom_item}
									onClick={() =>
										navigate(`/my/classrooms/${classroom.id}/test/1/part/1`)
									}
								>
									{classroom.name}
									{classroom.description}
									{classroom.teacher}
									{classroom.joincode}
								</li>
							)
						)
					)}
				</ul>
			</div>
		);
	}

	// Otherwise render the slected classroom's outlet
	return <Outlet context={{ classrooms }} />;
};

export default UserClassrooms;
