// src/components/NavigationArrows/NavigationArrows.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { buildRoute } from "@/routes/routeConfig";
import styles from "./NavigationArrows.module.css";

const NavigationArrows = ({
	mode,
	modeEnum,
	setMode,
	setTime,
	modeTimeEnum,
}) => {
	const {
		id: classroomId,
		sectionId,
		partNumber,
		questionNumber,
	} = useParams();
	const navigate = useNavigate();

	// Get ordered list of modes
	const modeKeys = Object.keys(modeEnum);
	const currentModeIndex = modeKeys.findIndex((key) => modeEnum[key] === mode);
	const isFirstMode = currentModeIndex === 0;
	const isLastMode = currentModeIndex === modeKeys.length - 1;
	const isFirstPart = partNumber === "1" && questionNumber === "1";
	const isLastPart = partNumber === "2" && questionNumber === "4";

	const handleNextMode = () => {
		if (!isLastMode) {
			// Navigate to next mode
			const nextModeKey = modeKeys[currentModeIndex + 1];
			const nextMode = modeEnum[nextModeKey];

			// Set time conditionally for specific modes
			if (nextMode === modeEnum.PREPARE) {
				setTime(modeTimeEnum.PREPARE * 1000);
			} else if (nextMode === modeEnum.SPEAK) {
				setTime(modeTimeEnum.SPEAK * 1000);
			}

			setMode(nextMode);
		} else if (!isLastPart) {
			// Navigate to next part (first mode of next part)
			const nextPart = parseInt(partNumber, 10) + 1;
			navigate(buildRoute.sectionPart(classroomId, sectionId, nextPart));
		}
	};

	const handlePrevMode = () => {
		if (!isFirstMode) {
			// Navigate to previous mode
			const prevModeKey = modeKeys[currentModeIndex - 1];
			const prevMode = modeEnum[prevModeKey];

			// Set time conditionally for specific modes
			if (prevMode === modeEnum.PREPARE) {
				setTime(modeTimeEnum.PREPARE * 1000);
			} else if (prevMode === modeEnum.SPEAK) {
				setTime(modeTimeEnum.SPEAK * 1000);
			}

			setMode(prevMode);
		} else if (!isFirstPart) {
			// Navigate to previous part (last mode of previous part)
			const prevPart = parseInt(partNumber, 10) - 1;
			navigate(buildRoute.sectionPart(classroomId, sectionId, prevPart));
		}
	};

	// Show chevrons based on position
	const showRightChevron = !(isLastMode && isLastPart);
	const showLeftChevron = !(isFirstMode && isFirstPart);

	return (
		<>
			{/* Left Arrow */}
			{showLeftChevron && (
				<button
					className={`${styles.nav_arrow} ${styles.left_arrow}`}
					onClick={handlePrevMode}
					title={
						isFirstMode
							? `Go to Part ${parseInt(partNumber) - 1}`
							: "Previous mode"
					}
				>
					<ChevronLeft size={24} />
				</button>
			)}

			{/* Right Arrow */}
			{showRightChevron && (
				<button
					className={`${styles.nav_arrow} ${styles.right_arrow}`}
					onClick={handleNextMode}
					title={
						isLastMode ? `Go to Part ${parseInt(partNumber) + 1}` : "Next mode"
					}
				>
					<ChevronRight size={24} />
				</button>
			)}
		</>
	);
};

export default NavigationArrows;
