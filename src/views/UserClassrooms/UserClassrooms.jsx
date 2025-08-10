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
			<div className={styles.emptyWrap}>
				<h2>Your Classrooms</h2>
				<p className={styles.emptyState}>
					You’re not enrolled in any classrooms yet.
				</p>
			</div>
		);

	if (atRoot) {
		return (
			<div className={styles.classrooms_container}>
				<h2>Your Classrooms</h2>

				<ul className={styles.classrooms_grid}>
					{classrooms.map((c) => {
						const teacherLabel =
							c.teachers && c.teachers.length
								? c.teachers.join(", ")
								: "Unassigned";

						const showTeacherCount =
							c.materials && typeof c.materials.teacher === "number";

						return (
							<li
								key={c.id}
								className={styles.classroom_card}
								onClick={() => navigate(`/my/classrooms/${c.id}/test/1/part/1`)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										navigate(`/my/classrooms/${c.id}/test/1/part/1`);
									}
								}}
							>
								<div className={styles.card_header}>
									<div className={styles.card_title}>{c.name}</div>
									{c.subject && (
										<div className={styles.card_subject}>{c.subject}</div>
									)}
								</div>

								<div className={styles.card_meta}>
									<div className={styles.meta_row}>
										<span className={styles.meta_label}>Teacher</span>
										<span className={styles.meta_value}>{teacherLabel}</span>
									</div>
								</div>

								<div className={styles.materials_row}>
									<span className={styles.badge}>
										Student material: {c.materials?.student ?? 0}
									</span>
									{showTeacherCount && (
										<span className={`${styles.badge} ${styles.badge_alt}`}>
											Teacher material: {c.materials.teacher}
										</span>
									)}
								</div>

								<div className={styles.card_cta}>View class</div>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	return <Outlet context={{ classrooms }} />;
};

export default UserClassrooms;
