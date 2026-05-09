import { MessageSquare } from "lucide-react";

import SpeakingPart1AudioQuestionFields from "../SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "../QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "../QuestionPanels/QuestionPanels";
import StepActionsRow from "../StepActionsRow/StepActionsRow";

import styles from "../../styles/CreateSpeakingMaterial.module.css";

const Part2QuestionsStep = ({
	form,
	navigation,
	submitLabel,
	submitDisabled,
	isSubmitting,
	isPublishing,
	onPublish,
	canShowPublishButton,
	onHandlePublishSubmit,
	saveChangesDisabled,
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

			{onPublish ? (
				<div className={styles.step_actions_row}>
					<button
						type="button"
						onClick={goBackToPart1Questions}
						className={`${styles.back_button} ${styles.step_action_button}`}
					>
						Back to Part 1
					</button>
					<div className={styles.step_actions_right_group}>
						<button
							type="submit"
							className={`${styles.submit_button} ${styles.step_action_button}`}
							disabled={submitDisabled || isSubmitting || saveChangesDisabled}
						>
							{isSubmitting ? "Saving..." : submitLabel}
						</button>
						{canShowPublishButton && (
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
			) : (
				<StepActionsRow
					leftLabel="Back to Part 1"
					leftOnClick={goBackToPart1Questions}
					rightLabel={isSubmitting ? "Saving..." : submitLabel}
					rightType="submit"
					rightDisabled={submitDisabled || isSubmitting || saveChangesDisabled}
					styles={styles}
				/>
			)}
		</div>
	);
};

export default Part2QuestionsStep;
