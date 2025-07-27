import { useEffect, useState } from "react";
import BatchCreateClasses from "./BatchCreateClasses";
import {
	fetchAllTeachers,
	assignTeachersToClass,
	fetchAllClassesAndTeachers,
	deleteClass,
} from "@/api/admin/admin";

import Select from "react-select";

import styles from "./AdminClasses.module.css";

const AdminClasses = () => {
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(true);

	const [allTeachers, setAllTeachers] = useState([]);

	useEffect(() => {
		const load = async () => {
			await loadClasses();
			const teacherRes = await fetchAllTeachers();
			setAllTeachers(teacherRes.data);
		};
		load();
	}, []);

	const loadClasses = async () => {
		try {
			const res = await fetchAllClassesAndTeachers();
			setClasses(res.data);
			console.log("Loaded classes in adminClasses:", res.data);
		} catch (err) {
			console.error("Error loading classes:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadClasses();
	}, []);

	return (
		<section>
			{loading ? (
				<p>Loading...</p>
			) : classes.length === 0 ? (
				<p>No classes found.</p>
			) : (
				<table className={styles.classesTable}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Subject</th>
							<th>Join Code</th>
							<th>Teachers</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{classes.map((cls) => (
							<tr key={cls.id}>
								<td>{cls.name}</td>
								<td>{cls.subject || "—"}</td>
								<td>
									<code>{cls.code}</code>
								</td>
								<td>
									<Select
										isMulti
										options={allTeachers.map((t) => ({
											value: t.id,
											label: `${t.name} (${t.status})`,
										}))}
										value={cls.teachers.map((t) => ({
											value: t.id,
											label: `${t.name} (${t.status})`,
										}))}
										onChange={async (selectedOptions) => {
											const ids = (selectedOptions || []).map((opt) =>
												Number(opt.value)
											); // fallback to []
											try {
												await assignTeachersToClass(cls.id, ids);
												await loadClasses();
											} catch (err) {
												console.error("Failed to assign teachers:", err);
											}
										}}
										placeholder="No teacher assigned"
										menuPortalTarget={document.body} // Portal to body to prevent clipping of dropdown
										menuPosition="fixed"
									/>
								</td>

								<td>
									<button
										onClick={async () => {
											if (
												confirm("Are you sure you want to delete this class?")
											) {
												try {
													await deleteClass(cls.id);
													await loadClasses(); // refresh
												} catch (err) {
													console.error("Error deleting class:", err);
													alert("Failed to delete class.");
												}
											}
										}}
										style={{
											color: "red",
											border: "none",
											background: "none",
											cursor: "pointer",
										}}
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<BatchCreateClasses onClassCreated={loadClasses} />
		</section>
	);
};

export default AdminClasses;
