import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { uploadPart1Speaking } from "@/api/material/materialAPI";

import SpeakingPart1AudioQuestionFields from "./SpeakingPart1AudioQuestionFields";

import CropEditor from "./ImageEditor/CropEditor";
import DrawEditor from "./ImageEditor/DrawEditor";

import styles from "./CreateSpeakingMaterial.module.css";

const CreateSpeakingMaterial = () => {
	const questionCount = 7;
	const part2QuestionCount = 4;

	const {
		register,
		handleSubmit,
		watch,
		control,
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

	// Validation for step 1
	const materialInfoValid = () => {
		const title = watch("materialTitle");
		return title;
	};

	const allQuestionsComplete = questionCompletion.every(Boolean);
	const allPart2QuestionsComplete = part2QuestionCompletion.every(Boolean);
	const partTitle = watch("partTitle");
	const part1NextDisabled =
		!materialInfoValid() ||
		!partTitle?.trim() ||
		!selectedImage?.[0] ||
		!croppedImageUrl ||
		!allQuestionsComplete;
	const submitDisabled = part1NextDisabled || !allPart2QuestionsComplete;

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
			await uploadPart1Speaking(formData);
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
							<h2>Step 1: Material Info</h2>
							<p className={styles.helper}>
								Enter a clear title and optional description for this test part.
								The Material ID must be unique.
							</p>
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
							<button
								type="button"
								onClick={goToNextStep}
								disabled={!materialInfoValid()}
								className={styles.next_button}
							>
								Next
							</button>
						</div>
					)}
					{activePart === 1 && step === 1 && (
						<div className={styles.section}>
							<h2>Step 2: Select & Crop Image</h2>
							<p className={styles.helper}>
								Give this part a title, upload an image, and crop it to the area
								students should see.
							</p>
							<label htmlFor="partTitle" className={styles.label}>
								Part Title
								<input
									{...register("partTitle", { required: true })}
									id="partTitle"
									className={styles.text_input}
									aria-invalid={!!errors.partTitle}
								/>
								{errors.partTitle && (
									<span className={styles.error}>Part title is required</span>
								)}
							</label>
							{/* Dropzone for image upload */}
							<div className={styles.dropzone_wrapper}>
								<label htmlFor="image" className={styles.dropzone_label}>
									<span className={styles.dropzone_text}>
										{selectedImage
											? selectedImageName
											: "Drag & drop or click to select an image"}
									</span>
									<input
										type="file"
										{...register("image", { required: true })}
										id="image"
										className={styles.file_input}
										accept="image/*"
									/>
								</label>
								{errors.image && (
									<span className={styles.error}>Image is required</span>
								)}
							</div>
							{/* Image cropper */}
							<div className={styles.image_section}>
								{selectedImage ? (
									<>
										{croppedImageUrl ? (
											<img
												src={croppedImageUrl}
												alt="Confirmed crop preview"
												className={styles.preview_image}
											/>
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
											</>
										)}
									</>
								) : null}
								<button
									type="button"
									onClick={goToPrevStep}
									className={styles.back_button}
								>
									Back
								</button>
								<button
									type="button"
									onClick={goToNextStep}
									disabled={!croppedImageUrl}
									className={styles.next_button}
								>
									Next
								</button>
							</div>
						</div>
					)}
					{activePart === 1 && step === 2 && (
						<div className={styles.section}>
							{/* Step header */}
							<div className={styles.step3_header}>
								<div className={styles.step3_badge}>3</div>
								<div>
									<h2 className={styles.step3_title}>Step 3: Questions</h2>
									<p className={styles.step3_subtitle}>
										Draw highlights on the image and add audio and transcript
										for each question.
									</p>
								</div>
							</div>

							{/* Question tabs card */}
							<div className={styles.step3_tabs_card}>
								<div className={styles.questions_selector_row}>
									<button
										type="button"
										aria-label="Previous question"
										onClick={goPrev}
										disabled={currentQuestion === 0}
										className={
											styles.chevron_button_left +
											(currentQuestion === 0
												? " " + styles.chevron_button_disabled
												: "")
										}
									>
										<ChevronLeft size={40} strokeWidth={2.25} />
									</button>
									<nav className={styles.questions_nav} aria-label="Questions">
										{paddedFields.map((_, idx) => (
											<button
												key={idx}
												type="button"
												className={
													styles.question_tab +
													(idx === currentQuestion
														? " " + styles.active_tab
														: "") +
													(questionCompletion[idx]
														? " " + styles.completed_tab
														: "")
												}
												onClick={() => setCurrentQuestion(idx)}
												aria-current={
													idx === currentQuestion ? "step" : undefined
												}
												aria-label={`Go to question ${idx + 1}`}
											>
												<span className={styles.question_tab_label}>
													Q{idx + 1}
												</span>
												<span className={styles.question_tab_circle} />
											</button>
										))}
									</nav>
									<button
										type="button"
										aria-label="Next question"
										onClick={goNext}
										disabled={currentQuestion === questionCount - 1}
										className={
											styles.chevron_button_right +
											(currentQuestion === questionCount - 1
												? " " + styles.chevron_button_disabled
												: "")
										}
									>
										<ChevronRight size={40} strokeWidth={2.25} />
									</button>
								</div>
							</div>

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
							<div className={styles.step3_fields_card}>
								<div className={styles.question_slide_area}>
									{paddedFields.map((_, idx) => (
										<div
											key={idx}
											className={`${styles.question_panel}${idx === currentQuestion ? ` ${styles.question_panel_active}` : ""}`}
											aria-hidden={idx !== currentQuestion}
										>
											<SpeakingPart1AudioQuestionFields
												idx={idx}
												number={idx + 1}
												register={register}
												errors={errors}
												selectedAudioFile={selectedAudioFiles[idx]}
											/>
										</div>
									))}
								</div>
							</div>

							<div className={styles.step_actions_row}>
								<button
									type="button"
									onClick={goBackToImageStep}
									className={`${styles.back_button} ${styles.step_action_button}`}
								>
									Back
								</button>
								<button
									type="button"
									onClick={goToPart2}
									className={`${styles.submit_button} ${styles.step_action_button}`}
									disabled={part1NextDisabled}
								>
									Next: Part 2
								</button>
							</div>
						</div>
					)}
					<div className={styles.section} hidden={activePart !== 2}>
						<div className={styles.step3_header}>
							<div className={styles.step3_badge}>4</div>
							<div>
								<h2 className={styles.step3_title}>Part 2: Questions</h2>
								<p className={styles.step3_subtitle}>
									Add 4 audio questions and matching transcripts.
								</p>
							</div>
						</div>

						<div className={styles.step3_tabs_card}>
							<div className={styles.questions_selector_row}>
								<button
									type="button"
									aria-label="Previous part 2 question"
									onClick={goPart2Prev}
									disabled={currentPart2Question === 0}
									className={
										styles.chevron_button_left +
										(currentPart2Question === 0
											? " " + styles.chevron_button_disabled
											: "")
									}
								>
									<ChevronLeft size={40} strokeWidth={2.25} />
								</button>
								<nav
									className={styles.questions_nav}
									aria-label="Part 2 Questions"
								>
									{paddedPart2Fields.map((_, idx) => (
										<button
											key={idx}
											type="button"
											className={
												styles.question_tab +
												(idx === currentPart2Question
													? " " + styles.active_tab
													: "") +
												(part2QuestionCompletion[idx]
													? " " + styles.completed_tab
													: "")
											}
											onClick={() => setCurrentPart2Question(idx)}
											aria-current={
												idx === currentPart2Question ? "step" : undefined
											}
											aria-label={`Go to part 2 question ${idx + 1}`}
										>
											<span className={styles.question_tab_label}>
												Q{idx + 1}
											</span>
											<span className={styles.question_tab_circle} />
										</button>
									))}
								</nav>
								<button
									type="button"
									aria-label="Next part 2 question"
									onClick={goPart2Next}
									disabled={currentPart2Question === part2QuestionCount - 1}
									className={
										styles.chevron_button_right +
										(currentPart2Question === part2QuestionCount - 1
											? " " + styles.chevron_button_disabled
											: "")
									}
								>
									<ChevronRight size={40} strokeWidth={2.25} />
								</button>
							</div>
						</div>

						<div className={styles.step3_fields_card}>
							<div className={styles.question_slide_area}>
								{paddedPart2Fields.map((_, idx) => (
									<div
										key={idx}
										className={`${styles.question_panel}${idx === currentPart2Question ? ` ${styles.question_panel_active}` : ""}`}
										aria-hidden={idx !== currentPart2Question}
									>
										<SpeakingPart1AudioQuestionFields
											idx={idx}
											number={idx + 1}
											register={register}
											errors={errors}
											selectedAudioFile={selectedPart2AudioFiles[idx]}
											fieldPathPrefix="part2Questions"
										/>
									</div>
								))}
							</div>
						</div>

						<div className={styles.step_actions_row}>
							<button
								type="button"
								onClick={goBackToPart1Questions}
								className={`${styles.back_button} ${styles.step_action_button}`}
							>
								Back to Part 1
							</button>
							<button
								type="submit"
								className={`${styles.submit_button} ${styles.step_action_button}`}
								disabled={submitDisabled}
							>
								Submit
							</button>
						</div>
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
