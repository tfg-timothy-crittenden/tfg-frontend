import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import SpeakingPart1Presentation from "./SpeakingPart1Presentation";

const SpeakingPart1Container = () => {
	const { currentTopic, handleTopicChange, topics, topicData } =
		useOutletContext();

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
	const [questionKey, setQuestionKey] = useState(0);

	const handleTopicClick = (topic) => {
		handleTopicChange(topic); // Updates currentTopic in parent
		setQuestionKey(Date.now()); //
	};

	useEffect(() => {
		if (!currentTopic || !topicData[currentTopic]) return;

		const questions = topicData[currentTopic];
		if (!questions || questions.length === 0) {
			setQuestion({ question: "No questions available." });
			return;
		}

		// Randomly pick a new question on every key change
		const randomIndex = Math.floor(Math.random() * questions.length);
		setQuestion(questions[randomIndex]);
	}, [currentTopic, topicData, questionKey]);

	return (
		<SpeakingPart1Presentation
			topics={topics}
			question={question}
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimeEnum}
			time={time}
			setTime={setTime}
			handleTopicChange={handleTopicClick}
			currentTopic={currentTopic}
		/>
	);
};

export default SpeakingPart1Container;
