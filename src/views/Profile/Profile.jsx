import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, selectHasRole } from "@/store/auth/authSlice";
import { fetchMe } from "@/store/auth/authSlice";
import {
	resetPasswordRequest,
	updateProfile,
} from "@/domain/users/api/authApi";
import styles from "./Profile.module.css";

export default function Profile() {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
	const isAdmin = useSelector(selectHasRole(["admin"]));
	const isTeacher = useSelector(selectHasRole(["teacher"]));
	const role = isAdmin ? "Admin" : isTeacher ? "Teacher" : "Student";

	const [form, setForm] = useState({
		name: user?.name || "",
		surname: user?.surname || "",
		username: user?.username || "",
	});

	const [profileStatus, setProfileStatus] = useState(null); // { type: "success"|"error", message }
	const [profileLoading, setProfileLoading] = useState(false);

	const [passwordStatus, setPasswordStatus] = useState(null);
	const [passwordLoading, setPasswordLoading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setProfileLoading(true);
		setProfileStatus(null);
		try {
			await updateProfile(form);
			await dispatch(fetchMe());
			setProfileStatus({
				type: "success",
				message: "Profile updated successfully.",
			});
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				err?.message ||
				"Failed to update profile.";
			setProfileStatus({ type: "error", message: msg });
		} finally {
			setProfileLoading(false);
		}
	};

	const handlePasswordReset = async () => {
		if (!user?.email) return;
		setPasswordLoading(true);
		setPasswordStatus(null);
		try {
			await resetPasswordRequest(user.email);
			setPasswordStatus({
				type: "success",
				message: "Password reset email sent. Check your inbox.",
			});
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				err?.message ||
				"Failed to send reset email.";
			setPasswordStatus({ type: "error", message: msg });
		} finally {
			setPasswordLoading(false);
		}
	};

	const initials =
		[user?.name, user?.surname]
			.filter(Boolean)
			.map((s) => s[0].toUpperCase())
			.join("") ||
		(user?.username?.[0]?.toUpperCase() ?? "?");

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<div className={styles.avatar}>{initials}</div>
				<h1 className={styles.title}>My Profile</h1>

				<form className={styles.form} onSubmit={handleSave}>
					<div className={styles.row}>
						<div className={styles.field}>
							<label htmlFor="name">First Name</label>
							<input
								id="name"
								name="name"
								type="text"
								value={form.name}
								onChange={handleChange}
								autoComplete="given-name"
							/>
						</div>
						<div className={styles.field}>
							<label htmlFor="surname">Last Name</label>
							<input
								id="surname"
								name="surname"
								type="text"
								value={form.surname}
								onChange={handleChange}
								autoComplete="family-name"
							/>
						</div>
					</div>

					<div className={styles.field}>
						<label htmlFor="username">Username</label>
						<input
							id="username"
							name="username"
							type="text"
							value={form.username}
							onChange={handleChange}
							autoComplete="username"
						/>
					</div>

					{user?.email && (
						<div className={styles.field}>
							<label>Email</label>
							<div className={styles.readonly_value}>{user.email}</div>
						</div>
					)}

					{role && (
						<div className={styles.field}>
							<label>Role</label>
							<div className={styles.readonly_value}>{role}</div>
						</div>
					)}

					{profileStatus && (
						<div
							className={
								profileStatus.type === "success"
									? styles.success_message
									: styles.error_message
							}
						>
							{profileStatus.message}
						</div>
					)}

					<button
						type="submit"
						className={styles.primary_button}
						disabled={profileLoading}
					>
						{profileLoading ? "Saving…" : "Save Changes"}
					</button>
				</form>

				<hr className={styles.divider} />

				<div className={styles.security_section}>
					<h2 className={styles.section_title}>Security</h2>
					<p className={styles.section_desc}>
						Send a password reset link to your email address.
					</p>

					{passwordStatus && (
						<div
							className={
								passwordStatus.type === "success"
									? styles.success_message
									: styles.error_message
							}
						>
							{passwordStatus.message}
						</div>
					)}

					<button
						type="button"
						className={styles.secondary_button}
						onClick={handlePasswordReset}
						disabled={passwordLoading}
					>
						{passwordLoading ? "Sending…" : "Send Password Reset Email"}
					</button>
				</div>
			</div>
		</div>
	);
}
