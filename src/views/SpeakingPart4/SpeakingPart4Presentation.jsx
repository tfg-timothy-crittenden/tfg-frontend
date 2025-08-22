import ListenLectureContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";

const SpeakingPart4Presentation = ({
	testData,
	mode,
	modeEnum,
	time,
	modeTimeEnum,
}) => {
	return (
		<>
			{mode === modeEnum.INSTRUCTIONS && (
				<Instructions partNumber="4">
					<p>
						In this integrated speaking task, you will listen to a lecture on an
						academic topic.
					</p>
					<p>
						You will then be asked to summarize the lecture using the points and
						examples provided.
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
			)}

			{mode === modeEnum.LISTEN && testData && (
				//Key needed here to force re-render of audio element when new test selected
				<ListenLectureContainer
					key={testData.listeningAudio}
					audio={testData.listeningAudio}
					voiceGender={testData.voiceGender}
				/>
			)}

			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) && testData && (
				<PrepareSpeak
					question_audio={testData.questionAudio}
					question={testData.questionText}
					mode={mode}
					time={time}
					modeEnum={modeEnum}
					modeTimes={modeTimeEnum}
				/>
			)}
		</>
	);
};

export default SpeakingPart4Presentation;
