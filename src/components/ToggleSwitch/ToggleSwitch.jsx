import React from "react";
import { BookOpen, Headphones, Mic, Info, Brain } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { buildRoute, MODE_SEGMENTS } from "@/routes/routeConfig";

import styles from "./ToggleSwitch.module.css";

const ToggleSwitch = ({ mode, modeEnum }) => {
	const navigate = useNavigate();
	const { id: classroomId, testId, partNumber } = useParams();

	const modeIcons = {
		INSTRUCTIONS: <Info size={24} />,
		READ: <BookOpen size={24} />,
		LISTEN: <Headphones size={24} />,
		PREPARE: <Brain size={24} />,
		SPEAK: <Mic size={24} />,
	};

	const handleModeChange = (targetMode) => {
		if (!testId || !partNumber || !classroomId) return;

		let routePath;

		if (targetMode === "INSTRUCTIONS") {
			routePath = buildRoute.partMode(
				classroomId,
				testId,
				partNumber,
				MODE_SEGMENTS.INSTRUCTIONS
			);
		} else {
			// Map the mode enum to route segments
			const modeMap = {
				PREPARE: MODE_SEGMENTS.PREPARE,
				SPEAK: MODE_SEGMENTS.SPEAK,
				READ: MODE_SEGMENTS.READ,
				LISTEN: MODE_SEGMENTS.LISTEN,
			};

			const routeMode = modeMap[targetMode];
			if (routeMode) {
				routePath = buildRoute.partMode(
					classroomId,
					testId,
					partNumber,
					routeMode
				);
			} else {
				// Default to the part route without mode
				routePath = buildRoute.testPart(classroomId, testId, partNumber);
			}
		}

		navigate(routePath);
	};

	return (
		<div className={styles.toggle_group}>
			{Object.entries(modeEnum).map(([key, value]) => {
				const id = key.toLowerCase();
				const isActive = mode === value;

				return (
					<React.Fragment key={key}>
						<input
							type="radio"
							id={id}
							name="mode"
							value={value}
							checked={isActive}
							onChange={() => handleModeChange(value)}
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
