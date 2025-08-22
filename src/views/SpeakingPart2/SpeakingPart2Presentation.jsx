import Read from "@/components/Read/Read";
import Listen from "@/components/Listen/ListenPresentation";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";
import image from "@/assets/question_two_1.png";

import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";

import styles from "./SpeakingPart2.module.css";

const SpeakingPart2Presentation = ({
	testData,
	mode,
	modeEnum,
	time,
	modeTimeEnum,
}) => {
	const renderContent = () => {
		if (!testData) return <h2 className={styles.no_test}>Loading test...</h2>;

		switch (mode) {
			case modeEnum.INSTRUCTIONS:
				return (
					<Instructions partNumber="2">
						<p>
							In this integrated speaking task, you will read a short passage
							and listen to a conversation.
						</p>
						<p>
							You will then be asked to speak about the topic, combining
							information from both sources.
						</p>
						<p>
							You will have <strong>30 seconds</strong> to prepare your response
							and <strong>60 seconds</strong> to speak.
						</p>
						<p>
							Take notes while reading and listening as they will help you
							organize your response.
						</p>
					</Instructions>
				);

			case modeEnum.READ:
				return (
					<Read
						title={testData.readingTitle}
						body={testData.readingBody}
						author={testData.author}
					/>
				);

			case modeEnum.LISTEN:
				return (
					<Listen
						key={testData.listeningAudio}
						audio={testData.listeningAudio}
						image={image}
					/>
				);

			case modeEnum.PREPARE:
			case modeEnum.SPEAK:
				return (
					<PrepareSpeak
						question_audio={testData.questionAudio}
						question={testData.questionText}
						mode={mode}
						time={time}
						modeEnum={modeEnum}
						modeTimes={modeTimeEnum}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<article className={styles.container}>
			<ToggleSwitch modeEnum={modeEnum} mode={mode} />
			<div>{renderContent()}</div>
		</article>
	);
};

export default SpeakingPart2Presentation;
