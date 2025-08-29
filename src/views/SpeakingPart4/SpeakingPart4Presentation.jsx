import ListenLectureContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import sharedStyles from "@/styles/speakingPartLayout.module.css";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

const SpeakingPart4Presentation = ({
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
					<Instructions partNumber="4">
						<p>
							In this integrated speaking task, you will listen to a lecture on
							an academic topic.
						</p>
						<p>
							You will then be asked to summarize the lecture using the points
							and examples provided.
						</p>
						<p>
							You will have <strong>30 seconds</strong> to prepare your response
							and <strong>60 seconds</strong> to speak.
						</p>
						<p>
							<em>
								Take detailed notes during the lecture as you will not see any
								reading material.
							</em>
						</p>
					</Instructions>
				);

			case modeEnum.LISTEN:
				return (
					<ListenLectureContainer
						key={testData.listeningAudio}
						audio={testData.listeningAudio}
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

export default SpeakingPart4Presentation;
