import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
	return (
		<article className={styles.container}>
			<h2 className={styles.admin_dashboard_heading}>Admin Panel</h2>
			<nav className={styles.sidebar}>
				<ul className={styles.navList}>
					<li>
						<NavLink
							to="teachers"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
						>
							Manage Teachers
						</NavLink>
					</li>

					<li>
						<NavLink
							to="classes"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
						>
							Manage Classes
						</NavLink>
					</li>
					<li>
						<NavLink
							to="materials"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
						>
							Manage Materials
						</NavLink>
					</li>
				</ul>
			</nav>

			<article className={styles.content}>
				<Outlet />
			</article>
		</article>
	);
};

export default AdminDashboard;
