import styles from "./Listen.module.css";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper";
import SubtitleViewer from "../SubtitleViewer/SubtitleViewer";

const Listen = ({ audio, image, listeningScript }) => {
	return (
		<>
			<TestWrapper>
				<img src={image} className={styles.image} />
				<SubtitleViewer script={listeningScript} />
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
