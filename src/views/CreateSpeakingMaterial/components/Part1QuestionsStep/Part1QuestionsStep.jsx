import { ImageIcon } from "lucide-react";

import SpeakingPart1AudioQuestionFields from "@/views/CreateSpeakingMaterial/components/SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "@/views/CreateSpeakingMaterial/components/QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "@/views/CreateSpeakingMaterial/components/QuestionPanels/QuestionPanels";
import StepActionsRow from "@/views/CreateSpeakingMaterial/components/StepActionsRow/StepActionsRow";

import DrawEditor from "@/views/CreateSpeakingMaterial/components/ImageEditor/DrawEditor";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const Part1QuestionsStep = ({
	form,
	image,
	navigation,
	part1NextDisabled,
	onHighlightChange,
}) => {
	const {
		register,
		errors,
		setValue,
		questionCount,
		normalizedExistingMedia,
		selectedAudioFiles,
		hasExistingQuestionAudio,
		questionCompletion,
		highlightDataByQuestion,
	} = form;
	const { currentQuestion, setCurrentQuestion, goPrev, goNext, goToPart2 } =
		navigation;
	const { activeVisualPromptUrl } = image;

	const goBackToImageStep = () => {
		navigation.setStep(1);
	};

	return (
		<div className={styles.section}>
			<div className={styles.step_navigation_container}>
				<div className={styles.step_title_container}>
					<h2 className={styles.step_title}>Part 1 Questions</h2>
					<span className={styles.step_question_counter}>
						{/* Account for zero index on questions */}
						Question {currentQuestion + 1} of {questionCount}
					</span>
				</div>
				<QuestionTabsNavigator
					totalQuestions={questionCount}
					currentIndex={currentQuestion}
					onPrev={goPrev}
					onNext={goNext}
					onSelect={setCurrentQuestion}
					completion={questionCompletion}
					navAriaLabel="Questions"
					questionAriaLabelPrefix="question"
					styles={styles}
				/>
			</div>

			<div className={styles.step3_image_card}>
				<div className={styles.step3_image_card_header}>
					<ImageIcon size={16} strokeWidth={2} />
					<span>Visual Prompt</span>
				</div>
				<DrawEditor
					croppedImageUrl={activeVisualPromptUrl}
					highlightData={highlightDataByQuestion[currentQuestion]}
					onHighlightChange={(data) => onHighlightChange(currentQuestion, data)}
					onClearDrawing={() => {
						const next = [...highlightDataByQuestion];
						next[currentQuestion] = {
							viewBox: [400, 400],
							ds: [],
						};
						setValue("highlightDataByQuestion", next, {
							shouldDirty: true,
							shouldTouch: true,
						});
					}}
					toolbarSlideKey={currentQuestion}
				/>
			</div>

			<QuestionPanels
				totalQuestions={questionCount}
				currentIndex={currentQuestion}
				renderPanel={(idx) => (
					<SpeakingPart1AudioQuestionFields
						idx={idx}
						number={idx + 1}
						register={register}
						errors={errors}
						selectedAudioFile={selectedAudioFiles[idx]}
						existingAudioUrl={normalizedExistingMedia.questionAudioUrls[idx]}
						requireAudio={!hasExistingQuestionAudio(idx)}
					/>
				)}
				styles={styles}
			/>

			<StepActionsRow
				leftLabel="Back"
				leftOnClick={goBackToImageStep}
				rightLabel="Next: Part 2"
				rightOnClick={goToPart2}
				rightType="button"
				rightDisabled={part1NextDisabled}
				styles={styles}
			/>
		</div>
	);
};

export default Part1QuestionsStep;
