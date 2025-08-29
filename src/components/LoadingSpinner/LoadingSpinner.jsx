import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = ({ label = "Loading…" }) => {
	return (
		<div className={styles.spinner_container} role="status" aria-live="polite">
			{/* Decorative visual */}
			<div className={styles.sk_cube_grid} aria-hidden="true">
				<div className={`${styles.sk_cube} ${styles.sk_cube1}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube2}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube3}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube4}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube5}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube6}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube7}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube8}`}></div>
				<div className={`${styles.sk_cube} ${styles.sk_cube9}`}></div>
			</div>

			{/* Announced text */}
			<span className={styles.sr_only}>{label}</span>
		</div>
	);
};

export default LoadingSpinner;
