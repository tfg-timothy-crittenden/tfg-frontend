import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";

import { Timer as PlayButton } from "lucide-react";
import { TimerReset as ResetButton } from "lucide-react";

import styles from "./CountdownTimerButtons.module.css";

const CountdownTimerButtons = ({ ticking, onStartStop, onReset }) => {
	return (
		<div className={styles.button_container}>
			<button
				className={`${styles.btn} ${ticking ? styles.stop : styles.start}`}
				onClick={onStartStop}
				title={ticking ? "Pause Timer" : "Start Timer"}
			>
				{ticking ? <PauseOutlinedIcon /> : <PlayButton />}
			</button>

			<button
				className={`${styles.btn} ${styles.reset}`}
				onClick={onReset}
				title="Reset Timer"
			>
				<ResetButton />
			</button>
		</div>
	);
};

export default CountdownTimerButtons;
