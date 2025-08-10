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
import { CircleUser } from "lucide-react";

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

	return (
		<header className={styles.header}>
			<p className={styles.title}>TOEFL Speaking</p>

			{isAuthenticated && (
				<div className={styles.buttonGroup}>
					<div
						className={
							`${styles.nav_item_container} ${styles.nav_item_border}` +
							(isClassroomsActive ? ` ${styles.activeLink}` : "")
						}
						onClick={() => handleNavigateTo("/my/classrooms")}
					>
						Classrooms
					</div>
					{isAdmin && (
						<div
							className={
								`${styles.nav_item_container} ${styles.nav_item_border}` +
								(isAdminActive ? ` ${styles.activeLink}` : "")
							}
							onClick={() => handleNavigateTo("/admin_dashboard/teachers")}
						>
							Admin Dashboard
						</div>
					)}

					<div
						className={styles.nav_item_container}
						ref={dropdownRef}
						onClick={() => setShowUserMenu((prev) => !prev)}
					>
						<CircleUser size={40} style={{ cursor: "pointer" }} />
						<div className={styles.userInfo}>
							<span className={styles.username}>{username}</span>
							<span className={styles.role}>{displayRole}</span>
						</div>
						{showUserMenu && (
							<div className={styles.dropdown}>
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
