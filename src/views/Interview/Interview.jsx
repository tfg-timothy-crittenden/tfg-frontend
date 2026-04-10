import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import styles from "./interview.module.css";

const Interview = () => {
	const { sectionId, partNumber, questionNumber } = useParams();
	const location = useLocation();

	const questionAudioUrl = null;

	const modeEnum = Object.freeze({
		INSTRUCTIONS: "INSTRUCTIONS",
		LISTEN: "LISTEN",
		SPEAK: "SPEAK",
	});

	const modeTimes = {
		[modeEnum.LISTEN]: 30,
		[modeEnum.SPEAK]: 60,
	};

	const getModeFromUrl = () => {
		const pathname = location.pathname;
		if (pathname.includes("/instructions")) return modeEnum.INSTRUCTIONS;
		if (pathname.includes("/listen")) return modeEnum.LISTEN;
		if (pathname.includes("/speak")) return modeEnum.SPEAK;
		return modeEnum.INSTRUCTIONS;
	};

	const [mode, setMode] = useState(getModeFromUrl());
	const [time, setTime] = useState(0);

	useEffect(() => {
		const newMode = getModeFromUrl();
		setMode(newMode);
		if (newMode === modeEnum.LISTEN) setTime(modeTimes.LISTEN * 1000);
		else if (newMode === modeEnum.SPEAK) setTime(modeTimes.SPEAK * 1000);
	}, [location.pathname]);

	const isInstructionsMode = mode === modeEnum.INSTRUCTIONS;
	const isListenMode = mode === modeEnum.LISTEN;
	const isSpeakMode = mode === modeEnum.SPEAK;
	const isInteractiveMode = isListenMode || isSpeakMode;

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
				<CountdownCountainer
					initialTime={time}
					className={styles.countdown_control_slot}
					compact
				/>
			);
		}

		return null;
	};
	const renderTestElements = () => {
		if (isInstructionsMode) {
			return <div className={styles.test_controls_container}></div>;
		}

		if (isInteractiveMode) {
			return (
				<>
					<div
						className={`${styles.test_controls_container} ${styles.listen_controls_row}`}
					>
						<div className={styles.primary_control_slot}>
							{renderPrimaryControl()}
						</div>
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
					</div>
					<SubtitleViewer ref={subtitleViewerRef} script={transcript} />
				</>
			);
		}

		return (
			<div className={styles.test_controls_container}>
				<SubtitleViewer script={transcript} />
			</div>
		);
	};

	return (
		<div>
			<h1>Answer the Interviewer's question</h1>
			<ToggleSwitch mode={mode} modeEnum={modeEnum} />
			<img
				className={styles.interviewer_image}
				src="/assets/interviewer_image.png"
			></img>
			{renderTestElements()}
		</div>
	);
};

export default Interview;
