import Read from "@/components/Read/Read";
import Part3ListenContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import Instructions from "@/components/Instructions/Instructions";
import image from "@/assets/male_professor.png";

const SpeakingPart3Presentation = ({
	mode,
	setMode,
	modeEnum,
	testData,
	time,
	setTime,
	modeTimeEnum,
}) => {
	if (!testData) return <p>Loading test...</p>;

	return (
		<>
			{mode === modeEnum.INSTRUCTIONS && (
				<Instructions partNumber="3">
					<p>
						In this integrated speaking task, you will read a passage and listen
						to a lecture on an academic topic.
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
							Focus on connecting the specific examples from the lecture to the
							general concepts from the reading.
						</em>
					</p>
				</Instructions>
			)}

			{mode === modeEnum.READ && (
				<Read
					title={testData.readingTitle}
					body={testData.readingBody}
					author={testData.author}
				/>
			)}

			{mode === modeEnum.LISTEN && (
				<Part3ListenContainer
					key={testData.listeningAudio}
					audio={testData.listeningAudio}
					image={image}
					voiceGender={testData.voiceGender}
				/>
			)}

			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) && (
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

export default SpeakingPart3Presentation;
