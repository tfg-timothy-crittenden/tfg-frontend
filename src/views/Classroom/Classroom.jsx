import {
	useParams,
	useOutletContext,
	useNavigate,
	useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import SpeakingPart1Container from "@/views/SpeakingPart1/SpeakingPart1Container";
import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";
import SpeakingPart3Container from "@/views/SpeakingPart3/SpeakingPart3Container";
import SpeakingPart4Container from "@/views/SpeakingPart4/SpeakingPart4Container";
import TestInstructions from "@/components/TestInstructions/TestInstructions";
import TestSelectionWelcome from "@/components/TestSelectionWelcome/TestSelectionWelcome";

import QuestionToggleSwitch from "../../components/QuestionToggleSwitch/QuestionToggleSwitch";

import ResponsiveNavigation from "@/components/ResponsiveNavigation/ResponsiveNavigation";
import ViewClassMembers from "@/components/ViewClassMembers/ViewClassMembers";
import ClassroomHeader from "@/components/ClassroomHeader/ClassroomHeader";

import useResponsiveLayout from "@/hooks/useResponsiveLayout";
import { routeMatchers, buildRoute } from "@/routes/routeConfig";

import style from "./Classroom.module.css";

const Classroom = () => {
	const [showMaterial, setShowMaterial] = useState(true);
	const [navExpanded, setNavExpanded] = useState(false);
	const { isMobile } = useResponsiveLayout();

	const { partNumber, testId } = useParams();
	console.log("PartNumber: ", partNumber);
	const { classrooms } = useOutletContext();
	const navigate = useNavigate();
	const location = useLocation();

	// Find current classroom for welcome message
	const { id: classroomId } = useParams();
	const currentClassroom = classrooms?.find(
		(c) => String(c.id) === String(classroomId)
	);

	// Auto-expand navigation when test is selected
	useEffect(() => {
		if (testId && partNumber && isMobile) {
			setNavExpanded(true);
		} else if (!testId && isMobile) {
			setNavExpanded(false);
		}
	}, [testId, partNumber, isMobile]);

	const handleClassroomChange = (newClassroomId) => {
		if (partNumber && testId) {
			navigate(buildRoute.testPart(newClassroomId, testId, partNumber));
		} else {
			navigate(buildRoute.classroom(newClassroomId));
		}
	};

	const isMembersRoute = routeMatchers.isClassroomMembers(location.pathname);

	const renderPart = () => {
		// Show welcome message when no test is selected
		if (!testId) {
			return <TestSelectionWelcome classroomName={currentClassroom?.name} />;
		}

		// Check if we're on the global instructions route
		if (routeMatchers.isGlobalInstructions(window.location.pathname)) {
			return <TestInstructions />;
		}

		switch (partNumber) {
			case "1":
				return <SpeakingPart1Container />;
			case "2":
				return <SpeakingPart2Container />;
			case "3":
				return <SpeakingPart3Container />;
			case "4":
				return <SpeakingPart4Container />;
			default:
				return <span>partNumber was not provided</span>;
		}
	};

	return (
		<main className={style.classroom_layout}>
			{/* Sidebar */}
			<div className={style.sidebar}>
				<ResponsiveNavigation
					navExpanded={navExpanded}
					setNavExpanded={setNavExpanded}
					classrooms={classrooms}
					onClassroomChange={handleClassroomChange}
					setShowMaterial={setShowMaterial}
					showMaterial={showMaterial}
					showButtonText={navExpanded}
				/>
			</div>

			{/* Classroom Selector */}
			<ClassroomHeader
				classrooms={classrooms}
				onClassroomChange={handleClassroomChange}
			/>

			{/* Main Content */}
			<div
				className={`${style.main_content} ${
					navExpanded ? style.sidebar_open : ""
				}`}
			>
				{/* Question Toggle (Desktop only) - MOVED OUTSIDE content wrapper */}
				{!isMobile && testId && (
					<>
						<QuestionToggleSwitch />
					</>
				)}
				{isMembersRoute ? (
					<ViewClassMembers />
				) : showMaterial ? (
					renderPart()
				) : (
					<ViewClassMembers />
				)}
			</div>
		</main>
	);
};

export default Classroom;
