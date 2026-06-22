import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { buildRoute } from "@/routes/routeConfig";
import { getClassroomSummariesByUserId } from "@/api/classes/classesAPI";
import { joinClassByCode } from "@/features/classrooms/api/classroomApi";
import { selectUser } from "@/store/auth/authSlice";
import { Plus, GraduationCap, House, CircleAlert } from "lucide-react";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

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
	const inClassroomChildRoute = useMatch("/my/classrooms/:id/*");
	const user = useSelector(selectUser);
	const userId = user?.id || user?.userId || user?.memberId;

	const refresh = useCallback(async () => {
		if (!userId) {
			setClassrooms([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const data = await getClassroomSummariesByUserId(userId);
			setClassrooms(data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch classrooms", err);
			setError("Unable to load classrooms.");
		} finally {
			setLoading(false);
		}
	}, [userId]);

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
				(c) => String(c.code) === String(code),
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
				navigate(buildRoute.sectionPart(res.classroomId, 1, 1));
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

	if (error) return <p className={styles.error}>{error}</p>;

	if (!inClassroomChildRoute && atRoot) {
		return (
			<>
				{loading && <LoadingSpinner />}
				<div className={styles.classrooms_container}>
					<div className={styles.title_row}>
						<div className={styles.title_container}>
							<House className={styles.title_icon} aria-hidden="true" />
							<h2 className={styles.classrooms_title}>My Classrooms</h2>
						</div>
						<div className={styles.join_panel}>
							<button
								type="button"
								className={styles.join_toggle}
								onClick={() => setJoinOpen((v) => !v)}
								aria-expanded={joinOpen}
								aria-controls="join-class-panel"
							>
								<Plus size={24} />
							</button>
						</div>
					</div>

					{classrooms.length === 0 && !loading && (
						<div className={styles.emptyWrap}>
							<p className={styles.emptyState}>
								You’re not enrolled in any classrooms yet.
							</p>
						</div>
					)}
					{joinOpen && (
						<div
							className={styles.join_overlay}
							onClick={() => {
								if (joining) return;
								setJoinOpen(false);
								setJoinCode("");
								setJoinErr("");
							}}
						>
							<div
								id="join-class-panel"
								className={styles.join_popover}
								role="dialog"
								aria-modal="true"
								onClick={(e) => e.stopPropagation()}
							>
								<div className={styles.join_header}>
									<label htmlFor="join-code" className={styles.join_label}>
										Class Code
									</label>
									<CircleAlert
										size={22}
										className={styles.join_info_icon}
										aria-hidden="true"
									/>
								</div>

								<input
									id="join-code"
									type="text"
									value={joinCode}
									onChange={(e) => {
										setJoinCode(e.target.value);
										if (joinErr) setJoinErr("");
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleJoin();
										}
									}}
									className={styles.classroom_input}
									disabled={joining}
								/>

								<div className={styles.card_meta}>
									{joinErr && (
										<div className={styles.error} style={{ marginTop: 6 }}>
											{joinErr}
										</div>
									)}
								</div>

								<div className={styles.buttons_row}>
									<button
										className="action_button"
										onClick={() => {
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
										onClick={handleJoin}
										disabled={joining}
									>
										{joining ? "Joining…" : "Join Class"}
									</button>
								</div>
							</div>
						</div>
					)}
					<div className={styles.classrooms_layout}>
						<ul className={styles.classrooms_grid}>
							{classrooms.map((c) => {
								const teacherLabel =
									c.teachers && c.teachers.length
										? c.teachers
												.map((t) => {
													if (typeof t === "string") return t;
													const firstName = t?.name || "";
													const lastName = t?.surname || "";
													const fullName = `${firstName} ${lastName}`.trim();
													return (
														fullName || String(t?.userId || t?.memberId || "")
													);
												})
												.filter(Boolean)
												.join(", ")
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
											{(c.subject || c.description) && (
												<div className={styles.card_subject}>
													{c.subject || c.description}
												</div>
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
												<span className={styles.meta_value}>
													{teacherLabel}
												</span>
											</div>
										</div>

										<div className={styles.card_cta}>View class</div>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			</>
		);
	}

	return <Outlet context={{ classrooms }} />;
};

export default UserClassrooms;
