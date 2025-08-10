import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClassMembers } from "@/api/classes/classesAPI";
import { Users, GraduationCap } from "lucide-react";
import styles from "./ViewClassMembers.module.css";

const Avatar = ({ name = "?", size = 36 }) => {
	const initials =
		name
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((s) => s[0]?.toUpperCase())
			.join("") || "?";
	return (
		<div className={styles.avatar} style={{ width: size, height: size }}>
			{initials}
		</div>
	);
};

const GroupHeader = ({ icon, title, count }) => (
	<div className={styles.groupHeader}>
		<div className={styles.groupTitle}>
			{icon}
			<span>{title}</span>
			<span className={styles.badge}>{count}</span>
		</div>
	</div>
);

const MemberRow = ({ m }) => (
	<li className={styles.row} key={m.id}>
		<Avatar name={m.name} />
		<div className={styles.person}>
			<div className={styles.name}>{m.name || "(unnamed)"}</div>
			<div className={styles.meta}>
				{m.username && <span className={styles.tag}>@{m.username}</span>}
				{m.status && <span className={styles.dot} />}
				{m.status && <span className={styles.muted}>{m.status}</span>}
			</div>
		</div>
	</li>
);

const ViewClassMembers = ({ classroomId: propId }) => {
	const params = useParams();
	const classroomId = propId ?? params.id;

	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");
	const [teachers, setTeachers] = useState([]);
	const [students, setStudents] = useState([]);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setErr("");

		getClassMembers(classroomId)
			.then(({ teachers, students }) => {
				if (!mounted) return;
				const byName = (a, b) => (a.name || "").localeCompare(b.name || "");
				setTeachers([...teachers].sort(byName));
				setStudents([...students].sort(byName));
			})
			.catch((e) =>
				setErr(e?.response?.data?.error || "Failed to load members")
			)
			.finally(() => mounted && setLoading(false));

		return () => {
			mounted = false;
		};
	}, [classroomId]);

	if (loading) {
		return (
			<div className={styles.wrap}>
				<div className={styles.skeleton} />
			</div>
		);
	}

	if (err) {
		return <div className={styles.error}>{err}</div>;
	}

	return (
		<div className={styles.wrap}>
			<section className={styles.group}>
				<GroupHeader
					icon={<GraduationCap size={18} />}
					title="Teachers"
					count={teachers.length}
				/>
				<ul className={styles.list}>
					{teachers.map((m) => (
						<MemberRow key={m.id} m={m} />
					))}
					{teachers.length === 0 && (
						<li className={styles.empty}>No teachers in this class.</li>
					)}
				</ul>
			</section>

			<section className={styles.group}>
				<GroupHeader
					icon={<Users size={18} />}
					title="Students"
					count={students.length}
				/>
				<ul className={styles.list}>
					{students.map((m) => (
						<MemberRow key={m.id} m={m} />
					))}
					{students.length === 0 && (
						<li className={styles.empty}>No students in this class yet.</li>
					)}
				</ul>
			</section>
		</div>
	);
};

export default ViewClassMembers;
