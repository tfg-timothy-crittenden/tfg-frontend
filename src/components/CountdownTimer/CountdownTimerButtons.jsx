import {
	Pause as PauseButton,
	Timer as PlayButton,
	TimerReset as ResetButton,
} from "lucide-react";

import styles from "./CountdownTimerButtons.module.css";

const CountdownTimerButtons = ({ ticking, onStartStop, onReset }) => {
	return (
		<div className={styles.button_container}>
			<button
				className={`${styles.btn} ${ticking ? styles.stop : styles.start}`}
				onClick={onStartStop}
				title={ticking ? "Pause Timer" : "Start Timer"}
			>
				{ticking ? <PauseButton size={20} /> : <PlayButton size={20} />}
			</button>

			<button
				className={`${styles.btn} ${styles.reset}`}
				onClick={onReset}
				title="Reset Timer"
			>
				<ResetButton size={20} />
			</button>
		</div>
	);
};

export default CountdownTimerButtons;
