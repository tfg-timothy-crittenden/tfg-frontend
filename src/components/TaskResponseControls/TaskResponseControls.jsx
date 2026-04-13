import { useRef, useState } from "react";
import { Captions } from "lucide-react";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";
import SubtitleViewer from "@/components/SubtitleViewer/SubtitleViewer";

import styles from "./TaskResponseControls.module.css";

const TaskResponseControls = ({
	mode,
	modeEnum,
	time,
	questionAudioUrl,
	transcript,
}) => {
	const subtitleViewerRef = useRef(null);
	const [showSubtitles, setShowSubtitles] = useState(false);
	const hasTranscript = Boolean(transcript && transcript.trim());

	const isListenMode = mode === modeEnum.LISTEN;
	const isSpeakMode = mode === modeEnum.SPEAK;
	const isInteractiveMode = isListenMode || isSpeakMode;

	const toggleSubtitles = () => {
		const nextState = !showSubtitles;
		setShowSubtitles(nextState);
		if (nextState) {
			subtitleViewerRef.current?.open?.();
		} else {
			subtitleViewerRef.current?.close?.();
		}
	};

	const renderPrimaryControl = () => {
		if (isListenMode) {
			return (
				<audio
					key={questionAudioUrl || "no-audio"}
					className={styles.listen_audio_player}
					controls
					src={questionAudioUrl || undefined}
				/>
			);
		}

		if (isSpeakMode) {
			return (
				<CountdownContainer
					initialTime={time}
					className={styles.countdown_control_slot}
					compact
				/>
			);
		}

		return null;
	};

	if (!isInteractiveMode) {
		return null;
	}

	return (
		<>
			<div
				className={`${styles.test_controls_container} ${styles.listen_controls_row}`}
			>
				<div className={styles.primary_control_slot}>
					{renderPrimaryControl()}
				</div>
				{hasTranscript && (
					<span
						className={`${styles.subtitle_toggle} ${
							showSubtitles ? styles.active : ""
						}`}
						onClick={toggleSubtitles}
						aria-label={showSubtitles ? "Hide subtitles" : "Show subtitles"}
						title={showSubtitles ? "Hide subtitles" : "Show subtitles"}
					>
						<Captions size={20} />
					</span>
				)}
			</div>
			{hasTranscript && (
				<SubtitleViewer ref={subtitleViewerRef} script={transcript} />
			)}
		</>
	);
};

export default TaskResponseControls;
