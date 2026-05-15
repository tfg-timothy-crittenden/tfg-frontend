// Debug: log all transcript values on every render (after useForm is defined)
// Place this after useForm so getValues is in scope
// ...existing code...
if (typeof window !== "undefined" && typeof getValues === "function") {
	try {
		const allTranscripts = getValues("questions").map((q) => q.transcriptText);
		console.log("[RHF DEBUG] All question transcripts:", allTranscripts);
	} catch (e) {
		// ignore if getValues fails before form is initialized
	}
}
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { hasDirtyLeaf } from "@/utils/formUtils";

// useFieldArray is  for managing dynamic arrays of fields.
// It provides stable fields with unique ids, and methods like append/remove/move.
// We use it here so that each question slot has a stable key for rendering and tracking
// dirty state, even when questions are added or removed dynamically.

// hasDirtyLeaf recursively checks the dirtyFields object (from RHF) for any field
// that is marked dirty. RHF's `isDirty` is true if ANY field changed from its default,
// but `dirtyFields` is a nested object mirroring the form shape. We use hasDirtyLeaf
// because a form can have isDirty=true while dirtyFields contains only empty nested
// objects (e.g. after a reset or programmatic setValue with shouldDirty:false).
// This guards against false positives when deciding whether to show Save/Discard buttons.

const FALLBACK_QUESTION_COUNT = 7;
const FALLBACK_PART2_QUESTION_COUNT = 4;

const makeDefaultQuestions = (count) =>
	Array.from({ length: count }, () => ({
		transcriptText: "",
		audio: [],
	}));

const useSpeakingMaterialForm = ({
	mode = "create",
	initialValues,
	initialHighlightDataByQuestion,
	initialPart2ConfigByQuestion,
	existingMedia,
	sectionStatus = null,
}) => {
	// Derive question counts from initialValues if available, otherwise fall back to
	// hardcoded defaults. These counts drive array sizing throughout the hook.
	const questionCount =
		initialValues?.questions?.length || FALLBACK_QUESTION_COUNT;
	const part2QuestionCount =
		initialValues?.part2Questions?.length || FALLBACK_PART2_QUESTION_COUNT;

	// Build the complete default values object that RHF uses as its baseline.
	// highlight and part2Config data always come from props (not initialValues) because
	// they are managed as separate state in the container and passed in explicitly.
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

		// Start with initialValues or baseDefaults
		const merged = {
			...baseDefaults,
			...initialValues,
			questions: initialValues?.questions || baseDefaults.questions,
			part2Questions:
				initialValues?.part2Questions || baseDefaults.part2Questions,
			// Always override highlight/config from props, not from initialValues,
			highlightDataByQuestion: baseDefaults.highlightDataByQuestion,
			part2ConfigByQuestion: baseDefaults.part2ConfigByQuestion,
		};

		// Patch in presigned audio URLs from existingMedia if available
		if (existingMedia?.questionAudioUrls) {
			merged.questions = merged.questions.map((q, idx) => ({
				...q,
				audio: existingMedia.questionAudioUrls[idx]
					? [existingMedia.questionAudioUrls[idx]]
					: [],
			}));
		}
		if (existingMedia?.part2QuestionAudioUrls) {
			merged.part2Questions = merged.part2Questions.map((q, idx) => ({
				...q,
				audio: existingMedia.part2QuestionAudioUrls[idx]
					? [existingMedia.part2QuestionAudioUrls[idx]]
					: [],
			}));
		}
		return merged;
	}, [
		initialValues,
		questionCount,
		part2QuestionCount,
		initialHighlightDataByQuestion,
		initialPart2ConfigByQuestion,
		existingMedia,
	]);

	// Debug: log the default values RHF is using
	if (typeof window !== "undefined") {
		window.__RHF_DEFAULT_VALUES__ = resolvedInitialValues;
		// eslint-disable-next-line no-console
		console.log("[RHF DEBUG] defaultValues:", resolvedInitialValues);
	}

	// Initialize RHF. shouldUnregister:false keeps field values in state even when
	// the component that registered them is unmounted (e.g. navigating between steps).
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

	// Re-sync the form whenever resolvedInitialValues changes (e.g. after edit mode
	// reloads data from the server). This replaces all field values and resets dirty state.
	useEffect(() => {
		reset(resolvedInitialValues);
	}, [resolvedInitialValues, reset]);

	// Register the Part 1 and Part 2 question arrays with RHF so each slot has a
	// stable id. See the useFieldArray comment at the top of this file.
	const { fields } = useFieldArray({
		control,
		name: "questions",
	});
	const { fields: part2Fields } = useFieldArray({
		control,
		name: "part2Questions",
	});

	// Normalize existing media URLs from the container into a predictable shape with
	// fixed-length arrays indexed by question slot. Missing slots resolve to null.
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

	// Pad the RHF field arrays to always have exactly `questionCount` / `part2QuestionCount`
	// slots. useFieldArray may return fewer entries before the form is fully initialized,
	// so we fill missing slots with a placeholder to keep index-based access stable.
	const paddedFields = Array.from(
		{ length: questionCount },
		(_, idx) => fields[idx] || { id: `empty-${idx}` },
	);
	// Subscribe to each question's audio field so completion state updates reactively.
	const selectedAudioFiles = paddedFields.map(
		(_, idx) => watch(`questions.${idx}.audio`) || [],
	);
	const paddedPart2Fields = Array.from(
		{ length: part2QuestionCount },
		(_, idx) => part2Fields[idx] || { id: `part2-empty-${idx}` },
	);
	const selectedPart2AudioFiles = paddedPart2Fields.map((_, idx) =>
		watch(`part2Questions.${idx}.audio`),
	);

	// Step 1 (Material Details) is considered valid as soon as a title is entered.
	const materialInfoValid = !!watch("materialTitle");

	// Convenience helpers that check whether a backend audio URL already exists for a
	// given question index, so the UI can treat it as "has audio" even before a new
	// file is selected.
	const hasExistingQuestionAudio = (idx) =>
		!!normalizedExistingMedia.questionAudioUrls[idx];
	const hasExistingPart2QuestionAudio = (idx) =>
		!!normalizedExistingMedia.part2QuestionAudioUrls[idx];

	// A question is complete when it has both a non-empty transcript and audio
	// (either a newly selected file or an existing backend URL).
	const questionCompletion = paddedFields.map((_, idx) => {
		const transcript = watch(`questions.${idx}.transcriptText`);
		const audioField = selectedAudioFiles[idx] || [];
		// Only count backend audio if the field is empty and not cleared
		const clearedKey = `audioCleared_questions_${idx}_audio`;
		const backendAudioPresent =
			!!normalizedExistingMedia.questionAudioUrls[idx];
		const backendAudioAllowed =
			backendAudioPresent &&
			!(typeof window !== "undefined" && window[clearedKey]);
		const hasAudio =
			audioField.length > 0 || (audioField.length === 0 && backendAudioAllowed);
		return !!transcript?.trim() && hasAudio;
	});

	const part2QuestionCompletion = paddedPart2Fields.map((_, idx) => {
		const transcript = watch(`part2Questions.${idx}.transcriptText`);
		const audioField = selectedPart2AudioFiles[idx] || [];
		// Only count backend audio if the field is empty and not cleared
		const clearedKey = `audioCleared_part2Questions_${idx}_audio`;
		const backendAudioPresent =
			!!normalizedExistingMedia.part2QuestionAudioUrls[idx];
		const backendAudioAllowed =
			backendAudioPresent &&
			!(typeof window !== "undefined" && window[clearedKey]);
		const hasAudio =
			audioField.length > 0 || (audioField.length === 0 && backendAudioAllowed);
		return !!transcript?.trim() && hasAudio;
	});

	// Aggregate completion flags used to gate navigation and the submit button.
	const allQuestionsComplete = questionCompletion.every(Boolean);
	const allPart2QuestionsComplete = part2QuestionCompletion.every(Boolean);

	// Reactive reads for fields consumed by child components or navigation guards.
	const partTitle = watch("partTitle");
	const part2Title = watch("part2Title");
	const highlightDataByQuestion =
		watch("highlightDataByQuestion") || Array(questionCount).fill(null);
	const part2ConfigByQuestion =
		watch("part2ConfigByQuestion") || Array(part2QuestionCount).fill({});

	// Determine whether there are genuine unsaved changes. isDirty alone is unreliable
	// (see hasDirtyLeaf comment above), so we combine it with a deep check on dirtyFields.
	const hasDirtyFields = hasDirtyLeaf(dirtyFields);
	const hasUnsavedFieldChanges = isDirty && hasDirtyFields;
	// Debug logging for discard changes button activation
	if (typeof window !== "undefined") {
		window.__RHF_DEBUG_STATE__ = {
			isDirty,
			dirtyFields,
			hasDirtyFields,
			hasUnsavedFieldChanges,
		};
		// Also log to console for immediate feedback
		// eslint-disable-next-line no-console
		console.log(
			"[RHF DEBUG] isDirty:",
			isDirty,
			"dirtyFields:",
			dirtyFields,
			"hasDirtyFields:",
			hasDirtyFields,
			"hasUnsavedFieldChanges:",
			hasUnsavedFieldChanges,
		);
	}
	// In edit mode:
	// - If published, Save is only enabled if all questions are complete AND there are unsaved changes
	// - If not published, Save is enabled if there are unsaved changes
	const isPublished =
		String(sectionStatus || "")
			.trim()
			.toUpperCase() === "PUBLISHED";
	let saveChangesDisabled = false;
	if (mode === "edit") {
		if (isPublished) {
			saveChangesDisabled = !hasUnsavedFieldChanges || !allQuestionsComplete;
		} else {
			saveChangesDisabled = !hasUnsavedFieldChanges;
		}
	}

	return {
		mode,
		register,
		handleSubmit,
		watch,
		getValues,
		control,
		setValue,
		reset,
		errors,
		fields,
		part2Fields,
		questionCount,
		part2QuestionCount,
		resolvedInitialValues,
		normalizedExistingMedia,
		paddedFields,
		paddedPart2Fields,
		selectedAudioFiles,
		selectedPart2AudioFiles,
		materialInfoValid,
		hasExistingQuestionAudio,
		hasExistingPart2QuestionAudio,
		questionCompletion,
		part2QuestionCompletion,
		allQuestionsComplete,
		allPart2QuestionsComplete,
		partTitle,
		part2Title,
		highlightDataByQuestion,
		part2ConfigByQuestion,
		hasUnsavedFieldChanges,
		saveChangesDisabled,
	};
};

export default useSpeakingMaterialForm;
