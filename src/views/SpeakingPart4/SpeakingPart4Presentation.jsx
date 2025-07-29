import SideNavBar from "@/components/SideNavBar/SideNavBar";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import ListenLectureContainer from "@/components/Listen/ListenLectureContainer";
import PrepareSpeak from "@/components/PrepareSpeak/PrepareSpeak";

const SpeakingPart4Presentation = ({
	tests,
	loadTest,
	currentTest,
	mode,
	setTime,
	setMode,
	modeEnum,
	time,
	modeTimes,
}) => {
	return (
		<>
			{/* <SideNavBar tests={tests} loadTest={loadTest} currentTest={currentTest} /> */}
			<ToggleSwitch
				mode={mode}
				setMode={setMode}
				modeEnum={modeEnum}
				setTime={setTime}
				modeTimeEnum={modeTimes}
			/>

			{mode === modeEnum.LISTEN && currentTest && (
				//Key needed here to force re-render of audio element when new test selected
				<ListenLectureContainer
					key={currentTest.listeningAudio}
					audio={currentTest.listeningAudio}
					voiceGender={currentTest.voiceGender}
				/>
			)}
			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) &&
				currentTest && (
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

export default SpeakingPart4Presentation;
