import { useState, useRef, useEffect } from "react";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";
import styles from "./PrepareSpeak.module.css";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimeInformation from "@/components/TimeInformation/TimeInformation";
import TimerWrapper from "../TimerWrapper/TimerWrapper";

import { Play as PlayButton } from "lucide-react";
import { Square as StopButton } from "lucide-react";

const PrepareSpeak = ({
	question,
	question_audio,
	mode,
	modeEnum,
	time,
	modeTimes,
}) => {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const handleAudioToggle = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (audio.paused) {
			audio.play();
		} else {
			audio.pause();
			audio.currentTime = 0; // Reset to start
		}
	};
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => setIsPlaying(false);

		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);

	// Reset player + UI when new audio is loaded
	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
		setIsPlaying(false);
	}, [question_audio]);

	return (
		<>
			<TestWrapper>
				{question_audio && <audio ref={audioRef} src={question_audio}></audio>}
				<div className={styles.question_container}>
					<h2>Question</h2>
					<button className={styles.play_button} onClick={handleAudioToggle}>
						{isPlaying ? <StopButton size="12" /> : <PlayButton size="12" />}
					</button>
				</div>
				<p>{question}</p>
			</TestWrapper>

			<TimerWrapper>
				<TimeInformation modeTimes={modeTimes} />
				{mode === modeEnum.PREPARE && (
					<p className={styles.instruction}>Prepare your response</p>
				)}
				{mode === modeEnum.SPEAK && (
					<span className={styles.instruction}>Give your response</span>
				)}
				<CountdownContainer initialTime={time} />
			</TimerWrapper>
		</>
	);
};

export default PrepareSpeak;
