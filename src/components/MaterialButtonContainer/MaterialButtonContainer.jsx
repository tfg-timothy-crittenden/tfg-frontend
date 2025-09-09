import { useNavigate, useParams } from "react-router-dom";
import HeaderItem from "@/components/HeaderItem/HeaderItem";
import { NotebookTabs } from "lucide-react";
import { buildRoute } from "@/routes/routeConfig";

const MaterialButtonContainer = () => {
	const navigate = useNavigate();
	const { id: classroomId } = useParams();

	const navigateToClassroomPage = () => {
		navigate(buildRoute.classroom(classroomId));
	};

	return (
		<HeaderItem
			// label="material"
			icon={NotebookTabs}
			handleClick={navigateToClassroomPage}
		/>
	);
};

export default MaterialButtonContainer;
