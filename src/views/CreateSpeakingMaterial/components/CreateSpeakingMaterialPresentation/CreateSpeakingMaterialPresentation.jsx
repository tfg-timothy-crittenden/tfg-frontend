import HeaderActions from "@/views/CreateSpeakingMaterial/components/HeaderActions/HeaderActions";
import MaterialDetailsStep from "@/views/CreateSpeakingMaterial/components/MaterialDetailsStep/MaterialDetailsStep";
import Part1ImageStep from "@/views/CreateSpeakingMaterial/components/Part1ImageStep/Part1ImageStep";
import Part1QuestionsStep from "@/views/CreateSpeakingMaterial/components/Part1QuestionsStep/Part1QuestionsStep";
import Part2QuestionsStep from "@/views/CreateSpeakingMaterial/components/Part2QuestionsStep/Part2QuestionsStep";
import SpeakingMaterialBreadcrumb from "@/views/CreateSpeakingMaterial/components/SpeakingMaterialBreadcrumb/SpeakingMaterialBreadcrumb";
import useSpeakingMaterialActions from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialActions";
import useSpeakingMaterialNavigation from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialNavigation";
import useSpeakingMaterialForm from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialForm";
import useSpeakingMaterialImageState from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialImageState";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

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
	const form = useSpeakingMaterialForm({
		mode,
		initialValues,
		initialHighlightDataByQuestion,
		initialPart2ConfigByQuestion,
		existingMedia,
	});
	const navigation = useSpeakingMaterialNavigation(form);
	const image = useSpeakingMaterialImageState(form);

	const {
		handleSubmit,
		getValues,
		setValue,
		reset,
		errors,
		fields,
		part2Fields,
		resolvedInitialValues,
		materialInfoValid,
		allQuestionsComplete,
		allPart2QuestionsComplete,
		partTitle,
		part2Title,
		highlightDataByQuestion,
		part2ConfigByQuestion,
		hasUnsavedFieldChanges,
		saveChangesDisabled,
	} = form;

	const isPublishedStatus =
		String(sectionStatus || "")
			.trim()
			.toUpperCase() === "PUBLISHED";
	const hasBackendStatus =
		typeof sectionStatus === "string" && sectionStatus.trim().length > 0;
	const normalizedBackendStatus = hasBackendStatus
		? sectionStatus.trim().toUpperCase()
		: "";
	const statusLabel = hasBackendStatus
		? normalizedBackendStatus.charAt(0) +
			normalizedBackendStatus.slice(1).toLowerCase()
		: "";
	const statusClassName = isPublishedStatus
		? styles.status_published
		: styles.status_draft;
	const canShowDraftButton = !!onDraftSaveForm && !isPublishedStatus;
	const canShowHeaderSaveChangesButton =
		mode === "edit" && isPublishedStatus && !!onSubmitForm;
	const canShowPublishButton = !!onPublish && !isPublishedStatus;

	const {
		setActivePart,
		setCurrentQuestion,
		setCurrentPart2Question,
		setStep,
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,
	} = navigation;

	const {
		selectedImage,
		croppedImageUrl,
		croppedImageFile,
		hasPartImage,
		hasVisualPrompt,
		resetImageUiToExistingState,
	} = image;

	const {
		isSubmitting,
		isReverting,
		isPublishing,
		handleFormSubmit,
		handleDraftSave,
		handlePublishSubmit,
		handleRevertUnsavedChanges,
	} = useSpeakingMaterialActions({
		mode,
		onSubmitForm,
		onDraftSaveForm,
		onPublish,
		onReloadFromDb,
		getValues,
		reset,
		resolvedInitialValues,
		highlightDataByQuestion,
		part2ConfigByQuestion,
		hasUnsavedFieldChanges,
		setActivePart,
		setCurrentQuestion,
		setCurrentPart2Question,
		setStep,
		resetImageUiToExistingState,
		selectedImage,
		croppedImageUrl,
		croppedImageFile,
	});

	const part1NextDisabled =
		!materialInfoValid ||
		!partTitle?.trim() ||
		!hasPartImage ||
		!hasVisualPrompt ||
		!allQuestionsComplete;

	const submitDisabled =
		part1NextDisabled || !part2Title?.trim() || !allPart2QuestionsComplete;

	// Question drawing/highlight handlers
	const handleHighlightChange = (idx, data) => {
		const next = [...highlightDataByQuestion];
		next[idx] = data;
		setValue("highlightDataByQuestion", next, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const formView = {
		...form,
		canShowDraftButton,
		canShowHeaderSaveChangesButton,
		canShowPublishButton,
		isSubmitting,
		isPublishing,
		isReverting,
		handleRevertUnsavedChanges,
		handleDraftSave,
		handleFormSubmit,
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
				<div className={styles.listen_repeat_container}>
					<div className={styles.form_header}>
						<div className={styles.form_header_title_group}>
							<h1 className={styles.form_title}>
								{mode === "edit"
									? "Edit TOEFL Speaking Material"
									: "Create TOEFL Speaking Material"}
							</h1>
							{hasBackendStatus && (
								<span className={`${styles.status_badge} ${statusClassName}`}>
									Status: {statusLabel}
								</span>
							)}
						</div>
						<HeaderActions form={formView} />
					</div>
					<SpeakingMaterialBreadcrumb
						navigation={navigation}
						materialInfoValid={materialInfoValid}
						hasVisualPrompt={hasVisualPrompt}
						part1NextDisabled={part1NextDisabled}
					/>
					{isMaterialDetails && (
						<MaterialDetailsStep form={form} navigation={navigation} />
					)}
					{isPart1Image && (
						<Part1ImageStep form={form} image={image} navigation={navigation} />
					)}
					{isPart1Questions && (
						<Part1QuestionsStep
							form={form}
							image={image}
							navigation={navigation}
							part1NextDisabled={part1NextDisabled}
							onHighlightChange={handleHighlightChange}
						/>
					)}
					<div className={styles.section} hidden={!isPart2Questions}>
						<Part2QuestionsStep
							form={form}
							navigation={navigation}
							submitLabel={submitLabel}
							submitDisabled={submitDisabled}
							isSubmitting={isSubmitting}
							isPublishing={isPublishing}
							onPublish={onPublish}
							canShowPublishButton={canShowPublishButton}
							onHandlePublishSubmit={handlePublishSubmit}
							saveChangesDisabled={saveChangesDisabled}
						/>
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
