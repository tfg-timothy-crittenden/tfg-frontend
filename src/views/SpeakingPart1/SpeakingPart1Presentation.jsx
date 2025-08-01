import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimeInformation from "@/components/TimeInformation/TimeInformation";

import styles from "./SpeakingPart1.module.css";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";

const SpeakingPart1Presentation = ({
	topics,
	question,
	mode,
	setMode,
	modeEnum,
	modeTimeEnum,
	time,
	setTime,
	handleTopicChange,
	currentTopic,
}) => {
	return (
		<>
			<ToggleSwitch
				mode={mode}
				setMode={setMode}
				modeEnum={modeEnum}
				setTime={setTime}
				modeTimeEnum={modeTimeEnum}
			/>

			<TestWrapper>
				{question && (
					<div>
						<p>{question.question}</p>
						{question.choices && (
							<ul className={styles.choices}>
								{question.choices.map((choice, index) => (
									<li key={index} className={styles.option}>
										{choice}
									</li>
								))}
							</ul>
						)}
					</div>
				)}

				<TimeInformation modeTimes={modeTimeEnum} />
			</TestWrapper>
			<hr />
			<TimerWrapper>
				<CountdownContainer initialTime={time} />
			</TimerWrapper>
		</>
	);
};

export default SpeakingPart1Presentation;
