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
	_onRemoveExistingAudio,
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

	// Move audio remove logic to parent so it always runs, even if child unmounts
	// Only update the form state, not existingMedia, so RHF can track dirty state
	const handleAudioRemove = (idx) => {
		console.log("[PARENT] handleAudioRemove called for idx", idx);
		const audioPath = `questions.${idx}.audio`;
		setValue(audioPath, [], { shouldDirty: true, shouldTouch: true });
		if (typeof window !== "undefined" && window.__RHF_DEBUG_GETVALUES__) {
			console.log(
				`[PARENT] Form values after audio remove for idx ${idx}:`,
				window.__RHF_DEBUG_GETVALUES__(),
			);
		}
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
				renderPanel={(idx) => {
					// Always treat selectedAudioFiles[idx] as an array
					const audioField = selectedAudioFiles[idx] || [];
					const hasAudio = audioField.length > 0;
					const existingAudioUrl = hasAudio
						? ""
						: normalizedExistingMedia.questionAudioUrls[idx];
					// Use a key that changes when audio changes to force re-render
					const questionId = form?.fields?.[idx]?.id || idx;
					const audioKey = hasAudio
						? audioField
								.map((f) => (typeof f === "string" ? f : f?.name || "file"))
								.join("-")
						: existingAudioUrl || "noaudio";
					return (
						<SpeakingPart1AudioQuestionFields
							key={`${questionId}-${audioKey}`}
							idx={idx}
							number={idx + 1}
							register={register}
							errors={errors}
							selectedAudioFile={audioField}
							existingAudioUrl={existingAudioUrl}
							requireAudio={!hasExistingQuestionAudio(idx)}
							onRemove={() => handleAudioRemove(idx)}
						/>
					);
				}}
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
