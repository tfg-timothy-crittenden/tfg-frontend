import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SpeakingPart3Presentation from "./SpeakingPart3Presentation";
import { getSpeakingTaskThreeById } from "@/api/tasks/tasksAPI";

const SpeakingPart3Container = () => {
	const { testId } = useParams();
	const location = useLocation();

	const modeEnum = Object.freeze({
		INSTRUCTIONS: "INSTRUCTIONS",
		READ: "READ",
		LISTEN: "LISTEN",
		PREPARE: "PREPARE",
		SPEAK: "SPEAK",
	});

	const modeTimes = {
		[modeEnum.PREPARE]: 30,
		[modeEnum.SPEAK]: 60,
	};

	// Determine mode based on URL
	const getModeFromUrl = () => {
		const pathname = location.pathname;

		if (pathname.includes("/read")) {
			return modeEnum.READ;
		} else if (pathname.includes("/listen")) {
			return modeEnum.LISTEN;
		} else if (pathname.includes("/prepare")) {
			return modeEnum.PREPARE;
		} else if (pathname.includes("/speak")) {
			return modeEnum.SPEAK;
		} else {
			return modeEnum.INSTRUCTIONS;
		}
	};

	const [mode, setMode] = useState(getModeFromUrl());
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);

	// Update mode when URL changes
	useEffect(() => {
		const newMode = getModeFromUrl();
		console.log("Part 3 URL changed, new mode:", newMode);
		setMode(newMode);

		// Set appropriate time for the mode
		if (newMode === modeEnum.PREPARE) {
			setTime(modeTimes.PREPARE * 1000);
		} else if (newMode === modeEnum.SPEAK) {
			setTime(modeTimes.SPEAK * 1000);
		}
	}, [location.pathname]);

	useEffect(() => {
		if (!testId) return;
		getSpeakingTaskThreeById(testId).then(setTestData);
	}, [testId]);

	return (
		<SpeakingPart3Presentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimes}
			time={time}
			setTime={setTime}
			testData={testData}
		/>
	);
};

export default SpeakingPart3Container;
