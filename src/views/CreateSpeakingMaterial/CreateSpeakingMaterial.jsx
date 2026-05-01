import {
	uploadSpeakingSectionDraft,
	publishSpeakingMaterial,
	updateSpeakingSection,
} from "@/api/material/materialAPI";
import { buildRoute } from "@/routes/routeConfig";
import { useNavigate } from "react-router-dom";
import CreateSpeakingMaterialPresentation from "./CreateSpeakingMaterialPresentation";
import {
	buildCreateSpeakingSectionDraftFormData,
	buildCreateSpeakingSectionFormData,
} from "./speakingSectionFormUtils";

const CreateSpeakingMaterial = () => {
	const navigate = useNavigate();
	const questionCount = 7;
	const part2QuestionCount = 4;
	const getErrorMessage = (error) =>
		error?.response?.data?.message || error?.message || "";

	const isMissingQuestionNodeError = (error) => {
		const message = String(getErrorMessage(error)).toLowerCase();
		return (
			message.includes("question at index") &&
			message.includes("not found under part node")
		);
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

	const initialValues = {
		materialTitle: "",
		materialDescription: "",
		materialId: "",
		partTitle: "",
		part2Title: "",
		questions: Array.from({ length: questionCount }, () => ({
			transcriptText: "",
			audio: [],
		})),
		part2Questions: Array.from({ length: part2QuestionCount }, () => ({
			transcriptText: "",
			audio: [],
		})),
	};

	const handleSubmitForm = async ({
		data,
		highlightDataByQuestion,
		part2ConfigByQuestion,
	}) => {
		const formData = buildCreateSpeakingSectionFormData({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
		});

		const materialId = data?.materialId?.trim();
		let saveResponse;
		if (materialId) {
			try {
				saveResponse = await updateSpeakingSection(materialId, formData);
			} catch (error) {
				if (!isMissingQuestionNodeError(error)) {
					throw error;
				}
				saveResponse = await uploadSpeakingSectionDraft(formData);
			}
		} else {
			saveResponse = await uploadSpeakingSectionDraft(formData);
		}

		const resolvedMaterialId = extractMaterialId(saveResponse) || materialId;
		if (!resolvedMaterialId) {
			throw new Error("Material ID was not returned after save.");
		}

		await publishSpeakingMaterial(resolvedMaterialId);
	};

	const handleDraftSaveForm = async ({
		data,
		highlightDataByQuestion,
		part2ConfigByQuestion,
	}) => {
		const formData = buildCreateSpeakingSectionDraftFormData({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
		});
		const materialId = data?.materialId?.trim();
		let saveResponse;
		if (materialId) {
			try {
				saveResponse = await updateSpeakingSection(materialId, formData);
			} catch (error) {
				if (!isMissingQuestionNodeError(error)) {
					throw error;
				}
				saveResponse = await uploadSpeakingSectionDraft(formData);
			}
		} else {
			saveResponse = await uploadSpeakingSectionDraft(formData);
		}

		const resolvedMaterialId = extractMaterialId(saveResponse) || materialId;
		if (!materialId && resolvedMaterialId) {
			navigate(buildRoute.editSpeakingMaterial(resolvedMaterialId));
		}

		return saveResponse;
	};

	return (
		<CreateSpeakingMaterialPresentation
			mode="create"
			initialValues={initialValues}
			initialHighlightDataByQuestion={Array(questionCount).fill(null)}
			initialPart2ConfigByQuestion={Array(part2QuestionCount).fill({})}
			onSubmitForm={handleSubmitForm}
			onDraftSaveForm={handleDraftSaveForm}
			submitLabel="Submit"
		/>
	);
};

export default CreateSpeakingMaterial;
