import React, { useRef, useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import CountdownTimerButtons from "./CountdownTimerButtons";
import CountdownTimerBar from "./CountdownTimerBar";

import styles from "./CountdownContainer.module.css";

const CountdownContainer = ({
	initialTime,
	className = "",
	compact = false,
}) => {
	const timerRef = useRef(null);

	const [currentTime, setCurrentTime] = useState(initialTime);
	const [totalTime, setTotalTime] = useState(initialTime);
	const [ticking, setTicking] = useState(false);

	// Poll the timer for state updates
	useEffect(() => {
		const interval = setInterval(() => {
			if (timerRef.current) {
				setCurrentTime(timerRef.current.getCurrentTime());
				setTicking(timerRef.current.getTicking());
			}
		}, 100);
		return () => clearInterval(interval);
	}, []);

	// Reset timer if initialTime changes
	useEffect(() => {
		if (timerRef.current) {
			timerRef.current.setTime(initialTime);
			setCurrentTime(initialTime);
			setTotalTime(initialTime);
		}
	}, [initialTime]);

	const formatTime = (ms) => {
		const totalSeconds = Math.round(ms / 1000);
		const minutes = String(Math.floor(totalSeconds / 60)).padStart(1, "0");
		const seconds = String(totalSeconds % 60).padStart(2, "0");
		return `${minutes}:${seconds}`;
	};

	const handleReset = () => {
		timerRef.current.reset();
		setCurrentTime(timerRef.current.getInitialTime());
		setTotalTime(timerRef.current.getInitialTime());
	};

	return (
		<div
			className={`${styles.container} ${compact ? styles.compact : ""} ${className}`.trim()}
		>
			{/* Exports no visual elements. Handles countdown logic */}
			{/* Controls are exposed via handleRefImperative */}
			<CountdownTimer ref={timerRef} time={totalTime} />

			<CountdownTimerButtons
				ticking={ticking}
				onStartStop={() => {
					if (ticking) timerRef.current.stop();
					else timerRef.current.start();
				}}
				onReset={handleReset}
			/>
			<span className={styles.time_display}>
				{currentTime > 0 ? formatTime(currentTime) : formatTime(0)}
			</span>
			<CountdownTimerBar
				currentTime={currentTime}
				totalTime={totalTime}
				compact={compact}
			/>
		</div>
	);
};

export default CountdownContainer;
