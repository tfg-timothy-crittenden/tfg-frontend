import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { uploadSpeakingSection } from "@/api/material/materialAPI";

import SpeakingPart1AudioQuestionFields from "./SpeakingPart1AudioQuestionFields";
import QuestionTabsNavigator from "./QuestionTabsNavigator";
import QuestionPanels from "./QuestionPanels";
import SectionHeader from "./SectionHeader";
import StepActionsRow from "./StepActionsRow";

import CropEditor from "./ImageEditor/CropEditor";
import DrawEditor from "./ImageEditor/DrawEditor";
import ImageDropzone from "./ImageDropzone";

import styles from "./CreateSpeakingMaterial.module.css";

const CreateSpeakingMaterial = () => {
	const questionCount = 7;
	const part2QuestionCount = 4;

	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		formState: { errors },
	} = useForm({
		shouldUnregister: false,
		defaultValues: {
			questions: Array.from({ length: questionCount }, () => ({
				transcriptText: "",
				audio: [],
			})),
			part2Questions: Array.from({ length: part2QuestionCount }, () => ({
				transcriptText: "",
				audio: [],
			})),
		},
	});
	const { fields } = useFieldArray({
		control,
		name: "questions",
	});
	const { fields: part2Fields } = useFieldArray({
		control,
		name: "part2Questions",
	});

	const selectedImage = watch("image");
	const selectedImageName = selectedImage?.[0]?.name || "No file selected";
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");
	// Cropped image url — produced by CropEditor, consumed by DrawEditor
	const [croppedImageUrl, setCroppedImageUrl] = useState("");

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

	const [activePart, setActivePart] = useState(1);

	// Question navigation state
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const goPrev = () => setCurrentQuestion((q) => Math.max(0, q - 1));
	const goNext = () =>
		setCurrentQuestion((q) => Math.min(questionCount - 1, q + 1));
	const [currentPart2Question, setCurrentPart2Question] = useState(0);
	const goPart2Prev = () => setCurrentPart2Question((q) => Math.max(0, q - 1));
	const goPart2Next = () =>
		setCurrentPart2Question((q) => Math.min(part2QuestionCount - 1, q + 1));

	// Progress dots logic
	// A question is "complete" if transcriptText and audio are present
	const questionCompletion = paddedFields.map((_, idx) => {
		const transcript = watch(`questions.${idx}.transcriptText`);
		const audio = selectedAudioFiles[idx]?.[0];
		return !!transcript?.trim() && !!audio;
	});
	const part2QuestionCompletion = paddedPart2Fields.map((_, idx) => {
		const transcript = watch(`part2Questions.${idx}.transcriptText`);
		const audio = selectedPart2AudioFiles[idx]?.[0];
		return !!transcript?.trim() && !!audio;
	});

	// Stepper state
	const [step, setStep] = useState(0); // 0: material info, 1: select+crop image, 2: draw+questions

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

	const goBackToImageStep = () => {
		setCroppedImageUrl("");
		setStep(1);
	};

	const clearImage = () => {
		setValue("image", []);
		setCroppedImageUrl("");
	};

	// Validation for step 1
	const materialInfoValid = () => {
		const title = watch("materialTitle");
		return title;
	};

	const allQuestionsComplete = questionCompletion.every(Boolean);
	const allPart2QuestionsComplete = part2QuestionCompletion.every(Boolean);
	const partTitle = watch("partTitle");
	const part2Title = watch("part2Title");
	const part1NextDisabled =
		!materialInfoValid() ||
		!partTitle?.trim() ||
		!selectedImage?.[0] ||
		!croppedImageUrl ||
		!allQuestionsComplete;
	const submitDisabled =
		part1NextDisabled || !part2Title?.trim() || !allPart2QuestionsComplete;

	useEffect(() => {
		if (!selectedImage?.[0]) {
			setImagePreviewUrl("");
			return;
		}
		const objectUrl = URL.createObjectURL(selectedImage[0]);
		setImagePreviewUrl(objectUrl);
		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedImage]);

	// Reset confirmed crop whenever the source image changes
	useEffect(() => {
		setCroppedImageUrl("");
	}, [imagePreviewUrl]);

	// Revoke old blob URLs produced by CropEditor to avoid leaks
	useEffect(() => {
		return () => {
			if (croppedImageUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(croppedImageUrl);
			}
		};
	}, [croppedImageUrl]);

	const onSubmit = async (data) => {
		const formData = new FormData();
		// Material fields
		formData.append("materialTitle", data.materialTitle);
		if (data.partTitle) formData.append("partTitle", data.partTitle);
		if (data.part2Title) formData.append("part2Title", data.part2Title);
		if (data.materialDescription)
			formData.append("materialDescription", data.materialDescription);
		if (data.materialId) formData.append("materialId", data.materialId);
		// Image (backend expects 'partImage')
		if (data.image && data.image[0]) {
			formData.append("partImage", data.image[0]);
		}
		// Questions (bracket notation to match the backend structure)
		for (let i = 0; i < (data.questions?.length || 0); i++) {
			formData.append(
				`questions[${i}].transcriptText`,
				data.questions[i].transcriptText,
			);
			if (data.questions[i].audio && data.questions[i].audio[0]) {
				formData.append(`questions[${i}].audio`, data.questions[i].audio[0]);
			}
			let config = {};
			if (highlightDataByQuestion[i]) {
				config.highlight_data = highlightDataByQuestion[i];
			}
			formData.append(`questions[${i}].config`, JSON.stringify(config));
		}
		for (let i = 0; i < (data.part2Questions?.length || 0); i++) {
			formData.append(
				`part2Questions[${i}].transcriptText`,
				data.part2Questions[i].transcriptText,
			);
			formData.append(`part2Questions[${i}].config`, JSON.stringify({}));
			if (data.part2Questions[i].audio && data.part2Questions[i].audio[0]) {
				formData.append(
					`part2Questions[${i}].audio`,
					data.part2Questions[i].audio[0],
				);
			}
		}
		try {
			if (!data.materialId) {
				alert("Material ID is required for upload.");
				return;
			}
			await uploadSpeakingSection(formData);
			alert("Upload successful!");
		} catch (e) {
			alert("Upload error: " + (e?.response?.data?.message || e.message));
		}
	};

	// Store highlight data per question
	const [highlightDataByQuestion, setHighlightDataByQuestion] = useState(() =>
		Array(questionCount).fill(null),
	);

	const handleHighlightChange = (idx, data) => {
		setHighlightDataByQuestion((prev) => {
			const next = [...prev];
			next[idx] = data;
			return next;
		});
	};

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
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
						Create TOEFL Speaking Material
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

							{/* Part Title field */}
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

							{/* Image upload + crop card */}
							<div className={styles.step3_image_card}>
								{!selectedImage?.[0] ? (
									<>
										<ImageDropzone
											id="image"
											registration={register("image", { required: true })}
											selectedFile={selectedImage}
											ariaInvalid={!!errors.image}
										/>
										{errors.image && (
											<span className={styles.error}>Image is required</span>
										)}
									</>
								) : croppedImageUrl ? (
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
								)}
							</div>

							<StepActionsRow
								leftLabel="Back"
								leftOnClick={goToPrevStep}
								rightLabel="Next"
								rightOnClick={goToNextStep}
								rightDisabled={!croppedImageUrl}
								rightType="button"
								styles={styles}
							/>
						</div>
					)}
					{activePart === 1 && step === 2 && (
						<div className={styles.section}>
							{/* Step header */}
							<SectionHeader
								badge="3"
								title="Step 3: Questions"
								subtitle="Draw highlights on the image and add audio and transcript for each question."
								styles={styles}
							/>

							{/* Question tabs card */}
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

							{/* Visual Prompt card */}
							<div className={styles.step3_image_card}>
								<div className={styles.step3_image_card_header}>
									<ImageIcon size={16} strokeWidth={2} />
									<span>Visual Prompt</span>
								</div>
								<div key={currentQuestion} className={styles.image_slide_in}>
									<DrawEditor
										croppedImageUrl={croppedImageUrl}
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

							{/* Question fields card */}
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
									fieldPathPrefix="part2Questions"
								/>
							)}
							styles={styles}
						/>

						<StepActionsRow
							leftLabel="Back to Part 1"
							leftOnClick={goBackToPart1Questions}
							rightLabel="Submit"
							rightType="submit"
							rightDisabled={submitDisabled}
							styles={styles}
						/>
					</div>
				</fieldset>
				{/* Inline validation for audio fields */}
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

export default CreateSpeakingMaterial;
