import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { routeMatchers, buildRoute } from "@/routes/routeConfig";
import SpeakingPart1Presentation from "./SpeakingPart1Presentation";
import {
	getRandomSpeakingTaskOneByTopic,
	getSpeakingTaskOneTopics,
} from "@/api/tasks/tasksAPI";

const SpeakingPart1Container = ({ topicName }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { id: classroomId, testId } = useParams();

	// Use route matcher to get topic
	const currentTopic = topicName || "Education";

	const modeEnum = Object.freeze({
		INSTRUCTIONS: "INSTRUCTIONS",
		PREPARE: "PREPARE",
		SPEAK: "SPEAK",
	});

	const modeTimeEnum = {
		[modeEnum.PREPARE]: 15,
		[modeEnum.SPEAK]: 45,
	};

	// Determine mode based on URL using route matchers
	const getModeFromUrl = () => {
		const currentMode = routeMatchers.getPartModeFromPath(location.pathname);
		console.log("Classroom: current mode is: ", currentMode);
		switch (currentMode) {
			case "prepare":
				return modeEnum.PREPARE;
			case "speak":
				return modeEnum.SPEAK;
			default:
				return modeEnum.INSTRUCTIONS; // Default mode
		}
	};

	const [time, setTime] = useState(modeTimeEnum.PREPARE * 1000);
	const [mode, setMode] = useState(getModeFromUrl());
	const [question, setQuestion] = useState(null);
	const [topics, setTopics] = useState([]);

	// Update mode when URL changes
	useEffect(() => {
		const newMode = getModeFromUrl();
		console.log("URL changed, new mode:", newMode);
		setMode(newMode);

		// Set appropriate time for the mode
		if (newMode === modeEnum.PREPARE) {
			setTime(modeTimeEnum.PREPARE * 1000);
		} else if (newMode === modeEnum.SPEAK) {
			setTime(modeTimeEnum.SPEAK * 1000);
		}
	}, [location.pathname]);

	// Load topics
	useEffect(() => {
		getSpeakingTaskOneTopics()
			.then(setTopics)
			.catch((err) => console.error("Error loading topics:", err));
	}, []);

	// Load question when topic changes
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

	const handleTopicChange = (topicName) => {
		navigate(
			buildRoute.partTopic(classroomId, testId, mode.toLowerCase(), topicName)
		);
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
		/>
	);
};

export default SpeakingPart1Container;
