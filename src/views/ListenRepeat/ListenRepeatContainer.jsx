import useListenSpeakTask from "@/hooks/useListenSpeakTask";
import ListenRepeatPresentation from "./ListenRepeatPresentation";

const ListenRepeatContainer = () => {
	const {
		mode,
		setMode,
		time,
		setTime,
		testData,
		loading,
		sharedImageUrl,
		questionAudioUrl,
		modeEnum,
		modeTimes,
	} = useListenSpeakTask();

	return (
		<ListenRepeatPresentation
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			modeTimeEnum={modeTimes}
			time={time}
			setTime={setTime}
			testData={testData}
			sharedImageUrl={sharedImageUrl}
			questionAudioUrl={questionAudioUrl}
			loading={loading}
		/>
	);
};

export default ListenRepeatContainer;
