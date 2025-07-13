import styles from "./Header.module.css";
import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";
import { useDispatch, useSelector } from "react-redux";
import {
	logout,
	selectIsAuthenticated,
	selectUserRole,
} from "@/store/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Header = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const isAuthenticated = useSelector(selectIsAuthenticated);
	const role = useSelector(selectUserRole);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	return (
		<header className={styles.header}>
			{isAuthenticated && <QuestionToggleSwitch />}

			<p className={styles.title}>TOEFL Speaking</p>

			{isAuthenticated && (
				<div className={styles.buttonGroup}>
					{role === "admin" && (
						<button
							className={styles.adminDashboard}
							onClick={() => navigate("/admin_dashboard")}
						>
							Admin Dashboard
						</button>
					)}
					<button className={styles.logout} onClick={handleLogout}>
						Logout
					</button>
				</div>
			)}
		</header>
	);
};

export default Header;
