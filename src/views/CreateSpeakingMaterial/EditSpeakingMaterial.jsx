import { useParams } from "react-router-dom";
import CreateSpeakingMaterialPresentation from "@/views/CreateSpeakingMaterial/components/CreateSpeakingMaterialPresentation/CreateSpeakingMaterialPresentationOLD";
import useSpeakingMaterialContainer from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialContainer";

const EditSpeakingMaterial = () => {
	const { id } = useParams();
	const config = useSpeakingMaterialContainer("edit", id);

	return <CreateSpeakingMaterialPresentation {...config} />;
};

export default EditSpeakingMaterial;
