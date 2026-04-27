import { uploadSpeakingSection } from "@/api/material/materialAPI";
import CreateSpeakingMaterialPresentation from "./CreateSpeakingMaterialPresentation";
import { buildCreateSpeakingSectionFormData } from "./speakingSectionFormUtils";

const CreateSpeakingMaterial = () => {
	const questionCount = 7;
	const part2QuestionCount = 4;
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
		if (!data.materialId) {
			throw new Error("Material ID is required for upload.");
		}
		const formData = buildCreateSpeakingSectionFormData({
			data,
			highlightDataByQuestion,
			part2ConfigByQuestion,
		});
		await uploadSpeakingSection(formData);
	};

	return (
		<CreateSpeakingMaterialPresentation
			mode="create"
			initialValues={initialValues}
			initialHighlightDataByQuestion={Array(questionCount).fill(null)}
			initialPart2ConfigByQuestion={Array(part2QuestionCount).fill({})}
			onSubmitForm={handleSubmitForm}
			submitLabel="Submit"
		/>
	);
};

export default CreateSpeakingMaterial;
