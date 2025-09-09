import { useNavigate, useParams } from "react-router-dom";
import HeaderItem from "@/components/HeaderItem/HeaderItem";
import { UsersRound } from "lucide-react";
import { buildRoute } from "@/routes/routeConfig";

const JoinCodeButtonContainer = () => {
	const navigate = useNavigate();
	const { id: classroomId } = useParams();

	const navigateToMembersPage = () => {
		navigate(buildRoute.classroomMembers(classroomId));
	};

	return (
		<HeaderItem
			// label="members"
			icon={UsersRound}
			handleClick={navigateToMembersPage}
		/>
	);
};

export default JoinCodeButtonContainer;
