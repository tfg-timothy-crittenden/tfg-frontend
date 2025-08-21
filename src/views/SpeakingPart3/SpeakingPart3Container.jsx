import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SpeakingPart3Presentation from "./SpeakingPart3Presentation";
import { getSpeakingTaskThreeById } from "@/api/tasks/tasksAPI";

const SpeakingPart3Container = () => {
	const { testId } = useParams();

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

	const [mode, setMode] = useState(modeEnum.INSTRUCTIONS);
	const [time, setTime] = useState(0);
	const [testData, setTestData] = useState(null);

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
