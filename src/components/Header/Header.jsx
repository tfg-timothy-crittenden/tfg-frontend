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

	// Get display name for mobile (first name or username)
	const mobileDisplayName = username?.split(" ")[0] || username || "User";

	return (
		<header className={styles.header}>
			<h1 className={styles.title}>TOEFL Speaking</h1>

			{isAuthenticated && (
				<div className={styles.buttonGroup}>
					{/* Classrooms Navigation */}
					<div
						className={`${styles.nav_item_container} ${styles.nav_item_border}${
							isClassroomsActive ? ` ${styles.activeLink}` : ""
						}`}
						onClick={() => handleNavigateTo("/my/classrooms")}
					>
						<Home size={20} />
						<span>Classrooms</span>
					</div>

					{/* Admin Dashboard - Only show for admins */}
					{isAdmin && (
						<div
							className={`${styles.nav_item_container} ${
								styles.nav_item_border
							}${isAdminActive ? ` ${styles.activeLink}` : ""}`}
							onClick={() => handleNavigateTo("/admin_dashboard/teachers")}
						>
							<Settings size={20} />
							<span>Admin</span>
						</div>
					)}

					{/* User Menu */}
					<div
						className={styles.nav_item_container}
						ref={dropdownRef}
						onClick={() => setShowUserMenu((prev) => !prev)}
					>
						<CircleUser
							size={24}
							style={{ cursor: "pointer" }}
							strokeWidth={1.5}
						/>
						<div className={styles.userInfo}>
							<span className={styles.username}>{mobileDisplayName}</span>
							<span className={styles.role}>{displayRole}</span>
						</div>

						{showUserMenu && (
							<div className={styles.dropdown}>
								<div className={styles.dropdownHeader}>
									{username} {displayRole && `(${displayRole})`}
								</div>
								<div onClick={handleProfile}>Profile</div>
								<div onClick={handleLogout}>Logout</div>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
