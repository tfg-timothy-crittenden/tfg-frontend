import React from "react";
import { BookOpen, Headphones, Mic, Info, Brain } from "lucide-react";
import styles from "./MobileTaskModeSwitch.module.css";

const MobileTaskModeSwitch = ({
	mode,
	modeEnum,
	setMode,
	setTime,
	modeTimeEnum,
}) => {
	const modeConfig = {
		READ: { icon: <BookOpen size={18} />, label: "Read", color: "read" },
		LISTEN: {
			icon: <Headphones size={18} />,
			label: "Listen",
			color: "listen",
		},
		PREPARE: { icon: <Brain size={18} />, label: "Prepare", color: "prepare" },
		SPEAK: { icon: <Mic size={18} />, label: "Speak", color: "speak" },
	};

	const handleModeChange = (newMode) => {
		// Set time conditionally for specific modes
		if (newMode === modeEnum.PREPARE) {
			setTime(modeTimeEnum.PREPARE * 1000);
		} else if (newMode === modeEnum.SPEAK) {
			setTime(modeTimeEnum.SPEAK * 1000);
		}
		setMode(newMode);
	};

	// Get available modes for current test type
	const availableModes = Object.entries(modeEnum).filter(
		([, value]) => modeConfig[value],
	);

	return (
		<div className={styles.mobile_mode_switch}>
			<div className={styles.mode_container}>
				{availableModes.map(([, value]) => {
					const config = modeConfig[value];
					const isActive = mode === value;

					return (
						<button
							key={value}
							className={`${styles.mode_button} ${
								isActive ? styles.active : ""
							} ${styles[config.color]}`}
							onClick={() => handleModeChange(value)}
							aria-label={`Switch to ${config.label} mode`}
						>
							{config.icon}
							<span className={styles.mode_label}>{config.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default MobileTaskModeSwitch;
