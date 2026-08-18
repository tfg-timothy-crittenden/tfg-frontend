import { Outlet, NavLink } from "react-router-dom";
import {
	Settings,
	GraduationCap,
	Users,
	NotebookTabs,
	Library,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

// prefetch helpers from lazyRoutes file
import {
	prefetchAdminAll,
	_importAdminTeachers,
	_importAdminClasses,
	_importAdminMaterial,
	_importAdminMaterialLibrary,
} from "@/app/routes/lazyRoutes";

const AdminDashboard = () => {
	return (
		<article className={styles.container + " full-height-mobile-no-bottom-nav"}>
			<h2 className={styles.admin_dashboard_heading}>
				<Settings size={46} strokeWidth={2} />
				<span>Admin Panel</span>
			</h2>

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
							<GraduationCap size={24} strokeWidth={2} />
							<span>Teachers</span>
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
							<Users size={24} strokeWidth={2} />
							<span>Classes</span>
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
							<NotebookTabs size={24} strokeWidth={2} />
							<span>Materials</span>
						</NavLink>
					</li>

					<li>
						<NavLink
							to="material-library"
							className={({ isActive }) =>
								isActive ? styles.activeLink : styles.inactiveLink
							}
							onMouseEnter={_importAdminMaterialLibrary}
							onFocus={_importAdminMaterialLibrary}
							onTouchStart={_importAdminMaterialLibrary}
						>
							<Library size={24} strokeWidth={2} />
							<span>Material Library</span>
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
