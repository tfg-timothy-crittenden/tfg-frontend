import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendVerificationEmail } from "@/domain/users/api/authApi";
import { ROUTES } from "@/app/routes/routeConfig";
import styles from "./CheckEmail.module.css";

const CheckEmail = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const email = location.state?.email || "";

	const [resendStatus, setResendStatus] = useState(null); // "sending" | "sent" | "error"
	const [resendErrorMessage, setResendErrorMessage] = useState("");

	const handleResend = async () => {
		if (!email) return;
		setResendStatus("sending");
		setResendErrorMessage("");
		try {
			await resendVerificationEmail(email);
			setResendStatus("sent");
		} catch (error) {
			setResendStatus("error");
			setResendErrorMessage(
				error?.message || "Something went wrong. Please try again.",
			);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				{/* Step indicators */}
				<div className={styles.steps}>
					<div className={styles.step}>
						<span className={`${styles.stepNumber} ${styles.stepActive}`}>
							1
						</span>
						<span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
							Verify email
						</span>
					</div>
					<div className={styles.stepConnector} />
					<div className={styles.step}>
						<span className={styles.stepNumber}>2</span>
						<span className={styles.stepLabel}>Login</span>
					</div>
					<div className={styles.stepConnector} />
					<div className={styles.step}>
						<span className={styles.stepNumber}>3</span>
						<span className={styles.stepLabel}>Join classroom</span>
					</div>
				</div>

				{/* Icon */}
				<div className={styles.iconWrapper}>
					<svg
						width="56"
						height="56"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M22 2L11 13" />
						<path d="M22 2L15 22 11 13 2 9l20-7z" />
					</svg>
				</div>

				<h1 className={styles.heading}>Check your email</h1>

				{email ? (
					<p className={styles.description}>
						We sent a verification link to <strong>{email}</strong>.
					</p>
				) : (
					<p className={styles.description}>
						We sent a verification link to your email address.
					</p>
				)}

				{/* Resend */}
				<p className={styles.resendRow}>
					Didn&apos;t receive the email?{" "}
					{resendStatus === "sent" ? (
						<span className={styles.resendConfirm}>Email sent!</span>
					) : (
						<button
							className={styles.resendButton}
							onClick={handleResend}
							disabled={resendStatus === "sending" || !email}
						>
							{resendStatus === "sending" ? "Sending…" : "Request a new one."}
						</button>
					)}
				</p>
				{resendStatus === "error" && (
					<p className={styles.resendError}>
						{resendErrorMessage || "Something went wrong. Please try again."}
					</p>
				)}

				<button
					className={styles.loginLink}
					onClick={() => navigate(ROUTES.LOGIN)}
				>
					Back to login
				</button>
			</div>
		</div>
	);
};

export default CheckEmail;
