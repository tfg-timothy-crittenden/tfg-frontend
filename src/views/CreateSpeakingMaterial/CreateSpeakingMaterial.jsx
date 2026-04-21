import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { uploadPart1Speaking } from "@/api/material/materialAPI";

import { Check, Circle } from "../../components/LucideMinimal";

import SpeakingPart1AudioQuestionFields from "./SpeakingPart1AudioQuestionFields";

import ImageEditor from "./ImageEditor";

import styles from "./CreateSpeakingMaterial.module.css";

const CreateSpeakingMaterial = () => {
	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
	} = useForm();
	const { fields } = useFieldArray({
		control,
		name: "questions",
	});

	const selectedImage = watch("image");
	const selectedImageName = selectedImage?.[0]?.name || "No file selected";
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");

	const questionCount = 7;
	const paddedFields = Array.from(
		{ length: questionCount },
		(_, idx) => fields[idx] || { id: `empty-${idx}` },
	);
	const selectedAudioFiles = paddedFields.map((_, idx) =>
		watch(`questions.${idx}.audio`),
	);
	const selectedAudioNames = selectedAudioFiles.map(
		(audio) => audio?.[0]?.name || "No file selected",
	);

	// Question navigation state
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const goPrev = () => setCurrentQuestion((q) => Math.max(0, q - 1));
	const goNext = () =>
		setCurrentQuestion((q) => Math.min(questionCount - 1, q + 1));

	// Progress dots logic
	// A question is "complete" if transcriptText and audio are present
	const questionCompletion = paddedFields.map((_, idx) => {
		const transcript = watch(`questions.${idx}.transcriptText`);
		const audio = selectedAudioFiles[idx]?.[0];
		return transcript && audio;
	});

	// Stepper state
	const [step, setStep] = useState(0); // 0: material info, 1: image+questions

	const goToNextStep = () => setStep((s) => Math.min(1, s + 1));
	const goToPrevStep = () => setStep((s) => Math.max(0, s - 1));

	// Validation for step 1
	const materialInfoValid = () => {
		const title = watch("materialTitle");
		return title;
	};

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

	// Show cropper immediately after image selection
	useEffect(() => {
		if (
			imagePreviewUrl &&
			(!cropping || croppedImageUrl !== "" || croppedAreaPixels !== null)
		) {
			if (!cropping) {
				setCropping(true);
			}
			if (croppedImageUrl !== "") setCroppedImageUrl("");
			if (croppedAreaPixels !== null) setCroppedAreaPixels(null);
		}
		// eslint-disable-next-line
	}, [imagePreviewUrl]);

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
		for (let i = 0; i < data.questions.length; i++) {
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

	// Add state for cropping
	const [cropping, setCropping] = useState(false);
	const [croppedImageUrl, setCroppedImageUrl] = useState("");
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	// Utility to get cropped image from canvas
	async function getCroppedImg(imageSrc, crop) {
		const image = await createImage(imageSrc);
		// Always output at 400x400 for DrawingOverlay
		const outputWidth = 400;
		const outputHeight = 400;
		const canvas = document.createElement("canvas");
		canvas.width = outputWidth;
		canvas.height = outputHeight;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(
			image,
			crop.x,
			crop.y,
			crop.width,
			crop.height,
			0,
			0,
			outputWidth,
			outputHeight,
		);
		return new Promise((resolve) => {
			canvas.toBlob((blob) => {
				if (!blob) return resolve("");
				const url = URL.createObjectURL(blob);
				resolve(url);
			}, "image/jpeg");
		});
	}

	function createImage(url) {
		return new Promise((resolve, reject) => {
			const img = new window.Image();
			img.addEventListener("load", () => resolve(img));
			img.addEventListener("error", (err) => reject(err));
			img.setAttribute("crossOrigin", "anonymous");
			img.src = url;
		});
	}

	// Utility to wait for image load
	function waitForImageLoad(url) {
		return new Promise((resolve) => {
			const img = new window.Image();
			img.onload = () => resolve();
			img.src = url;
		});
	}

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<fieldset className={styles.listen_repeat_container}>
					<legend className={styles.legend}>TOEFL Speaking Material</legend>

					{step === 0 && (
						<>
							<label htmlFor="materialTitle" className={styles.label}>
								Material Title
								<input
									type="text"
									{...register("materialTitle", { required: true })}
									id="materialTitle"
									className={styles.text_input}
								/>
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
									{...register("materialId")}
									id="materialId"
									className={styles.text_input}
								/>
							</label>
							<button
								type="button"
								onClick={goToNextStep}
								disabled={!materialInfoValid()}
								className={styles.next_button}
							>
								Next
							</button>
						</>
					)}
					{/* Step 2: Image + Questions */}
					{step === 1 && (
						<>
							<label htmlFor="partTitle">
								Part Title
								<input
									{...register("partTitle", { required: true })}
									id="partTitle"
								/>
							</label>
							<label htmlFor="image" className={styles.label}>
								Image
								<input
									type="file"
									{...register("image", { required: true })}
									id="image"
									className={styles.file_input}
								/>
							</label>
							{imagePreviewUrl && (
								<>
									<ImageEditor
										imageUrl={imagePreviewUrl}
										cropping={cropping}
										setCropping={setCropping}
										croppedImageUrl={croppedImageUrl}
										setCroppedImageUrl={setCroppedImageUrl}
										croppedAreaPixels={croppedAreaPixels}
										setCroppedAreaPixels={setCroppedAreaPixels}
										highlightData={highlightDataByQuestion[currentQuestion]}
										onHighlightChange={(data) =>
											handleHighlightChange(currentQuestion, data)
										}
										getCroppedImg={getCroppedImg}
										waitForImageLoad={waitForImageLoad}
										onClearDrawing={() => {
											setHighlightDataByQuestion((prev) => {
												const next = [...prev];
												next[currentQuestion] = { viewBox: [400, 400], ds: [] };
												return next;
											});
										}}
									/>
								</>
							)}

							<div className={styles.questions_container}>
								<div className={styles.questions_dots_row}>
									{paddedFields.map((_, idx) => (
										<span
											key={idx}
											className={
												idx === currentQuestion
													? styles.question_dot_active
													: styles.question_dot
											}
											title={`Question ${idx + 1} ${questionCompletion[idx] ? "(Completed)" : ""}`}
										>
											{questionCompletion[idx] ? (
												<Check
													size={16}
													color="var(--button_background_confirm, #7bbb4f)"
													strokeWidth={2.2}
												/>
											) : (
												<Circle
													size={14}
													color={
														idx === currentQuestion
															? "var(--color-primary-hover, #4a7ba0)"
															: "var(--card_border_mid, #e9ecef)"
													}
													strokeWidth={2.2}
												/>
											)}
										</span>
									))}
								</div>
								{/* Chevrons below dots */}
								<div className={styles.questions_chevrons_row}>
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
										&#60;
									</button>
									<span className={styles.questions_chevrons_label}>
										Question {currentQuestion + 1} of {questionCount}
									</span>
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
										&#62;
									</button>
								</div>
							</div>
							<SpeakingPart1AudioQuestionFields
								key={paddedFields[currentQuestion].id}
								idx={currentQuestion}
								number={currentQuestion + 1}
								register={register}
								selectedAudioName={selectedAudioNames[currentQuestion]}
								selectedAudioFile={selectedAudioFiles[currentQuestion]}
								errors={errors}
							/>
							<button
								type="button"
								onClick={goToPrevStep}
								className={styles.back_button}
							>
								Back
							</button>
						</>
					)}
				</fieldset>
				<input type="submit" />
				{errors.image && (
					<span className={styles.error}>Image is required</span>
				)}
				{fields.map((field, idx) => (
					<div key={field.id}>
						{errors?.questions?.[idx]?.audio && (
							<span className={styles.error}>Audio {idx + 1} is required</span>
						)}
					</div>
				))}
			</form>
		</>
	);
};

export default CreateSpeakingMaterial;
