import { useParams } from "react-router-dom";
import { ToeflSpeakingFormPage } from "@/views/CreateSpeakingMaterial/components/CreateSpeakingMaterialPresentation/ToeflSpeakingFormPage";

const EditSpeakingMaterial = () => {
	const { id } = useParams();

	return <ToeflSpeakingFormPage materialId={Number(id)} />;
};

export default EditSpeakingMaterial;
