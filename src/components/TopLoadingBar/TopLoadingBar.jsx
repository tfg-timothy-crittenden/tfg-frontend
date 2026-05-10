import { createPortal } from "react-dom";
import styles from "./TopLoadingBar.module.css";

const TopLoadingBar = ({ loading, label = "Loading test" }) => {
	if (!loading || typeof document === "undefined") return null;

	return createPortal(
		<div className={styles.wrapper} role="status" aria-live="polite">
			<div className={styles.track} aria-hidden="true">
				<span className={styles.indicatorOne}></span>
				<span className={styles.indicatorTwo}></span>
			</div>
			<span className={styles.srOnly}>{label}</span>
		</div>,
		document.body,
	);
};

export default TopLoadingBar;
