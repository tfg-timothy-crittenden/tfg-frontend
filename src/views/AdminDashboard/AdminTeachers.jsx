import { useEffect, useState } from "react";
import {
	fetchInvitedTeachers,
	cancelInvite,
	resendInvite,
	fetchActiveTeachers,
} from "@/api/admin/admin";

import BatchInviteTeachers from "./BatchInviteTeachers";
import styles from "./AdminClasses.module.css"; // Reuse the table styles

const AdminTeachers = () => {
	const [invited, setInvited] = useState([]);
	const [activeTeachers, setActiveTeachers] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadAllTeachers = async () => {
		try {
			const [invitedRes, activeRes] = await Promise.all([
				fetchInvitedTeachers(),
				fetchActiveTeachers(),
			]);
			console.log("Invited teachers:", invitedRes.data);
			console.log("Active teachers:", activeRes.data);
			setInvited(invitedRes.data);
			setActiveTeachers(activeRes.data);
		} catch (err) {
			console.error("Failed to load teachers:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAllTeachers();
	}, []);

	const handleCancel = async (id) => {
		await cancelInvite(id);
		await loadAllTeachers();
	};

	const handleResend = async (id) => {
		await resendInvite(id);
		await loadAllTeachers();
	};

	return (
		<section>
			{loading ? (
				<p>Loading...</p>
			) : (
				<table className={styles.classesTable}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{[...activeTeachers, ...invited].map((user) => (
							<tr key={user.id}>
								<td>{user.name}</td>
								<td>{user.email}</td>
								<td>{user.status}</td>
								<td>
									{user.status === "invited" ? (
										<>
											<button onClick={() => handleResend(user.id)}>
												Resend
											</button>
											<button onClick={() => handleCancel(user.id)}>
												Cancel
											</button>
										</>
									) : (
										<span>—</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<BatchInviteTeachers onInviteComplete={loadAllTeachers} />
		</section>
	);
};

export default AdminTeachers;
