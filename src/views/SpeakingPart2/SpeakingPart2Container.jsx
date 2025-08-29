import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import SpeakingPart2Presentation from "./SpeakingPart2Presentation";
import { getSpeakingTaskTwoById } from "@/api/tasks/tasksAPI";

const SpeakingPart2Container = () => {
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

	const getModeFromUrl = () => {
		const pathname = location.pathname;
		if (pathname.includes("/instructions")) return modeEnum.INSTRUCTIONS;
		if (pathname.includes("/read")) return modeEnum.READ;
		if (pathname.includes("/listen")) return modeEnum.LISTEN;
		if (pathname.includes("/prepare")) return modeEnum.PREPARE;
		if (pathname.includes("/speak")) return modeEnum.SPEAK;
		return modeEnum.INSTRUCTIONS;
	};

	const [mode, setMode] = useState(getModeFromUrl());
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const newMode = getModeFromUrl();
		setMode(newMode);
		if (newMode === modeEnum.PREPARE) setTime(modeTimes.PREPARE * 1000);
		else if (newMode === modeEnum.SPEAK) setTime(modeTimes.SPEAK * 1000);
	}, [location.pathname]);

	useEffect(() => {
		if (!testId) return;
		setLoading(true);
		getSpeakingTaskTwoById(testId)
			.then((data) => setTestData(data))
			.catch((err) => console.error("Error loading Part 2:", err))
			.finally(() => setLoading(false));
	}, [testId]);

	return (
		<SpeakingPart2Presentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimes}
			time={time}
			setTime={setTime}
			testData={testData}
			loading={loading}
		/>
	);
};

export default SpeakingPart2Container;
