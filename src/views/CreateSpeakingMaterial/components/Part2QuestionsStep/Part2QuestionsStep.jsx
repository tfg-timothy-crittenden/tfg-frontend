import { MessageSquare } from "lucide-react";

import AudioDropzone from "@/views/CreateSpeakingMaterial/components/AudioDropzone/AudioDropzone";
import QuestionTabsNavigator from "@/views/CreateSpeakingMaterial/components/QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "@/views/CreateSpeakingMaterial/components/QuestionPanels/QuestionPanels";
import { AlertCircle, AlignLeft, Mic } from "@/components/LucideMinimal";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";
import fieldStyles from "@/views/CreateSpeakingMaterial/components/SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields.module.css";

const PART2_QUESTION_COUNT = 4;

const Part2QuestionsStep = ({ controller }) => {
	const { form, context } = controller;

	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const part2Questions = watch("part2Questions");

	const currentPart2Question = context.currentPart2Question;

	const questionCompletion = part2Questions.map(
		(question) =>
			question.transcript.trim().length > 0 && question.audio != null,
	);

	const createAudioRegistration = (idx) => {
		const name = `part2Questions.${idx}.audio`;

		return {
			name,
			ref: () => {},
			onBlur: () => {},
			onChange: (event) => {
				const files = event?.target?.value || [];
				setValue(name, files[0] ?? null, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});
			},
		};
	};

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
				totalQuestions={PART2_QUESTION_COUNT}
				currentIndex={currentPart2Question}
				onPrev={controller.previousPart2Question}
				onNext={controller.nextPart2Question}
				onSelect={controller.setCurrentPart2Question}
				completion={questionCompletion}
				navAriaLabel="Part 2 Questions"
				questionAriaLabelPrefix="part 2 question"
				styles={styles}
			/>

			<QuestionPanels
				totalQuestions={PART2_QUESTION_COUNT}
				currentIndex={currentPart2Question}
				renderPanel={(idx) => {
					const question = part2Questions[idx];
					const selectedAudioFile =
						question.audio instanceof File ? [question.audio] : [];
					const existingAudioUrl =
						typeof question.audio === "string" ? question.audio : "";
					const fieldErrors = errors?.part2Questions?.[idx];

					return (
						<div className={fieldStyles.questionField}>
							<div className={fieldStyles.fieldRow}>
								<div className={fieldStyles.fieldLabelCol}>
									<AlignLeft
										size={18}
										strokeWidth={2}
										className={fieldStyles.fieldIcon}
									/>
									<span className={fieldStyles.fieldLabel}>
										Transcript Text
									</span>
								</div>
								<div className={fieldStyles.fieldContentCol}>
									<textarea
										id={`part2-question-transcript-${idx}`}
										className={fieldStyles.textArea}
										placeholder="Enter the transcript for this question..."
										{...register(`part2Questions.${idx}.transcript`, {
											required: true,
										})}
									/>
									{fieldErrors?.transcript && (
										<span className={fieldStyles.error}>
											<AlertCircle size={14} strokeWidth={2.2} /> Transcript is
											required
										</span>
									)}
								</div>
							</div>
							<div className={fieldStyles.fieldDivider} />
							<div className={fieldStyles.fieldRow}>
								<div className={fieldStyles.fieldLabelCol}>
									<Mic
										size={18}
										strokeWidth={2}
										className={fieldStyles.fieldIcon}
									/>
									<span className={fieldStyles.fieldLabel}>Audio</span>
								</div>
								<div className={fieldStyles.fieldContentCol}>
									<AudioDropzone
										id={`part2-question-audio-${idx}`}
										registration={createAudioRegistration(idx)}
										selectedFile={selectedAudioFile}
										existingAudioUrl={existingAudioUrl}
										ariaInvalid={!!fieldErrors?.audio}
										showLabel={false}
									/>
									{fieldErrors?.audio && (
										<span className={fieldStyles.error}>
											<AlertCircle size={14} strokeWidth={2.2} /> Audio{" "}
											{idx + 1} is required
										</span>
									)}
								</div>
							</div>
						</div>
					);
				}}
				styles={styles}
			/>

			<div className={styles.step_actions_row}>
				<button
					type="button"
					onClick={controller.previousStep}
					className={`${styles.back_button} ${styles.step_action_button}`}
				>
					Back to Part 1
				</button>
			</div>
		</div>
	);
};

export default Part2QuestionsStep;
