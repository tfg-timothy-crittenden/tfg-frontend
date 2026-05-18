import React from "react";
import { BookOpen, Headphones, Mic, Info, Brain } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { buildRoute, MODE_SEGMENTS } from "@/routes/routeConfig";

import styles from "./ToggleSwitch.module.css";

const ToggleSwitch = ({ mode, modeEnum }) => {
	const navigate = useNavigate();
	const {
		id: classroomId,
		sectionId,
		partNumber,
		questionNumber,
	} = useParams();

	const modeIcons = {
		INSTRUCTIONS: <Info size={24} />,
		READ: <BookOpen size={24} />,
		LISTEN: <Headphones size={24} />,
		PREPARE: <Brain size={24} />,
		SPEAK: <Mic size={24} />,
	};

	const handleModeChange = (targetMode) => {
		if (!sectionId || !partNumber || !classroomId) return;

		let routePath;
		const modeMap = {
			SPEAK: MODE_SEGMENTS.SPEAK,

			LISTEN: MODE_SEGMENTS.LISTEN,
		};
		const routeMode = modeMap[targetMode];
		if (routeMode) {
			routePath = buildRoute.partMode(
				classroomId,
				sectionId,
				partNumber,
				questionNumber,
				routeMode,
			);
		} else {
			routePath = buildRoute.sectionPart(classroomId, sectionId, partNumber);
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
