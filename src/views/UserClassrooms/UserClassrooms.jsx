import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getUserClassrooms } from "@/api/user/user";
import { joinClassByCode } from "@/api/classes/classesAPI";
import { Plus, GraduationCap } from "lucide-react";
import styles from "./UserClassrooms.module.css";

const UserClassrooms = () => {
	const [classrooms, setClassrooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// join-card state
	const [joinOpen, setJoinOpen] = useState(false);
	const [joinCode, setJoinCode] = useState("");
	const [joining, setJoining] = useState(false);
	const [joinErr, setJoinErr] = useState("");

	const navigate = useNavigate();
	const atRoot = useMatch("/my/classrooms");

	const refresh = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getUserClassrooms();
			setClassrooms(data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch classrooms", err);
			setError("Unable to load classrooms.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const handleJoin = async () => {
		const code = joinCode.trim();
		if (!code) {
			setJoinErr("Enter a class code");
			return;
		}
		setJoining(true);
		setJoinErr("");
		try {
			const res = await joinClassByCode(code);
			await refresh();
			const alreadyInClass = classrooms.some(
				(c) => String(c.code) === String(code)
			);
			if (alreadyInClass) {
				setJoinErr("You are already enrolled in this class.");
				setJoining(false);
				// Do NOT collapse the join box
				return;
			}
			if (res?.classroomId) {
				setJoinOpen(false);
				setJoinCode("");
				navigate(`/my/classrooms/${res.classroomId}/test/1/part/1`);
			}
		} catch (e) {
			const msg =
				e?.response?.data?.message ||
				e?.response?.data?.error ||
				"Could not join class";
			setJoinErr(msg);
			// Do NOT collapse the join box
		} finally {
			setJoining(false);
		}
	};

	if (loading) return <p className={styles.loading}>Loading classrooms...</p>;
	if (error) return <p className={styles.error}>{error}</p>;

	if (atRoot) {
		return (
			<div className={styles.classrooms_container}>
				<h2 className={styles.classrooms_title}>Your Classrooms</h2>

				{classrooms.length === 0 && (
					<div className={styles.emptyWrap}>
						<p className={styles.emptyState}>
							You’re not enrolled in any classrooms yet.
						</p>
					</div>
				)}

				<ul className={styles.classrooms_grid}>
					{classrooms.map((c) => {
						const teacherLabel =
							c.teachers && c.teachers.length
								? c.teachers.join(", ")
								: "Unassigned";

						return (
							<li
								key={c.id}
								className={styles.classroom_card}
								onClick={() => navigate(`/my/classrooms/${c.id}`)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										navigate(`/my/classrooms/${c.id}`);
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
										<span className={styles.meta_label}>
											<GraduationCap
												size={18}
												style={{ verticalAlign: "middle" }}
											/>
										</span>
										<span className={styles.meta_value}>{teacherLabel}</span>
									</div>
								</div>

								<div className={styles.card_cta}>View class</div>
							</li>
						);
					})}

					{/* Join-a-class card */}
					<li
						key="join-card"
						className={styles.join_class_card}
						role="button"
						tabIndex={0}
						onClick={() => setJoinOpen((v) => !v)}
						onKeyDown={(e) =>
							(e.key === "Enter" || e.key === " ") && setJoinOpen((v) => !v)
						}
					>
						{!joinOpen ? (
							<>
								<div className={styles.card_meta}>
									<div className={styles.meta_row}>
										<Plus size={34} />
									</div>
								</div>
								<div className={styles.card_cta}>Join a class</div>
							</>
						) : (
							<>
								<div className={styles.card_meta}>
									<div className={styles.meta_row}>
										<label
											htmlFor="join-code"
											className={styles.meta_label}
											style={{ marginRight: 8 }}
										>
											Class code
										</label>
										<input
											id="join-code"
											type="text"
											value={joinCode}
											onChange={(e) => {
												setJoinCode(e.target.value);
												if (joinErr) setJoinErr(""); // Clear error when editing
											}}
											onClick={(e) => e.stopPropagation()}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													e.stopPropagation();
													handleJoin();
												}
											}}
											placeholder="e.g. ef011db2"
											className={styles.classroom_input}
											style={{ flex: 1 }}
											disabled={joining}
										/>
									</div>
									{joinErr && (
										<div className={styles.error} style={{ marginTop: 6 }}>
											{joinErr}
										</div>
									)}
								</div>

								<div className={styles.buttons_row}>
									<button
										className="action_button"
										onClick={(e) => {
											e.stopPropagation();
											setJoinOpen(false);
											setJoinCode("");
											setJoinErr("");
										}}
										disabled={joining}
									>
										Cancel
									</button>
									<button
										className={`${styles.join_btn} action_button`}
										onClick={(e) => {
											e.stopPropagation();
											handleJoin();
										}}
										disabled={joining}
									>
										{joining ? "Joining…" : "Join class"}
									</button>
								</div>
							</>
						)}
					</li>
				</ul>
			</div>
		);
	}

	return <Outlet context={{ classrooms }} />;
};

export default UserClassrooms;
