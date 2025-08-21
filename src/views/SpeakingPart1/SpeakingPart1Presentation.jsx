import ModeNavigationWrapper from "@/components/ModeNavigationWrapper/ModeNavigationWrapper";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimeInformation from "@/components/TimeInformation/TimeInformation";
import SpeakingPart1QuestionSelector from "@/components/SpeakingPart1QuestionSelector/SpeakingPart1QuestionSelector";
import Instructions from "@/components/Instructions/Instructions";

import styles from "./SpeakingPart1.module.css";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";

const SpeakingPart1Presentation = ({
	question,
	mode,
	setMode,
	modeEnum,
	modeTimeEnum,
	time,
	setTime,
	currentTopic,
	topics,
	handleTopicChange,
}) => {
	return (
		<ModeNavigationWrapper
			mode={mode}
			setMode={setMode}
			modeEnum={modeEnum}
			setTime={setTime}
			modeTimeEnum={modeTimeEnum}
		>
			{mode === modeEnum.INSTRUCTIONS && (
				<Instructions partNumber="1">
					<p>
						In this task, you will be asked to speak about a familiar topic.
					</p>
					<p>
						You will have <strong>15 seconds</strong> to prepare your response
						and <strong>45 seconds</strong> to speak.
					</p>
					<p>
						You may take notes during the preparation time and use them while
						speaking.
					</p>
					<p>
						Choose from the topics below to practice different question types.
					</p>
				</Instructions>
			)}

			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) && (
				<>
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
			)}

			{/* Topic selector below the test content */}
			{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) &&
				topics.length > 0 && (
					<SpeakingPart1QuestionSelector
						topics={topics}
						currentTopic={currentTopic}
						handleTopicChange={handleTopicChange}
					/>
				)}
		</ModeNavigationWrapper>
	);
};

export default SpeakingPart1Presentation;
