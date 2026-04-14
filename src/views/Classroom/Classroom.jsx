import {
	useParams,
	useOutletContext,
	useNavigate,
	useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import ListenRepeatContainer from "@/views/ListenRepeat/ListenRepeatContainer";
import Interview from "@/views/Interview/Interview";
import TestInstructions from "@/components/TestInstructions/TestInstructions";
import TestSelectionWelcome from "@/components/TestSelectionWelcome/TestSelectionWelcome";

import QuestionToggleSwitch from "@/components/QuestionToggleSwitch/QuestionToggleSwitch";

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

	const { partNumber, sectionId, questionNumber } = useParams();
	console.log("PartNumber: ", partNumber);
	const { classrooms } = useOutletContext();
	const navigate = useNavigate();
	const location = useLocation();

	// Find current classroom for welcome message
	const { id: classroomId } = useParams();
	const currentClassroom = classrooms?.find(
		(c) => String(c.id) === String(classroomId),
	);

	// Auto-expand navigation when test is selected
	useEffect(() => {
		if (sectionId && partNumber && isMobile) {
			setNavExpanded(true);
		} else if (!sectionId && isMobile) {
			setNavExpanded(false);
		}
	}, [sectionId, partNumber, isMobile]);

	const handleClassroomChange = (newClassroomId) => {
		if (partNumber && sectionId) {
			navigate(buildRoute.sectionPart(newClassroomId, sectionId, partNumber));
		} else {
			navigate(buildRoute.classroom(newClassroomId));
		}
	};

	const isMembersRoute = routeMatchers.isClassroomMembers(location.pathname);

	const renderPart = () => {
		// Show welcome message when no test is selected
		if (!sectionId) {
			return <TestSelectionWelcome classroomName={currentClassroom?.name} />;
		}

		// Check if we're on the global instructions route
		if (routeMatchers.isGlobalInstructions(window.location.pathname)) {
			return <TestInstructions />;
		}

		if (partNumber === "1") {
			return Number(questionNumber) >= 1 && Number(questionNumber) <= 7 ? (
				<ListenRepeatContainer />
			) : (
				<span>Invalid question number</span>
			);
		}

		if (partNumber === "2") {
			return Number(questionNumber) >= 1 && Number(questionNumber) <= 4 ? (
				<Interview />
			) : (
				<span>Invalid question number</span>
			);
		}

		return <span>Invalid part number</span>;
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
				{!isMobile && sectionId && (
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
