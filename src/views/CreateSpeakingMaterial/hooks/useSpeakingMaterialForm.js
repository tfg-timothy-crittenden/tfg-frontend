import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { hasDirtyLeaf } from "../../../utils/formUtils";

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
}) => {
	const questionCount =
		initialValues?.questions?.length || FALLBACK_QUESTION_COUNT;
	const part2QuestionCount =
		initialValues?.part2Questions?.length || FALLBACK_PART2_QUESTION_COUNT;

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

	useEffect(() => {
		reset(resolvedInitialValues);
	}, [resolvedInitialValues, reset]);

	const { fields } = useFieldArray({
		control,
		name: "questions",
	});
	const { fields: part2Fields } = useFieldArray({
		control,
		name: "part2Questions",
	});

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

	const materialInfoValid = !!watch("materialTitle");

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
	const highlightDataByQuestion =
		watch("highlightDataByQuestion") || Array(questionCount).fill(null);
	const part2ConfigByQuestion =
		watch("part2ConfigByQuestion") || Array(part2QuestionCount).fill({});

	const hasDirtyFields = hasDirtyLeaf(dirtyFields);
	const hasUnsavedFieldChanges = isDirty && hasDirtyFields;
	const saveChangesDisabled = mode === "edit" && !hasUnsavedFieldChanges;

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
