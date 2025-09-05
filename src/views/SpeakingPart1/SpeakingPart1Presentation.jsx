import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimeInformation from "@/components/TimeInformation/TimeInformation";
import SpeakingPart1QuestionSelector from "@/components/SpeakingPart1QuestionSelector/SpeakingPart1QuestionSelector";
import Instructions from "@/components/Instructions/Instructions";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import TimerWrapper from "@/components/TimerWrapper/TimerWrapper";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";
import sharedStyles from "@/styles/speakingPartLayout.module.css";
import styles from "./SpeakingPart1.module.css";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

const SpeakingPart1Presentation = ({
	question,
	mode,
	modeEnum,
	modeTimeEnum,
	time,
	currentTopic,
	topics,
	handleTopicChange,
	loading,
}) => {
	const renderContent = () => {
		switch (mode) {
			case modeEnum.INSTRUCTIONS:
				return (
					<Instructions partNumber="1">
						<p>
							In this independent speaking task, you will express your opinion
							on a familiar topic.
						</p>
						<p>
							You will have <strong>15 seconds</strong> to prepare your response
							and
							<strong>45 seconds</strong> to speak.
						</p>
						<p>
							Choose a topic from the selector below to get a random question,
							then speak about your personal experiences and opinions.
						</p>
						<p>
							<em>
								Be sure to explain your reasons clearly and provide specific
								examples to support your answer.
							</em>
						</p>
					</Instructions>
				);

			case modeEnum.PREPARE:
			case modeEnum.SPEAK:
				return (
					<>
						{loading ? (
							<LoadingSpinner />
						) : (
							<TestWrapper>
								<div>
									{question && (
										<>
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
										</>
									)}
								</div>
							</TestWrapper>
						)}
					</>
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

			<TimerWrapper>
				{/* Topic selector - only show for prepare/speak modes when topics are loaded */}
				{(mode === modeEnum.PREPARE || mode === modeEnum.SPEAK) &&
					topics.length > 0 && (
						<SpeakingPart1QuestionSelector
							topics={topics}
							currentTopic={currentTopic}
							handleTopicChange={handleTopicChange}
						/>
					)}
				<TimeInformation modeTimes={modeTimeEnum} />
				<CountdownContainer initialTime={time} />
			</TimerWrapper>
		</article>
	);
};

export default SpeakingPart1Presentation;
