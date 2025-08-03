import React from "react";
import { BookOpen, Headphones, Mic } from "lucide-react";
import { Brain } from "lucide-react";

import styles from "./ToggleSwitch.module.css";

const ToggleSwitch = ({ mode, modeEnum, setMode, setTime, modeTimeEnum }) => {
	const modeIcons = {
		READ: <BookOpen size={24} />,
		LISTEN: <Headphones size={24} />,
		PREPARE: <Brain size={24} />,
		SPEAK: <Mic size={24} />,
	};

	return (
		<div className={styles.toggle_group}>
			{Object.entries(modeEnum).map(([key, value]) => {
				const id = key.toLowerCase();

				const handleChange = () => {
					// Set time conditionally for specific modes
					if (value === modeEnum.PREPARE) {
						setTime(modeTimeEnum.PREPARE * 1000);
					} else if (value === modeEnum.SPEAK) {
						setTime(modeTimeEnum.SPEAK * 1000);
					}
					setMode(value);
				};

				return (
					<React.Fragment key={value}>
						<input
							type="radio"
							name="mode"
							id={id}
							value={id}
							checked={mode === value}
							onChange={handleChange}
							title="Toggle Mode"
						/>
						<label htmlFor={id}>{modeIcons[key]}</label>
					</React.Fragment>
				);
			})}
		</div>
	);
};

export default ToggleSwitch;
