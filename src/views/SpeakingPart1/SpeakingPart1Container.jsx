import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SpeakingPart1Presentation from "./SpeakingPart1Presentation";
import { getRandomSpeakingTaskOneByTopic } from "@/api/tasks/tasksAPI";

const SpeakingPart1Container = () => {
	const location = useLocation();

	// Extract the wildcard portion of the path
	// Expected format: ".../part/1/topic/<topicName>"
	const pathSegments = location.pathname.split("/");
	const topicIndex = pathSegments.indexOf("topic");
	const currentTopic =
		topicIndex !== -1 ? decodeURIComponent(pathSegments[topicIndex + 1]) : null;

	const modeEnum = Object.freeze({
		PREPARE: "PREPARE",
		SPEAK: "SPEAK",
	});

	const modeTimeEnum = {
		[modeEnum.PREPARE]: 15,
		[modeEnum.SPEAK]: 45,
	};

	const [time, setTime] = useState(modeTimeEnum.PREPARE * 1000);
	const [mode, setMode] = useState(modeEnum.PREPARE);
	const [question, setQuestion] = useState(null);

	useEffect(() => {
		if (!currentTopic) return;

		const asyncGetRandomQuestion = async () => {
			try {
				const newRandomQuestion = await getRandomSpeakingTaskOneByTopic(
					currentTopic
				);
				setQuestion(newRandomQuestion);
			} catch (error) {
				console.error("Error fetching random question:", error);
			}
		};

		asyncGetRandomQuestion();
	}, [currentTopic]);

	return (
		<SpeakingPart1Presentation
			question={question}
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimeEnum}
			time={time}
			setTime={setTime}
			currentTopic={currentTopic}
		/>
	);
};

export default SpeakingPart1Container;
