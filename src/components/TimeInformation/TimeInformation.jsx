import styles from "./TimeInformation.module.css";

const TimeInformation = ({ modeTimes }) => {
	return (
		<section className={styles.container}>
			<span className={styles.time_instructions}>
				Preparation Time: {modeTimes.PREPARE} seconds
			</span>
			<span className={styles.time_instructions}>
				Record Time: {modeTimes.SPEAK} seconds
			</span>
		</section>
	);
};
export default TimeInformation;
