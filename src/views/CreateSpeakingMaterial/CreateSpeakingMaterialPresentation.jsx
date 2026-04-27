import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";

import SpeakingPart1AudioQuestionFields from "./SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "./QuestionTabsNavigator";
import QuestionPanels from "./QuestionPanels";
import SectionHeader from "./SectionHeader";
import StepActionsRow from "./StepActionsRow";

import CropEditor from "./ImageEditor/CropEditor";
import DrawEditor from "./ImageEditor/DrawEditor";
import ImageDropzone from "./ImageDropzone";

import styles from "./CreateSpeakingMaterial.module.css";

const FALLBACK_QUESTION_COUNT = 7;
const FALLBACK_PART2_QUESTION_COUNT = 4;

const makeDefaultQuestions = (count) =>
	Array.from({ length: count }, () => ({
		transcriptText: "",
		audio: [],
	}));

const CreateSpeakingMaterialPresentation = ({
	mode = "create",
	initialValues,
	initialHighlightDataByQuestion,
	initialPart2ConfigByQuestion,
	existingMedia,
	isLoading = false,
	submitLabel = "Submit",
	onSubmitForm,
}) => {
	// Resolve question counts from incoming data so create/edit modes share the
	// same presentation without hard-coding array sizes into the form setup.
	const questionCount =
		initialValues?.questions?.length || FALLBACK_QUESTION_COUNT;
	const part2QuestionCount =
		initialValues?.part2Questions?.length || FALLBACK_PART2_QUESTION_COUNT;

	// Build stable default values for react-hook-form. Edit mode injects fetched
	// values here, while create mode falls back to empty question arrays.
	const resolvedInitialValues = useMemo(
		() =>
			initialValues || {
				materialTitle: "",
				materialDescription: "",
				materialId: "",
				partTitle: "",
				part2Title: "",
				questions: makeDefaultQuestions(questionCount),
				part2Questions: makeDefaultQuestions(part2QuestionCount),
			},
		[initialValues, questionCount, part2QuestionCount],
	);

	// Form state
	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		shouldUnregister: false,
		defaultValues: resolvedInitialValues,
	});

	// Keep the form in sync when edit-mode data arrives asynchronously.
	useEffect(() => {
		reset(resolvedInitialValues);
	}, [resolvedInitialValues, reset]);

	// Field arrays
	const { fields } = useFieldArray({
		control,
		name: "questions",
	});
	const { fields: part2Fields } = useFieldArray({
		control,
		name: "part2Questions",
	});

	// Existing protected media is resolved by the container; this keeps the UI
	// logic simple and lets create/edit share the same rendering path.
	const normalizedExistingMedia = useMemo(
		() => ({
			partImageUrl: existingMedia?.partImageUrl || null,
			questionAudioUrls: Array.from(
				{ length: questionCount },
				(_, idx) => existingMedia?.questionAudioUrls?.[idx] || null,
			),
			part2QuestionAudioUrls: Array.from(
				{ length: part2QuestionCount },
				(_, idx) => existingMedia?.part2QuestionAudioUrls?.[idx] || null,
			),
		}),
		[existingMedia, questionCount, part2QuestionCount],
	);

	// Local UI state
	const [showImagePicker, setShowImagePicker] = useState(
		!normalizedExistingMedia.partImageUrl,
	);
	const [activePart, setActivePart] = useState(1);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [currentPart2Question, setCurrentPart2Question] = useState(0);
	const [step, setStep] = useState(0);

	useEffect(() => {
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
	}, [normalizedExistingMedia.partImageUrl]);

	// Media state
	const selectedImage = watch("image");
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");
	const [croppedImageUrl, setCroppedImageUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Derived field accessors
	const paddedFields = Array.from(
		{ length: questionCount },
		(_, idx) => fields[idx] || { id: `empty-${idx}` },
	);
	const selectedAudioFiles = paddedFields.map((_, idx) =>
		watch(`questions.${idx}.audio`),
	);
	const paddedPart2Fields = Array.from(
		{ length: part2QuestionCount },
		(_, idx) => part2Fields[idx] || { id: `part2-empty-${idx}` },
	);
	const selectedPart2AudioFiles = paddedPart2Fields.map((_, idx) =>
		watch(`part2Questions.${idx}.audio`),
	);

	// Navigation handlers
	const goPrev = () => setCurrentQuestion((q) => Math.max(0, q - 1));
	const goNext = () =>
		setCurrentQuestion((q) => Math.min(questionCount - 1, q + 1));
	const goPart2Prev = () => setCurrentPart2Question((q) => Math.max(0, q - 1));
	const goPart2Next = () =>
		setCurrentPart2Question((q) => Math.min(part2QuestionCount - 1, q + 1));
	const goToNextStep = () => setStep((s) => Math.min(2, s + 1));
	const goToPrevStep = () => setStep((s) => Math.max(0, s - 1));
	const goToStage = (targetStep) => {
		setActivePart(1);
		setStep(targetStep);
	};
	const goToPart2 = () => setActivePart(2);
	const goBackToPart1Questions = () => {
		setActivePart(1);
		setStep(2);
	};

	// Image actions
	const goBackToImageStep = () => {
		setCroppedImageUrl("");
		setStep(1);
	};

	const clearImage = () => {
		setValue("image", []);
		setCroppedImageUrl("");
		setImagePreviewUrl("");
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
	};

	// Validation helpers
	const materialInfoValid = () => {
		const title = watch("materialTitle");
		return title;
	};

	const hasExistingPartImage = !!normalizedExistingMedia.partImageUrl;
	const hasExistingQuestionAudio = (idx) =>
		!!normalizedExistingMedia.questionAudioUrls[idx];
	const hasExistingPart2QuestionAudio = (idx) =>
		!!normalizedExistingMedia.part2QuestionAudioUrls[idx];

	const questionCompletion = paddedFields.map((_, idx) => {
		const transcript = watch(`questions.${idx}.transcriptText`);
		const selectedAudio = selectedAudioFiles[idx]?.[0];
		const hasAudio = !!selectedAudio || hasExistingQuestionAudio(idx);
		return !!transcript?.trim() && hasAudio;
	});

	const part2QuestionCompletion = paddedPart2Fields.map((_, idx) => {
		const transcript = watch(`part2Questions.${idx}.transcriptText`);
		const selectedAudio = selectedPart2AudioFiles[idx]?.[0];
		const hasAudio = !!selectedAudio || hasExistingPart2QuestionAudio(idx);
		return !!transcript?.trim() && hasAudio;
	});

	const allQuestionsComplete = questionCompletion.every(Boolean);
	const allPart2QuestionsComplete = part2QuestionCompletion.every(Boolean);
	const partTitle = watch("partTitle");
	const part2Title = watch("part2Title");
	const hasPartImage = !!selectedImage?.[0] || hasExistingPartImage;
	const hasVisualPrompt =
		!!croppedImageUrl || (!selectedImage?.[0] && hasExistingPartImage);
	const part1NextDisabled =
		!materialInfoValid() ||
		!partTitle?.trim() ||
		!hasPartImage ||
		!hasVisualPrompt ||
		!allQuestionsComplete;
	const submitDisabled =
		part1NextDisabled || !part2Title?.trim() || !allPart2QuestionsComplete;

	// Generate a temporary preview URL for newly selected images so the cropper
	// always works with a browser-local source.
	useEffect(() => {
		if (!selectedImage?.[0]) {
			setImagePreviewUrl("");
			return;
		}
		const objectUrl = URL.createObjectURL(selectedImage[0]);
		setImagePreviewUrl(objectUrl);
		setShowImagePicker(true);
		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedImage]);

	// Reset any previous crop whenever the source image changes.
	useEffect(() => {
		setCroppedImageUrl("");
	}, [imagePreviewUrl]);

	// Clean up blob URLs created by the cropper preview.
	useEffect(() => {
		return () => {
			if (croppedImageUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(croppedImageUrl);
			}
		};
	}, [croppedImageUrl]);

	const [highlightDataByQuestion, setHighlightDataByQuestion] = useState(
		() => initialHighlightDataByQuestion || Array(questionCount).fill(null),
	);
	const [part2ConfigByQuestion] = useState(
		() => initialPart2ConfigByQuestion || Array(part2QuestionCount).fill({}),
	);

	// Keep per-question highlight state in sync with edit-mode hydration.
	useEffect(() => {
		setHighlightDataByQuestion(
			initialHighlightDataByQuestion || Array(questionCount).fill(null),
		);
	}, [initialHighlightDataByQuestion, questionCount]);

	// Question drawing/highlight handlers
	const handleHighlightChange = (idx, data) => {
		setHighlightDataByQuestion((prev) => {
			const next = [...prev];
			next[idx] = data;
			return next;
		});
	};

	const activeVisualPromptUrl =
		croppedImageUrl ||
		(!selectedImage?.[0] ? normalizedExistingMedia.partImageUrl : "");

	// Submit the cropped blob as a real File so the backend receives the actual
	// cropped image instead of the original uploaded source.
	const handleFormSubmit = async (data) => {
		if (!onSubmitForm) return;
		setIsSubmitting(true);
		try {
			const submissionData = { ...data };

			if (croppedImageUrl && croppedImageUrl.startsWith("blob:")) {
				const blob = await fetch(croppedImageUrl).then((res) => res.blob());
				const croppedFile = new File([blob], "cropped-image.png", {
					type: blob.type || "image/png",
				});
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(croppedFile);
				submissionData.image = Array.from(dataTransfer.files);
			}

			await onSubmitForm({
				data: submissionData,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});
			alert(mode === "edit" ? "Update successful!" : "Upload successful!");
		} catch (e) {
			alert("Upload error: " + (e?.response?.data?.message || e.message));
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return <div className={styles.listen_repeat_container}>Loading...</div>;
	}

	return (
		<>
			<form
				onSubmit={handleSubmit(handleFormSubmit)}
				className={styles.form}
				autoComplete="off"
			>
				<nav className={styles.breadcrumb} aria-label="Speaking form stages">
					<div className={styles.breadcrumb_stack}>
						<ol className={styles.breadcrumb_parts}>
							<li
								className={
									activePart === 1
										? styles.breadcrumb_current
										: styles.breadcrumb_done
								}
							>
								<button
									type="button"
									className={styles.breadcrumb_button}
									onClick={() => {
										setActivePart(1);
										goToStage(0);
									}}
								>
									Part 1
								</button>
							</li>
							<li
								className={
									activePart === 2
										? styles.breadcrumb_current
										: styles.breadcrumb_upcoming
								}
							>
								<button
									type="button"
									className={styles.breadcrumb_button}
									onClick={goToPart2}
								>
									Part 2
								</button>
							</li>
						</ol>
						{activePart === 1 ? (
							<ol className={styles.breadcrumb_steps}>
								<li
									className={
										step === 0
											? styles.breadcrumb_current
											: step > 0
												? styles.breadcrumb_done
												: undefined
									}
									aria-current={step === 0 ? "step" : undefined}
								>
									<button
										type="button"
										className={styles.breadcrumb_button}
										onClick={() => goToStage(0)}
									>
										Material Info
									</button>
								</li>
								<li
									className={
										step === 1
											? styles.breadcrumb_current
											: step > 1
												? styles.breadcrumb_done
												: undefined
									}
									aria-current={step === 1 ? "step" : undefined}
								>
									<button
										type="button"
										className={styles.breadcrumb_button}
										onClick={() => goToStage(1)}
									>
										Select Image
									</button>
								</li>
								<li
									className={step === 2 ? styles.breadcrumb_current : undefined}
									aria-current={step === 2 ? "step" : undefined}
								>
									<button
										type="button"
										className={styles.breadcrumb_button}
										onClick={() => goToStage(2)}
									>
										Questions
									</button>
								</li>
							</ol>
						) : (
							<ol className={styles.breadcrumb_steps}>
								<li className={styles.breadcrumb_current} aria-current="step">
									<button type="button" className={styles.breadcrumb_button}>
										Part 2 Questions
									</button>
								</li>
								<li className={styles.breadcrumb_upcoming}>
									<button
										type="button"
										className={styles.breadcrumb_button}
										onClick={goBackToPart1Questions}
									>
										Back to Part 1
									</button>
								</li>
							</ol>
						)}
					</div>
				</nav>
				<fieldset className={styles.listen_repeat_container}>
					<legend className={styles.legend}>
						{mode === "edit"
							? "Edit TOEFL Speaking Material"
							: "Create TOEFL Speaking Material"}
					</legend>
					{activePart === 1 && step === 0 && (
						<div className={styles.section}>
							<SectionHeader
								badge="1"
								title="Step 1: Material Info"
								subtitle="Enter a clear title and optional description for this test part. The Material ID must be unique."
								styles={styles}
							/>
							<div className={styles.step3_fields_card}>
								<div className={styles.fields_inner}>
									<label htmlFor="materialTitle" className={styles.label}>
										Material Title
										<input
											type="text"
											{...register("materialTitle", { required: true })}
											id="materialTitle"
											className={styles.text_input}
											aria-invalid={!!errors.materialTitle}
										/>
										{errors.materialTitle && (
											<span className={styles.error}>Title is required</span>
										)}
									</label>
									<label htmlFor="materialDescription" className={styles.label}>
										Material Description
										<input
											type="text"
											{...register("materialDescription")}
											id="materialDescription"
											className={styles.text_input}
										/>
									</label>
									<label htmlFor="materialId" className={styles.label}>
										Material ID
										<input
											type="text"
											{...register("materialId", { required: true })}
											id="materialId"
											className={styles.text_input}
											aria-invalid={!!errors.materialId}
										/>
										{errors.materialId && (
											<span className={styles.error}>ID is required</span>
										)}
									</label>
								</div>
							</div>
							<div className={styles.step_actions_right}>
								<button
									type="button"
									onClick={goToNextStep}
									disabled={!materialInfoValid()}
									className={`${styles.submit_button} ${styles.step_action_button}`}
								>
									Next
								</button>
							</div>
						</div>
					)}
					{activePart === 1 && step === 1 && (
						<div className={styles.section}>
							<SectionHeader
								badge="2"
								title="Step 2: Select & Crop Image"
								subtitle="Give this part a title, upload an image, and crop it to the area students should see."
								styles={styles}
							/>

							<div className={styles.step3_fields_card}>
								<div className={styles.fields_inner}>
									<label htmlFor="partTitle" className={styles.label}>
										Part Title
										<input
											{...register("partTitle", { required: true })}
											id="partTitle"
											className={styles.text_input}
											aria-invalid={!!errors.partTitle}
										/>
										{errors.partTitle && (
											<span className={styles.error}>
												Part title is required
											</span>
										)}
									</label>
								</div>
							</div>

							<div className={styles.step3_image_card}>
								{selectedImage?.[0] ? (
									croppedImageUrl ? (
										<>
											<img
												src={croppedImageUrl}
												alt="Confirmed crop preview"
												className={styles.preview_image}
											/>
											<div className={styles.image_action_row}>
												<button
													type="button"
													className={styles.back_button}
													onClick={() => setCroppedImageUrl("")}
												>
													Re-crop
												</button>
												<button
													type="button"
													className={styles.back_button}
													onClick={clearImage}
												>
													Change Image
												</button>
											</div>
										</>
									) : (
										<>
											<div className={styles.cropper_instruction}>
												Crop the image to the area students should see, then
												confirm.
											</div>
											<CropEditor
												imageUrl={imagePreviewUrl}
												onCropConfirmed={(url) => setCroppedImageUrl(url)}
											/>
											<button
												type="button"
												className={styles.back_button}
												onClick={clearImage}
											>
												Change Image
											</button>
										</>
									)
								) : hasExistingPartImage && !showImagePicker ? (
									<>
										<img
											src={normalizedExistingMedia.partImageUrl}
											alt="Current part image"
											className={styles.preview_image}
										/>
										<div className={styles.image_action_row}>
											<button
												type="button"
												className={styles.back_button}
												onClick={() => setShowImagePicker(true)}
											>
												Replace Image
											</button>
										</div>
									</>
								) : (
									<>
										<ImageDropzone
											id="image"
											registration={register("image", {
												required: !hasExistingPartImage,
											})}
											selectedFile={selectedImage}
											ariaInvalid={!!errors.image}
										/>
										{errors.image && (
											<span className={styles.error}>Image is required</span>
										)}
									</>
								)}
							</div>

							<StepActionsRow
								leftLabel="Back"
								leftOnClick={goToPrevStep}
								rightLabel="Next"
								rightOnClick={goToNextStep}
								rightDisabled={!hasVisualPrompt}
								rightType="button"
								styles={styles}
							/>
						</div>
					)}
					{activePart === 1 && step === 2 && (
						<div className={styles.section}>
							<SectionHeader
								badge="3"
								title="Step 3: Questions"
								subtitle="Draw highlights on the image and add audio and transcript for each question."
								styles={styles}
							/>

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
								<div key={currentQuestion} className={styles.image_slide_in}>
									<DrawEditor
										croppedImageUrl={activeVisualPromptUrl}
										highlightData={highlightDataByQuestion[currentQuestion]}
										onHighlightChange={(data) =>
											handleHighlightChange(currentQuestion, data)
										}
										onClearDrawing={() => {
											setHighlightDataByQuestion((prev) => {
												const next = [...prev];
												next[currentQuestion] = {
													viewBox: [400, 400],
													ds: [],
												};
												return next;
											});
										}}
									/>
								</div>
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
										existingAudioUrl={
											normalizedExistingMedia.questionAudioUrls[idx]
										}
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
					)}
					<div className={styles.section} hidden={activePart !== 2}>
						<SectionHeader
							badge="4"
							title="Part 2: Questions"
							subtitle="Add 4 audio questions and matching transcripts."
							styles={styles}
						/>

						<div className={styles.step3_fields_card}>
							<div className={styles.fields_inner}>
								<label htmlFor="part2Title" className={styles.label}>
									Part 2 Title
									<input
										type="text"
										{...register("part2Title", { required: true })}
										id="part2Title"
										className={styles.text_input}
										aria-invalid={!!errors.part2Title}
									/>
									{errors.part2Title && (
										<span className={styles.error}>
											Part 2 title is required
										</span>
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

						<StepActionsRow
							leftLabel="Back to Part 1"
							leftOnClick={goBackToPart1Questions}
							rightLabel={isSubmitting ? "Saving..." : submitLabel}
							rightType="submit"
							rightDisabled={submitDisabled || isSubmitting}
							styles={styles}
						/>
					</div>
				</fieldset>
				{fields.map((field, idx) => (
					<div key={field.id}>
						{errors?.questions?.[idx]?.audio && (
							<span className={styles.error}>Audio {idx + 1} is required</span>
						)}
					</div>
				))}
				{part2Fields.map((field, idx) => (
					<div key={field.id}>
						{errors?.part2Questions?.[idx]?.audio && (
							<span className={styles.error}>
								Part 2 audio {idx + 1} is required
							</span>
						)}
					</div>
				))}
			</form>
		</>
	);
};

export default CreateSpeakingMaterialPresentation;
