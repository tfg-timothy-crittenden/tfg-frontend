import styles from "./Listen.module.css";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper";
import SubtitleViewer from "../SubtitleViewer/SubtitleViewer";
import AudioWrapper from "@/components/AudioWrapper/AudioWrapper";

const Listen = ({ audio, image, listeningScript }) => {
	return (
		<>
			<div className={styles.listening_image_container}>
				<div className={styles.listening_image}>
					<img src={image} className={styles.image} />
				</div>
			</div>

			<AudioWrapper>
				<audio controls controlsList="nodownload">
					<source src={audio} type="audio/wav" />
				</audio>
				<SubtitleViewer script={listeningScript} />
			</AudioWrapper>
		</>
	);
};

export default Listen;
