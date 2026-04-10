import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { routeMatchers, buildRoute } from "@/routes/routeConfig";
import SpeakingPart1Presentation from "./SpeakingPart1Presentation";
import {
	getRandomSpeakingTaskOneByTopic,
	getSpeakingTaskOneTopics,
} from "@/api/tasks/tasksAPI";

const SpeakingPart1Container = () => {
	const location = useLocation();
	const { id: classroomId, sectionId } = useParams();

	const modeEnum = Object.freeze({
		INSTRUCTIONS: "INSTRUCTIONS",
		LISTEN: "LISTEN",
		SPEAK: "SPEAK",
	});

	const modeTimeEnum = {
		[modeEnum.LISTEN]: 15,
		[modeEnum.SPEAK]: 45,
	};

	const getModeFromUrl = () => {
		const currentMode = routeMatchers.getPartModeFromPath(location.pathname);
		switch (currentMode) {
			case "listen":
				return modeEnum.LISTEN;
			case "speak":
				return modeEnum.SPEAK;
			default:
				return modeEnum.INSTRUCTIONS;
		}
	};

	const [time, setTime] = useState(modeTimeEnum.PREPARE * 1000);
	const [mode, setMode] = useState(getModeFromUrl());
	const [question, setQuestion] = useState(null);
	const [topics, setTopics] = useState([]);
	const [currentTopic, setCurrentTopic] = useState("Education");
	const [loading, setLoading] = useState(false);

	// Update mode when URL changes
	useEffect(() => {
		const newMode = getModeFromUrl();
		setMode(newMode);

		// Set appropriate time for the mode
		if (newMode === modeEnum.LISTEN) {
			setTime(modeTimeEnum.LISTEN * 1000);
		} else if (newMode === modeEnum.SPEAK) {
			setTime(modeTimeEnum.SPEAK * 1000);
		}
	}, [location.pathname]);

	// Load topics
	useEffect(() => {
		setLoading(true);
		getSpeakingTaskOneTopics()
			.then(setTopics)
			.catch((err) => console.error("Error loading topics:", err))
			.finally(() => setLoading(false));
	}, []);

	// Load question when topic changes
	useEffect(() => {
		if (!currentTopic) return;

		const asyncGetRandomQuestion = async () => {
			setLoading(true);
			try {
				const newRandomQuestion =
					await getRandomSpeakingTaskOneByTopic(currentTopic);
				setQuestion(newRandomQuestion);
			} catch (error) {
				console.error("Error fetching random question:", error);
			} finally {
				setLoading(false);
			}
		};

		asyncGetRandomQuestion();
	}, [currentTopic]);

	const handleTopicChange = (topicName) => {
		setCurrentTopic(topicName);
	};

	const handleShuffleClick = async () => {
		try {
			const newRandomQuestion =
				await getRandomSpeakingTaskOneByTopic(currentTopic);
			setQuestion(newRandomQuestion);
		} catch (error) {
			console.error("Error fetching random question:", error);
		} finally {
			setLoading(false);
		}
	};

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
			topics={topics}
			handleTopicChange={handleTopicChange}
			handleShuffleClick={handleShuffleClick}
			loading={loading}
		/>
	);
};

export default SpeakingPart1Container;
