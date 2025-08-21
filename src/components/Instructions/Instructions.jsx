// src/components/Instructions/Instructions.jsx
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import styles from "./Instructions.module.css";

const Instructions = ({ partNumber, children }) => {
	return (
		<TestWrapper>
			<div className={styles.instructions_container}>
				<h2 className={styles.title}>Task {partNumber}</h2>
				<div className={styles.content}>{children}</div>
			</div>
		</TestWrapper>
	);
};

export default Instructions;
