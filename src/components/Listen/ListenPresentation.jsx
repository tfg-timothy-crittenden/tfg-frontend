import styles from "./Listen.module.css";
import TestWrapper from "@/components/TestWrapper/TestWrapper";

const Listen = ({ audio, image }) => {
	return (
		<TestWrapper>
			<img src={image} className={styles.image} />
			<hr></hr>
			<audio controls>
				<source src={audio} type="audio/wav" />
			</audio>
		</TestWrapper>
	);
};

export default Listen;
