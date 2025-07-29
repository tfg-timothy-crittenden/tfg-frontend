import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import Read from "@/components/Read/Read";
import Part3ListenContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";
import image from "@/assets/male_professor.png";

const SpeakingPart3Presentation = ({
	mode,
	setMode,
	modeEnum,
	currentTest,
	time,
	setTime,
	modeTimes,
}) => {
	if (!currentTest) return <p>Loading test...</p>;

	return (
		<>
			<ToggleSwitch
				mode={mode}
				setMode={setMode}
				modeEnum={modeEnum}
				setTime={setTime}
				modeTimeEnum={modeTimes}
			/>

			{mode === modeEnum.READ && (
				<Read
					title={currentTest.readingTitle}
					body={currentTest.readingBody}
					author={currentTest.author}
				/>
			)}

			{mode === modeEnum.LISTEN && (
				<Part3ListenContainer
					key={currentTest.listeningAudio}
					audio={currentTest.listeningAudio}
					image={image}
					voiceGender={currentTest.voiceGender}
				/>
			)}

			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) && (
				<PrepareSpeak
					question_audio={currentTest.questionAudio}
					question={currentTest.questionText}
					mode={mode}
					time={time}
					modeEnum={modeEnum}
					modeTimes={modeTimes}
				/>
			)}
		</>
	);
};

export default SpeakingPart3Presentation;
