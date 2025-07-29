import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import SpeakingPart4Presentation from "./SpeakingPart4Presentation";
import { getSpeakingTaskFourById } from "@/api/tasks/tasksAPI";

const SpeakingPart4Container = () => {
	const { currentTest, setCurrentTest } = useOutletContext();

	const modeEnum = Object.freeze({
		LISTEN: "LISTEN",
		PREPARE: "PREPARE",
		SPEAK: "SPEAK",
	});

	const modeTimes = {
		[modeEnum.PREPARE]: 30,
		[modeEnum.SPEAK]: 60,
	};

	const [mode, setMode] = useState(modeEnum.LISTEN);
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);

	useEffect(() => {
		if (!currentTest?.id) return;
		getSpeakingTaskFourById(currentTest.id).then(setTestData);
	}, [currentTest]);

	return (
		<SpeakingPart4Presentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			currentTest={testData}
			setCurrentTest={setCurrentTest}
			time={time}
			setTime={setTime}
			modeTimes={modeTimes}
		/>
	);
};

export default SpeakingPart4Container;
