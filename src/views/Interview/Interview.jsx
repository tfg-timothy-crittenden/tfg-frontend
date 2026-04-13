import useListenSpeakTask from "@/hooks/useListenSpeakTask";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import TaskResponseControls from "@/components/TaskResponseControls/TaskResponseControls";
import styles from "./interview.module.css";

const Interview = () => {
	const { mode, modeEnum, time, testData, loading, questionAudioUrl } =
		useListenSpeakTask();

	const transcript = testData?.transcriptText || testData?.transcript || "";

	return (
		<div className={styles.interview_page}>
			<h1 className={styles.page_title}>Answer the Interviewer's question</h1>
			<ToggleSwitch mode={mode} modeEnum={modeEnum} />
			<div className={styles.content_container}>
				<div className={styles.image_container}>
					<img
						className={styles.interviewer_image}
						src="/assets/interviewer_image.png"
						alt="Interviewer"
					/>
				</div>
				{loading ? (
					<p className={styles.loading_state}>Loading test...</p>
				) : (
					<TaskResponseControls
						mode={mode}
						modeEnum={modeEnum}
						time={time}
						questionAudioUrl={questionAudioUrl}
						transcript={transcript}
					/>
				)}
			</div>
		</div>
	);
};

export default Interview;
