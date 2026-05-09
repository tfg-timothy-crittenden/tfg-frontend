import { useFieldArray, useForm } from "react-hook-form";
import { ImageIcon, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

const hasDirtyLeaf = (value) => {
	if (value === true) return true;
	if (!value || typeof value !== "object") return false;
	return Object.values(value).some((entry) => hasDirtyLeaf(entry));
};

const extractMaterialId = (payload) => {
	const value =
		payload?.materialId ??
		payload?.material_id ??
		payload?.id ??
		payload?.material?.materialId ??
		payload?.material?.id ??
		payload?.section?.materialId ??
		payload?.section?.material_id ??
		payload?.section?.id ??
		payload?.data?.materialId ??
		payload?.data?.material_id ??
		payload?.data?.id ??
		null;

	if (value === null || value === undefined) return null;
	return String(value);
};

const CreateSpeakingMaterialPresentation = ({
	mode = "create",
	sectionStatus = null,
	initialValues,
	initialHighlightDataByQuestion,
	initialPart2ConfigByQuestion,
	existingMedia,
	isLoading = false,
	submitLabel = "Submit",
	onSubmitForm,
	onDraftSaveForm,
	onPublish,
	onReloadFromDb,
}) => {
	// Resolve question counts from incoming data so create/edit modes share the
	// same presentation without hard-coding array sizes into the form setup.
	const questionCount =
		initialValues?.questions?.length || FALLBACK_QUESTION_COUNT;
	const part2QuestionCount =
		initialValues?.part2Questions?.length || FALLBACK_PART2_QUESTION_COUNT;

	// Build stable default values for react-hook-form. Edit mode injects fetched
	// values here, while create mode falls back to empty question arrays.
	const resolvedInitialValues = useMemo(() => {
		const baseDefaults = {
			materialTitle: "",
			materialDescription: "",
			materialId: "",
			partTitle: "",
			part2Title: "",
			image: [],
			removedExistingPartImage: false,
			questions: makeDefaultQuestions(questionCount),
			part2Questions: makeDefaultQuestions(part2QuestionCount),
			highlightDataByQuestion:
				initialHighlightDataByQuestion || Array(questionCount).fill(null),
			part2ConfigByQuestion:
				initialPart2ConfigByQuestion || Array(part2QuestionCount).fill({}),
		};

		if (!initialValues) return baseDefaults;

		return {
			...baseDefaults,
			...initialValues,
			questions: initialValues.questions || baseDefaults.questions,
			part2Questions:
				initialValues.part2Questions || baseDefaults.part2Questions,
			highlightDataByQuestion: baseDefaults.highlightDataByQuestion,
			part2ConfigByQuestion: baseDefaults.part2ConfigByQuestion,
		};
	}, [
		initialValues,
		questionCount,
		part2QuestionCount,
		initialHighlightDataByQuestion,
		initialPart2ConfigByQuestion,
	]);

	// Form state
	const {
		register,
		handleSubmit,
		watch,
		getValues,
		control,
		setValue,
		reset,
		formState: { errors, isDirty, dirtyFields },
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
	const removedExistingPartImage = !!watch("removedExistingPartImage");

	useEffect(() => {
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
		setValue("removedExistingPartImage", false, {
			shouldDirty: false,
			shouldTouch: false,
		});
	}, [normalizedExistingMedia.partImageUrl]);

	// Media state
	const selectedImage = watch("image");
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");
	const [croppedImageUrl, setCroppedImageUrl] = useState("");
	const [croppedImageFile, setCroppedImageFile] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isReverting, setIsReverting] = useState(false);

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
		setCroppedImageFile(null);
		setStep(1);
	};

	const clearImage = () => {
		if (normalizedExistingMedia.partImageUrl) {
			setValue("removedExistingPartImage", true, {
				shouldDirty: true,
				shouldTouch: true,
			});
		}
		setValue("image", []);
		setCroppedImageUrl("");
		setCroppedImageFile(null);
		setImagePreviewUrl("");
		setShowImagePicker(true);
	};

	const resetImageUiToExistingState = () => {
		setValue("image", [], {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue("removedExistingPartImage", false, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setImagePreviewUrl("");
		setCroppedImageUrl("");
		setCroppedImageFile(null);
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
	};

	// Keep crop confirmation local; the cropped file is submitted on manual save.
	const handleCropConfirmed = async (croppedUrl) => {
		setCroppedImageUrl(croppedUrl);
		try {
			const blob = await fetch(croppedUrl).then((res) => res.blob());
			const file = new File([blob], "cropped-image.png", {
				type: blob.type || "image/png",
			});
			setCroppedImageFile(file);
		} catch {
			setCroppedImageFile(null);
		}
	};

	// Validation helpers
	const materialInfoValid = () => {
		const title = watch("materialTitle");
		return title;
	};

	const hasExistingPartImage =
		!!normalizedExistingMedia.partImageUrl && !removedExistingPartImage;
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
		setCroppedImageFile(null);
	}, [imagePreviewUrl]);

	// Clean up blob URLs created by the cropper preview.
	useEffect(() => {
		return () => {
			if (croppedImageUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(croppedImageUrl);
			}
		};
	}, [croppedImageUrl]);

	const highlightDataByQuestion =
		watch("highlightDataByQuestion") || Array(questionCount).fill(null);
	const part2ConfigByQuestion =
		watch("part2ConfigByQuestion") || Array(part2QuestionCount).fill({});

	// ── Publish ─────────────────────────────────────────────────────────────────
	const [isPublishing, setIsPublishing] = useState(false);
	const isPublishedStatus =
		String(sectionStatus || "")
			.trim()
			.toUpperCase() === "PUBLISHED";
	const canShowDraftButton = !!onDraftSaveForm && !isPublishedStatus;
	const canShowHeaderSaveChangesButton =
		mode === "edit" && isPublishedStatus && !!onSubmitForm;
	const canShowPublishButton = !!onPublish && !isPublishedStatus;
	const hasDirtyFields = hasDirtyLeaf(dirtyFields);
	const hasUnsavedFieldChanges = isDirty && hasDirtyFields;
	const saveChangesDisabled = mode === "edit" && !hasUnsavedFieldChanges;
	const currentBreadcrumbKey =
		activePart === 1
			? step === 0
				? "section-details"
				: step === 1
					? "part1-image"
					: "part1-questions"
			: "part2-questions";

	const breadcrumbItems = [
		{
			key: "section-details",
			label: "section details",
			onClick: () => {
				setActivePart(1);
				goToStage(0);
			},
		},
		{
			key: "part1-image",
			label: "part 1 image",
			onClick: () => {
				setActivePart(1);
				goToStage(1);
			},
		},
		{
			key: "part1-questions",
			label: "part 1 questions",
			onClick: () => {
				setActivePart(1);
				goToStage(2);
			},
		},
		{
			key: "part2-questions",
			label: "part 2 questions",
			onClick: goToPart2,
		},
	];

	const currentBreadcrumbIndex = breadcrumbItems.findIndex(
		(item) => item.key === currentBreadcrumbKey,
	);
	const progressionGates = [
		materialInfoValid(),
		hasVisualPrompt,
		!part1NextDisabled,
	];
	const canNavigateToBreadcrumbIndex = (targetIndex) => {
		if (targetIndex <= currentBreadcrumbIndex) return true;
		for (
			let gateIndex = currentBreadcrumbIndex;
			gateIndex < targetIndex;
			gateIndex += 1
		) {
			if (!progressionGates[gateIndex]) return false;
		}
		return true;
	};
	const progressPercent =
		currentBreadcrumbIndex <= 0
			? 0
			: (currentBreadcrumbIndex / (breadcrumbItems.length - 1)) * 100;

	// Question drawing/highlight handlers
	const handleHighlightChange = (idx, data) => {
		const next = [...highlightDataByQuestion];
		next[idx] = data;
		setValue("highlightDataByQuestion", next, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const activeVisualPromptUrl =
		croppedImageUrl ||
		(!selectedImage?.[0] ? normalizedExistingMedia.partImageUrl : "");

	const buildSubmissionData = async (data) => {
		const submissionData = { ...data };

		if (croppedImageFile) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(croppedImageFile);
			submissionData.image = Array.from(dataTransfer.files);
		} else if (croppedImageUrl) {
			try {
				const blob = await fetch(croppedImageUrl).then((res) => res.blob());
				const croppedFile = new File([blob], "cropped-image.png", {
					type: blob.type || "image/png",
				});
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(croppedFile);
				submissionData.image = Array.from(dataTransfer.files);
			} catch {
				// Fall back to the currently selected file if crop conversion fails.
			}
		}

		if (!submissionData.image?.[0] && selectedImage?.[0]) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(selectedImage[0]);
			submissionData.image = Array.from(dataTransfer.files);
		}

		return submissionData;
	};

	// Submit the cropped blob as a real File so the backend receives the actual
	// cropped image instead of the original uploaded source.
	const handleFormSubmit = async (data) => {
		if (!onSubmitForm) return;
		setIsSubmitting(true);
		try {
			const submissionData = await buildSubmissionData(data);

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

	const handleDraftSave = async () => {
		const saveDraft = onDraftSaveForm || onSubmitForm;
		if (!hasUnsavedFieldChanges) return;
		if (!saveDraft) return;
		setIsSubmitting(true);
		try {
			const submissionData = await buildSubmissionData(getValues());
			const response = await saveDraft({
				data: submissionData,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});
			const nextMaterialId =
				extractMaterialId(response) || submissionData.materialId || "";
			const nextSubmissionData = {
				...submissionData,
				materialId: nextMaterialId,
			};
			// Mark current values as the new baseline so Save Draft disables until
			// the user makes another change.
			reset(nextSubmissionData);
			alert("Draft saved!");
		} catch (e) {
			alert("Upload error: " + (e?.response?.data?.message || e.message));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRevertUnsavedChanges = async () => {
		if (!hasUnsavedFieldChanges) return;

		if (mode === "edit" && onReloadFromDb) {
			setIsReverting(true);
			try {
				await onReloadFromDb();
				resetImageUiToExistingState();
				setActivePart(1);
				setStep(0);
				setCurrentQuestion(0);
				setCurrentPart2Question(0);
			} catch (e) {
				alert(
					"Failed to refresh from server: " +
						(e?.response?.data?.message || e.message),
				);
			} finally {
				setIsReverting(false);
			}
			return;
		}

		reset(resolvedInitialValues);
		resetImageUiToExistingState();
	};

	const handlePublishSubmit = async (data) => {
		if (!onPublish) return;
		setIsPublishing(true);
		try {
			const submissionData = await buildSubmissionData(data);
			await onPublish({
				data: submissionData,
				highlightDataByQuestion,
				part2ConfigByQuestion,
			});
			alert("Publish successful!");
		} catch (e) {
			alert("Publish error: " + (e?.response?.data?.message || e.message));
		} finally {
			setIsPublishing(false);
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
					<div className={styles.progress_track} aria-hidden="true">
						<div
							className={styles.progress_fill}
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<ol className={styles.breadcrumb_flow}>
						{breadcrumbItems.map((item, index) => {
							const canNavigate = canNavigateToBreadcrumbIndex(index);
							const stateClass =
								index === currentBreadcrumbIndex
									? styles.breadcrumb_current
									: index < currentBreadcrumbIndex
										? styles.breadcrumb_done
										: styles.breadcrumb_upcoming;

							return (
								<li
									key={item.key}
									className={stateClass}
									aria-current={
										index === currentBreadcrumbIndex ? "step" : undefined
									}
								>
									<button
										type="button"
										className={`${styles.breadcrumb_button} ${!canNavigate ? styles.breadcrumb_button_disabled : ""}`}
										onClick={canNavigate ? item.onClick : undefined}
										disabled={!canNavigate}
									>
										{item.label}
									</button>
								</li>
							);
						})}
					</ol>
				</nav>
				<div className={styles.listen_repeat_container}>
					<div className={styles.form_header}>
						{mode === "edit" ? (
							<h1 className={styles.form_title}>
								Edit TOEFL Speaking Material
							</h1>
						) : null}
						<div className={styles.form_header_actions}>
							{mode === "edit" && (
								<button
									type="button"
									className={`${styles.revert_button} ${styles.step_action_button}`}
									onClick={
										hasUnsavedFieldChanges
											? handleRevertUnsavedChanges
											: undefined
									}
									disabled={
										!hasUnsavedFieldChanges ||
										isSubmitting ||
										isPublishing ||
										isReverting
									}
								>
									<RotateCcw size={16} className={styles.draft_button_icon} />
									{isReverting ? "Discarding..." : "Discard Changes"}
								</button>
							)}
							{canShowDraftButton && (
								<button
									type="button"
									className={`${styles.draft_button} ${styles.step_action_button}`}
									onClick={hasUnsavedFieldChanges ? handleDraftSave : undefined}
									disabled={
										!hasUnsavedFieldChanges || isSubmitting || isReverting
									}
								>
									<Save size={16} className={styles.draft_button_icon} />
									{isSubmitting ? "Saving..." : "Save Draft"}
								</button>
							)}
							{canShowHeaderSaveChangesButton && (
								<button
									type="button"
									className={`${styles.draft_button} ${styles.step_action_button}`}
									onClick={
										hasUnsavedFieldChanges
											? handleSubmit(handleFormSubmit)
											: undefined
									}
									disabled={
										!hasUnsavedFieldChanges || isSubmitting || isReverting
									}
								>
									<Save size={16} className={styles.draft_button_icon} />
									{isSubmitting ? "Saving..." : "Save Changes"}
								</button>
							)}
						</div>
					</div>
					{activePart === 1 && step === 0 && (
						<div className={styles.section}>
							{/* <SectionHeader
								title="Material Info"
								subtitle="Enter a clear title and optional description for this test part. Material ID is assigned automatically."
								styles={styles}
							/> */}
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
									<input
										type="hidden"
										{...register("removedExistingPartImage")}
									/>
									<input type="hidden" {...register("materialId")} />
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
							{/* <SectionHeader
								title="Select & Crop Image"
								subtitle="Give this part a title, upload an image, and crop it to the area students should see."
								styles={styles}
							/> */}

							<div className={styles.step3_fields_card}>
								<div className={styles.fields_inner}>
									<label htmlFor="partTitle" className={styles.label}>
										Part 1 Location
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
												onCropConfirmed={handleCropConfirmed}
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
												onClick={() => {
													setValue("removedExistingPartImage", true, {
														shouldDirty: true,
														shouldTouch: true,
													});
													setShowImagePicker(true);
												}}
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
							{/* <SectionHeader
								title="Questions"
								subtitle="Draw highlights on the image and add audio and transcript for each question."
								styles={styles}
							/> */}

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
									onHighlightChange={(data) =>
										handleHighlightChange(currentQuestion, data)
									}
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
						{/* <SectionHeader
							title="Part 2 Questions"
							subtitle="Add 4 audio questions and matching transcripts."
							styles={styles}
						/> */}

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
										disabled={
											submitDisabled || isSubmitting || saveChangesDisabled
										}
									>
										{isSubmitting ? "Saving..." : submitLabel}
									</button>
									{canShowPublishButton && (
										<button
											type="button"
											className={`${styles.publish_button} ${styles.step_action_button}`}
											disabled={submitDisabled || isPublishing || isSubmitting}
											onClick={handleSubmit(handlePublishSubmit)}
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
								rightDisabled={
									submitDisabled || isSubmitting || saveChangesDisabled
								}
								styles={styles}
							/>
						)}
					</div>
				</div>
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
