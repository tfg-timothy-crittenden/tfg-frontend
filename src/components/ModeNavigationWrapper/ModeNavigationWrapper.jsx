// src/components/ModeNavigationWrapper/ModeNavigationWrapper.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import styles from "./ModeNavigationWrapper.module.css";

const ModeNavigationWrapper = ({
	mode,
	modeEnum,
	setMode,
	setTime,
	modeTimeEnum,
	children,
}) => {
	const { id: classroomId, testId, partNumber } = useParams();
	const navigate = useNavigate();

	// Animation state
	const [animationDirection, setAnimationDirection] = useState(null);
	const [isAnimating, setIsAnimating] = useState(false);

	// Get ordered list of modes
	const modeKeys = Object.keys(modeEnum);
	const currentModeIndex = modeKeys.findIndex((key) => modeEnum[key] === mode);
	const isFirstMode = currentModeIndex === 0;
	const isLastMode = currentModeIndex === modeKeys.length - 1;
	const isFirstPart = partNumber === "1";
	const isLastPart = partNumber === "4";

	// Reset animation when mode changes
	useEffect(() => {
		if (animationDirection) {
			setIsAnimating(true);
			const timer = setTimeout(() => {
				setAnimationDirection(null);
				setIsAnimating(false);
			}, 300); // Match CSS transition duration
			return () => clearTimeout(timer);
		}
	}, [animationDirection]);

	const triggerAnimation = (direction) => {
		setAnimationDirection(direction);
	};

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

			// Right button click -> content slides in from right
			triggerAnimation("from-right");
			setMode(nextMode);
		} else if (!isLastPart) {
			// Navigate to next part (first mode of next part)
			const nextPart = parseInt(partNumber) + 1;
			triggerAnimation("from-right");
			navigate(`/my/classrooms/${classroomId}/test/${testId}/part/${nextPart}`);
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

			// Left button click -> content slides in from left
			triggerAnimation("from-left");
			setMode(prevMode);
		} else if (!isFirstPart) {
			// Navigate to previous part (last mode of previous part)
			const prevPart = parseInt(partNumber) - 1;
			triggerAnimation("from-left");
			navigate(`/my/classrooms/${classroomId}/test/${testId}/part/${prevPart}`);
		}
	};

	// Show chevrons based on position
	const showRightChevron = !(isLastMode && isLastPart);
	const showLeftChevron = !(isFirstMode && isFirstPart);

	// Determine animation class
	const getAnimationClass = () => {
		if (!animationDirection) return "";
		return animationDirection === "from-right"
			? styles.slide_from_right
			: styles.slide_from_left;
	};

	return (
		<div className={styles.navigation_wrapper}>
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
					disabled={isAnimating}
				>
					<ChevronLeft size={24} />
				</button>
			)}

			{/* Main Content Area */}
			<div className={styles.content_area}>
				{/* Mode Toggle Switch */}
				<ToggleSwitch
					mode={mode}
					setMode={setMode}
					modeEnum={modeEnum}
					setTime={setTime}
					modeTimeEnum={modeTimeEnum}
				/>

				{/* Content with animation */}
				<div
					className={`${styles.content} ${getAnimationClass()}`}
					key={`${mode}-${partNumber}`} // Force re-render on part change
				>
					{children}
				</div>
			</div>

			{/* Right Arrow */}
			{showRightChevron && (
				<button
					className={`${styles.nav_arrow} ${styles.right_arrow}`}
					onClick={handleNextMode}
					title={
						isLastMode ? `Go to Part ${parseInt(partNumber) + 1}` : "Next mode"
					}
					disabled={isAnimating}
				>
					<ChevronRight size={24} />
				</button>
			)}
		</div>
	);
};

export default ModeNavigationWrapper;
