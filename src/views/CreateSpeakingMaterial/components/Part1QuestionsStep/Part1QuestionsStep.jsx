import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import AudioDropzone from "@/views/CreateSpeakingMaterial/components/AudioDropzone/AudioDropzone";
import QuestionTabsNavigator from "@/views/CreateSpeakingMaterial/components/QuestionTabsNavigator/QuestionTabsNavigator";
import QuestionPanels from "@/views/CreateSpeakingMaterial/components/QuestionPanels/QuestionPanels";
import StepActionsRow from "@/views/CreateSpeakingMaterial/components/StepActionsRow/StepActionsRow";
import DrawEditor from "@/views/CreateSpeakingMaterial/components/ImageEditor/DrawEditor";
import { AlertCircle, AlignLeft, Mic } from "@/components/LucideMinimal";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";
import fieldStyles from "@/views/CreateSpeakingMaterial/components/SpeakingPart1AudioQuestionFields/SpeakingPart1AudioQuestionFields.module.css";

const QUESTION_COUNT = 7;
const EMPTY_HIGHLIGHT = { viewBox: [400, 400], ds: [] };

const Part1QuestionsStep = ({ controller }) => {
	const { form, state, context } = controller;
	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = form;
	const part1Image = watch("part1Image");
	const part1Questions = watch("part1Questions");
	const part1Highlights = watch("part1Highlights") || [];
	const currentQuestion = context.currentQuestion;
	const [visualPromptUrl, setVisualPromptUrl] = useState(null);

	useEffect(() => {
		if (part1Image instanceof File) {
			const objectUrl = URL.createObjectURL(part1Image);
			setVisualPromptUrl(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}

		setVisualPromptUrl(typeof part1Image === "string" ? part1Image : null);
		return undefined;
	}, [part1Image]);

	const questionCompletion = part1Questions.map(
		(question) =>
			question.transcript.trim().length > 0 && question.audio != null,
	);

	const createAudioRegistration = (idx) => {
		const name = `part1Questions.${idx}.audio`;

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

	const handleHighlightChange = (idx, data) => {
		setValue(`part1Highlights.${idx}`, data, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	return (
		<div className={styles.section}>
			<div className={styles.step_navigation_container}>
				<div className={styles.step_title_container}>
					<h2 className={styles.step_title}>Part 1 Questions</h2>
					<span className={styles.step_question_counter}>
						Question {currentQuestion + 1} of {QUESTION_COUNT}
					</span>
				</div>
				<QuestionTabsNavigator
					totalQuestions={QUESTION_COUNT}
					currentIndex={currentQuestion}
					onPrev={controller.previousQuestion}
					onNext={controller.nextQuestion}
					onSelect={controller.setCurrentQuestion}
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
					croppedImageUrl={visualPromptUrl}
					highlightData={part1Highlights[currentQuestion]}
					onHighlightChange={(data) =>
						handleHighlightChange(currentQuestion, data)
					}
					onClearDrawing={() =>
						handleHighlightChange(currentQuestion, EMPTY_HIGHLIGHT)
					}
					toolbarSlideKey={currentQuestion}
				/>
			</div>

			<QuestionPanels
				totalQuestions={QUESTION_COUNT}
				currentIndex={currentQuestion}
				renderPanel={(idx) => {
					const question = part1Questions[idx];
					const selectedAudioFile =
						question.audio instanceof File ? [question.audio] : [];
					const existingAudioUrl =
						typeof question.audio === "string" ? question.audio : "";
					const fieldErrors = errors?.part1Questions?.[idx];

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
										id={`part1-question-transcript-${idx}`}
										className={fieldStyles.textArea}
										placeholder="Enter the transcript for this question..."
										{...register(`part1Questions.${idx}.transcript`, {
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
										id={`part1-question-audio-${idx}`}
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

			<StepActionsRow
				leftLabel="Back"
				leftOnClick={controller.previousStep}
				rightLabel="Next: Part 2"
				rightOnClick={controller.nextStep}
				rightType="button"
				rightDisabled={!state.can({ type: "NEXT_STEP" })}
				styles={styles}
			/>
		</div>
	);
};

export default Part1QuestionsStep;
