import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
	logout,
	selectIsAuthenticated,
	selectHasRole,
	selectUsername,
} from "@/store/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleUser, Home, Settings } from "lucide-react";
import { NavLink } from "react-router";

const Header = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const isAuthenticated = useSelector(selectIsAuthenticated);
	const username = useSelector(selectUsername);

	const isAdmin = useSelector(selectHasRole(["admin"]));
	const isTeacher = useSelector(selectHasRole(["teacher"]));
	const isStudent = useSelector(selectHasRole(["student"]));

	const displayRole = isAdmin
		? "Admin"
		: isTeacher
			? "Teacher"
			: isStudent
				? "Student"
				: "";

	const [showUserMenu, setShowUserMenu] = useState(false);
	const dropdownRef = useRef(null);

	const handleLogout = () => {
		setShowUserMenu(false);
		dispatch(logout());
		navigate("/login");
	};

	const handleProfile = () => {
		setShowUserMenu(false);
		alert("Go to profile");
	};

	const handleNavigateTo = (path) => {
		setShowUserMenu(false);
		navigate(path);
	};

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Determine active link
	const isClassroomsActive = location.pathname.startsWith("/my/classrooms");
	const isAdminActive = location.pathname.startsWith("/admin_dashboard");
	const isCreateActive = location.pathname.startsWith(
		"/create-speaking-material",
	);

	// Get display name for mobile (first name or username)
	const mobileDisplayName = username?.split(" ")[0] || username || "User";

	return (
		<header className={styles.header}>
			<div className={styles.header_inner}>
				{/* Responsive Logo */}
				<h1 className={styles.title}>
					<span className={styles.logo_full}>TOEFL Speaking</span>
					<span className={styles.logo_short}>TS</span>
				</h1>

				{isAuthenticated && (
					<div className={styles.buttonGroup}>
						{/* My Classrooms Link */}
						<NavLink
							to="/my/classrooms"
							className={`${styles.nav_item_container} ${
								isClassroomsActive ? styles.activeNavItem : ""
							}`}
						>
							<Home size={20} />
							<span className={styles.nav_label}>My Classrooms</span>
						</NavLink>

						{/* Admin Dashboard Link (only for admins) */}
						{isAdmin && (
							<>
								<NavLink
									to="/admin_dashboard"
									className={`${styles.nav_item_container} ${
										isAdminActive ? styles.activeNavItem : ""
									}`}
								>
									<Settings size={20} />
									<span className={styles.nav_label}>Admin</span>
								</NavLink>
								<NavLink
									to="/create-speaking-material/null"
									className={`${styles.nav_item_container} ${
										isCreateActive ? styles.activeNavItem : ""
									}`}
								>
									<span className={styles.nav_label}>Create</span>
								</NavLink>
							</>
						)}

						{/* User Menu */}
						<div className={styles.nav_item_container} ref={dropdownRef}>
							<button
								onClick={() => setShowUserMenu(!showUserMenu)}
								className={styles.user_button}
							>
								<CircleUser size={20} />

								<div className={styles.userInfo}>
									<span className={styles.username}>{username}</span>
									{displayRole && (
										<span className={styles.role}>{displayRole}</span>
									)}
								</div>
							</button>

							{showUserMenu && (
								<div className={styles.dropdown}>
									<div className={styles.dropdownHeader}>
										{username} ({displayRole})
									</div>
									<div onClick={handleProfile}>Profile</div>
									<div onClick={() => handleNavigateTo("/my/classrooms")}>
										My Classrooms
									</div>
									{isAdmin && (
										<div onClick={() => handleNavigateTo("/admin_dashboard")}>
											Admin Dashboard
										</div>
									)}
									<div onClick={handleLogout}>Logout</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
