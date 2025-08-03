import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SpeakingPart4Presentation from "./SpeakingPart4Presentation";
import { getSpeakingTaskFourById } from "@/api/tasks/tasksAPI";

const SpeakingPart4Container = () => {
	const { testId } = useParams();

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
		if (!testId) return;
		getSpeakingTaskFourById(testId).then(setTestData);
	}, [testId]);

	return (
		<SpeakingPart4Presentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			currentTest={testData}
			time={time}
			setTime={setTime}
			modeTimes={modeTimes}
		/>
	);
};

export default SpeakingPart4Container;
