import { MessageSquare } from "lucide-react";

import SpeakingPart1AudioQuestionFields from "@/views/CreateSpeakingMaterial/components/SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "@/views/CreateSpeakingMaterial/components/QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "@/views/CreateSpeakingMaterial/components/QuestionPanels/QuestionPanels";
import StepActionsRow from "@/views/CreateSpeakingMaterial/components/StepActionsRow/StepActionsRow";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const Part2QuestionsStep = ({
	form,
	navigation,
	_submitLabel,
	submitDisabled,
	isSubmitting,
	isPublishing,
	onPublish,
	canShowPublishButton,
	onHandlePublishSubmit,
	_saveChangesDisabled,
}) => {
	const {
		register,
		errors,
		handleSubmit,
		part2QuestionCount,
		part2QuestionCompletion,
		selectedPart2AudioFiles,
		normalizedExistingMedia,
		hasExistingPart2QuestionAudio,
		// canShowHeaderSaveChangesButton,
	} = form;
	const {
		currentPart2Question,
		setCurrentPart2Question,
		goPart2Prev,
		goPart2Next,
		goBackToPart1Questions,
	} = navigation;

	return (
		<div className={styles.section}>
			<div className={styles.step3_fields_card}>
				<div className={styles.fields_inner}>
					<label htmlFor="part2Title" className={styles.label}>
						<span className={styles.label_text_row}>
							<MessageSquare size={16} className={styles.label_icon} />
							Interview Topic
						</span>
						<input
							type="text"
							{...register("part2Title", { required: true })}
							id="part2Title"
							className={styles.text_input}
							aria-invalid={!!errors.part2Title}
						/>
						{errors.part2Title && (
							<span className={styles.error}>Interview topic is required</span>
						)}
					</label>
				</div>
			</div>

			<QuestionTabsNavigator
				totalQuestions={part2QuestionCount}
				currentIndex={currentPart2Question}
				onPrev={goPart2Prev}
				onNext={goPart2Next}
				onSelect={setCurrentPart2Question}
				completion={part2QuestionCompletion}
				navAriaLabel="Part 2 Questions"
				questionAriaLabelPrefix="part 2 question"
				styles={styles}
			/>

			<QuestionPanels
				totalQuestions={part2QuestionCount}
				currentIndex={currentPart2Question}
				renderPanel={(idx) => (
					<SpeakingPart1AudioQuestionFields
						idx={idx}
						number={idx + 1}
						register={register}
						errors={errors}
						selectedAudioFile={selectedPart2AudioFiles[idx]}
						existingAudioUrl={
							normalizedExistingMedia.part2QuestionAudioUrls[idx]
						}
						fieldPathPrefix="part2Questions"
						requireAudio={!hasExistingPart2QuestionAudio(idx)}
					/>
				)}
				styles={styles}
			/>

			{/* Only show navigation/back, not save changes button at bottom */}
			<div className={styles.step_actions_row}>
				<button
					type="button"
					onClick={goBackToPart1Questions}
					className={`${styles.back_button} ${styles.step_action_button}`}
				>
					Back to Part 1
				</button>
				<div className={styles.step_actions_right_group}>
					{canShowPublishButton && onPublish && (
						<button
							type="button"
							className={`${styles.publish_button} ${styles.step_action_button}`}
							disabled={submitDisabled || isPublishing || isSubmitting}
							onClick={handleSubmit(onHandlePublishSubmit)}
						>
							{isPublishing ? "Publishing…" : "Publish"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Part2QuestionsStep;
