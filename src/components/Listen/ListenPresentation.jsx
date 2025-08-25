import styles from "./Listen.module.css";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper"

const Listen = ({ audio, image }) => {
	return (
		<>
			<TestWrapper>
				<img src={image} className={styles.image} />
				
			</TestWrapper>
			<TimerWrapper>
				<audio controls>
					<source src={audio} type="audio/wav" />
				</audio>
			</TimerWrapper>
		</>
	);
};

export default Listen;
