import styles from "./TestWrapper.module.css";

//Higher order component that wraps the test content with a specific style
const TestWrapper = ({ children }) => {
	return (
		<article
			className={styles.test_wrapper_container + " mobile_side_margin fade_in"}
		>
			{children}
		</article>
	);
};

export default TestWrapper;
