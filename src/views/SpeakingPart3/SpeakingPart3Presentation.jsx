import Read from "@/components/Read/Read";
import Part3ListenContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import image from "@/assets/male_professor.png";
import sharedStyles from "@/styles/speakingPartLayout.module.css";
import styles from "./SpeakingPart3.module.css";

const SpeakingPart3Presentation = ({
	mode,
	setMode,
	modeEnum,
	testData,
	time,
	setTime,
	modeTimeEnum,
}) => {
	const renderContent = () => {
		if (!testData) {
			return <LoadingSpinner />;
		}

		switch (mode) {
			case modeEnum.INSTRUCTIONS:
				return (
					<Instructions partNumber="3">
						<p>
							In this integrated speaking task, you will read a passage and
							listen to a lecture on an academic topic.
						</p>
						<p>
							You will then explain how the lecture examples relate to the
							concepts in the reading.
						</p>
						<p>
							You will have <strong>30 seconds</strong> to prepare your response
							and <strong>60 seconds</strong> to speak.
						</p>
						<p>
							<em>
								Focus on connecting the specific examples from the lecture to
								the general concepts from the reading.
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
					<Part3ListenContainer
						key={testData.listeningAudio}
						audio={testData.listeningAudio}
						image={image}
						voiceGender={testData.voiceGender}
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
				return <p>Invalid mode</p>;
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

export default SpeakingPart3Presentation;
