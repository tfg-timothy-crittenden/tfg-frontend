import { ImageIcon } from "lucide-react";

import SpeakingPart1AudioQuestionFields from "../SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "../QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "../QuestionPanels/QuestionPanels";
import StepActionsRow from "../StepActionsRow/StepActionsRow";

import DrawEditor from "../ImageEditor/DrawEditor";

import styles from "../../styles/CreateSpeakingMaterial.module.css";

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
