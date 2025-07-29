import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import SpeakingPart3Presentation from "./SpeakingPart3Presentation";
import { getSpeakingTaskThreeById } from "@/api/tasks/tasksAPI";

const SpeakingPart3Container = () => {
	const { currentTest, setCurrentTest } = useOutletContext();

	const modeEnum = Object.freeze({
		READ: "READ",
		LISTEN: "LISTEN",
		PREPARE: "PREPARE",
		SPEAK: "SPEAK",
	});
	const modeTimes = {
		[modeEnum.PREPARE]: 30,
		[modeEnum.SPEAK]: 60,
	};

	const [mode, setMode] = useState(modeEnum.READ);
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);

	useEffect(() => {
		if (!currentTest?.id) return;
		getSpeakingTaskThreeById(currentTest.id).then(setTestData);
	}, [currentTest]);

	return (
		<SpeakingPart3Presentation
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

export default SpeakingPart3Container;
