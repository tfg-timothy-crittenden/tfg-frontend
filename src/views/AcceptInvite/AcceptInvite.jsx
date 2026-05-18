
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signupWithInvitation } from "@/api/auth/authAPI";
import styles from "./AcceptInvite.module.css";

function AcceptInvitePage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [error, setError] = useState("");
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const [name, setName] = useState("");
	const [surname, setSurname] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		if (!token) setError("Missing invitation token.");
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!token) {
			setFormError("Missing invitation token.");
			return;
		}

		setFormError("");
		setFormSuccess("");
		setSubmitting(true);

		if (!name.trim()) {
			setFormError("Name is required.");
			setSubmitting(false);
			return;
		}

		if (!surname.trim()) {
			setFormError("Surname is required.");
			setSubmitting(false);
			return;
		}

		if (!username || username.length < 3) {
			setFormError("Username must be at least 3 characters.");
			setSubmitting(false);
			return;
		}
		if (!password || password.length < 8) {
			setFormError("Password must be at least 8 characters.");
			setSubmitting(false);
			return;
		}
		if (password !== confirmPassword) {
			setFormError("Passwords do not match.");
			setSubmitting(false);
			return;
		}

		try {
			const data = await signupWithInvitation({
				username: username.trim(),
				name: name.trim(),
				surname: surname.trim(),
				invitationToken: token,
				password,
			});

			setFormSuccess(
				data?.message || "Account setup complete! Redirecting to login...",
			);
			setTimeout(() => navigate("/login"), 1500);
		} catch (err) {
			setFormError(
				err?.response?.data?.message ||
					err?.response?.data?.error ||
					err?.message ||
					"Error submitting form.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (error) return <p>{error}</p>;

	return (
		   <div className={styles.invite_signup_outer}>
			   <div className={styles.invite_signup_card}>
				   <div className={styles.invite_signup_left}>
					   <h2 className={styles.invite_signup_title}>Set Up Your Teacher Account</h2>
					   <p className={styles.invite_signup_subtitle}>Complete your account setup to accept the invitation.</p>
					   <form className={styles.invite_signup_form} onSubmit={handleSubmit}>
						   <div className={styles.invite_form_group}>
							   <label>Name</label>
							   <input
								   type="text"
								   value={name}
								   onChange={(e) => setName(e.target.value)}
								   required
							   />
						   </div>
						   <div className={styles.invite_form_group}>
							   <label>Surname</label>
							   <input
								   type="text"
								   value={surname}
								   onChange={(e) => setSurname(e.target.value)}
								   required
							   />
						   </div>
						   <div className={styles.invite_form_group}>
							   <label>Username</label>
							   <input
								   type="text"
								   value={username}
								   onChange={(e) => setUsername(e.target.value)}
								   required
							   />
						   </div>
						   <div className={styles.invite_form_group}>
							   <label>Password</label>
							   <input
								   type="password"
								   value={password}
								   onChange={(e) => setPassword(e.target.value)}
								   required
							   />
						   </div>
						   <div className={styles.invite_form_group}>
							   <label>Confirm Password</label>
							   <input
								   type="password"
								   value={confirmPassword}
								   onChange={(e) => setConfirmPassword(e.target.value)}
								   required
							   />
						   </div>
						   {formError && (
							   <p className={`${styles.invite_signup_message} ${styles.error}`}>{formError}</p>
						   )}
						   {formSuccess && (
							   <p className={`${styles.invite_signup_message} ${styles.success}`}>{formSuccess}</p>
						   )}
						   <button
							   className={styles.invite_signup_button}
							   type="submit"
							   disabled={submitting}
						   >
							   {submitting ? "Submitting..." : "Finish Setup"}
						   </button>
					   </form>
				   </div>
			   </div>
		   </div>
	);
}

export default AcceptInvitePage;
