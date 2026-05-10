import { useNavigate } from "react-router-dom";
import CreateSpeakingMaterialPresentation from "@/views/CreateSpeakingMaterial/components/CreateSpeakingMaterialPresentation/CreateSpeakingMaterialPresentation";
import useSpeakingMaterialContainer from "@/views/CreateSpeakingMaterial/hooks/useSpeakingMaterialContainer";

const CreateSpeakingMaterial = () => {
	const navigate = useNavigate();
	const config = useSpeakingMaterialContainer("create", null, navigate);

	return <CreateSpeakingMaterialPresentation {...config} />;
};

export default CreateSpeakingMaterial;
