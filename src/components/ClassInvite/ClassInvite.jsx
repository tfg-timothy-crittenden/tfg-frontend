import React from "react";
import ClassSignupQR from "@/components/ClassSignupQR/ClassSignupQR";
import styles from "./ClassInvite.module.css";

const ClassInvite = ({
	className,
	classCode, // e.g. "ef011db2"
}) => {
	return (
		<>
			<div className={styles.grid}>
				{/* LEFT — Already have an account */}

				<section className={styles.card}>
					<p className={styles.cardTitle}>Create an account and join class</p>

					<div className={styles.qrBlock}>
						<ClassSignupQR classCode={classCode} mode="param" size={220} />
					</div>
				</section>
				{/* RIGHT — Create an account */}
				<section className={styles.card}>
					<p className={styles.cardTitle}>Already have an account?</p>
					<ol className={styles.steps}>
						<li>Go to Classrooms → Join with code</li>
						<li>Enter this code:</li>
					</ol>

					<div className={styles.code}>{classCode}</div>
				</section>
			</div>
		</>
	);
};

export default ClassInvite;
