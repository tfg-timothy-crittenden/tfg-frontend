import Read from "@/components/Read/Read";
import Listen from "@/components/Listen/ListenPresentation";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import image from "@/assets/question_two_1.png";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import sharedStyles from "@/styles/speakingPartLayout.module.css";
import styles from "./SpeakingPart2.module.css";

const SpeakingPart2Presentation = ({
	testData,
	mode,
	modeEnum,
	time,
	modeTimeEnum,
	loading,
}) => {
	const renderContent = () => {
		if (loading || !testData) return <LoadingSpinner />;

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
							<em>
								Take notes during the reading and listening sections to help you
								organize your response.
							</em>
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
						audio={testData.listeningAudio}
						image={image}
						listeningScript={testData.listeningScript}
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
		<article className={sharedStyles.container}>
			<div className={sharedStyles.mode_selector_row}>
				<ToggleSwitch modeEnum={modeEnum} mode={mode} />
			</div>

			{renderContent()}
		</article>
	);
};

export default SpeakingPart2Presentation;
