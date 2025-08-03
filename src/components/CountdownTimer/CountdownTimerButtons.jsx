import React from "react";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";

import { Timer as PlayButton } from "lucide-react";
import { TimerReset as ResetButton } from "lucide-react";

import styles from "./CountdownTimerButtons.module.css";

const CountdownTimerButtons = ({ ticking, onStartStop, onReset, disabled }) => {
	return (
		<div className={styles.button_container}>
			<button
				className={`${styles.btn} ${ticking ? styles.stop : styles.start}`}
				onClick={onStartStop}
				disabled={disabled}
				title={ticking ? "Pause Timer" : "Start Timer"}
			>
				{ticking ? <PauseOutlinedIcon /> : <PlayButton />}
			</button>

			<button
				className={`${styles.btn} ${styles.reset}`}
				onClick={onReset}
				title="Reset Timer"
				disabled={disabled}
			>
				<ResetButton />
			</button>
		</div>
	);
};

export default CountdownTimerButtons;
