import React from "react";
import { BookOpen, Headphones, Mic, Info } from "lucide-react";
import { Brain } from "lucide-react";

import styles from "./ToggleSwitch.module.css";

const ToggleSwitch = ({
	mode,
	modeEnum,
	setMode,
	setTime,
	modeTimeEnum,
	onModeChange,
}) => {
	const modeIcons = {
		INSTRUCTIONS: <Info size={24} />,
		READ: <BookOpen size={24} />,
		LISTEN: <Headphones size={24} />,
		PREPARE: <Brain size={24} />,
		SPEAK: <Mic size={24} />,
	};

	// Get ordered list of modes to determine direction
	const modeKeys = Object.keys(modeEnum);
	const currentModeIndex = modeKeys.findIndex((key) => modeEnum[key] === mode);

	return (
		<div className={styles.toggle_group}>
			{Object.entries(modeEnum).map(([key, value], index) => {
				const id = key.toLowerCase();

				const handleChange = () => {
					// Set time conditionally for specific modes
					if (value === modeEnum.PREPARE) {
						setTime(modeTimeEnum.PREPARE * 1000);
					} else if (value === modeEnum.SPEAK) {
						setTime(modeTimeEnum.SPEAK * 1000);
					}

					// Determine animation direction if callback provided
					if (onModeChange) {
						const direction = index > currentModeIndex ? "right" : "left";
						onModeChange(direction);
					}

					setMode(value);
				};

				return (
					<React.Fragment key={key}>
						<input
							type="radio"
							id={id}
							name="mode"
							value={value}
							checked={mode === value}
							onChange={handleChange}
							hidden
						/>
						<label htmlFor={id} className={styles.toggle_label}>
							{modeIcons[value] || value}
						</label>
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default ToggleSwitch;
