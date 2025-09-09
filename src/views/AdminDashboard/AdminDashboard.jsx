import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

// ⬇️ prefetch helpers from your lazyRoutes file
import {
	prefetchAdminAll,
	_importAdminTeachers,
	_importAdminClasses,
	_importAdminMaterial,
} from "@/routes/lazyRoutes";

const AdminDashboard = () => {
	return (
		<article className={styles.container + " full-height-mobile-no-bottom-nav"}>
			<h2 className={styles.admin_dashboard_heading}>Admin Panel</h2>

			{/* Hovering the sidebar warms all admin chunks */}
			<nav
				className={styles.sidebar}
				onMouseEnter={prefetchAdminAll}
				onFocus={prefetchAdminAll}
			>
				<ul className={styles.navList}>
					<li>
						<NavLink
							to="teachers"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
							onMouseEnter={_importAdminTeachers}
							onFocus={_importAdminTeachers}
							onTouchStart={_importAdminTeachers}
						>
							Teachers
						</NavLink>
					</li>

					<li>
						<NavLink
							to="classes"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
							onMouseEnter={_importAdminClasses}
							onFocus={_importAdminClasses}
							onTouchStart={_importAdminClasses}
						>
							Classes
						</NavLink>
					</li>

					<li>
						<NavLink
							to="materials"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
							onMouseEnter={_importAdminMaterial}
							onFocus={_importAdminMaterial}
							onTouchStart={_importAdminMaterial}
						>
							Materials
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
