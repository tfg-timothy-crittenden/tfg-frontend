import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
	return (
		<div className={styles.container}>
			<nav className={styles.sidebar}>
				<h2>Admin Panel</h2>
				<ul>
					<li>
						<NavLink to="">Overview</NavLink>
					</li>
					<li>
						<NavLink to="users">Manage Users</NavLink>
					</li>

					<li>
						<NavLink to="classes">Manage Classes</NavLink>
					</li>
				</ul>
			</nav>

			<main className={styles.content}>
				<Outlet />
			</main>
		</div>
	);
};

export default AdminDashboard;
