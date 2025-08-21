import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useState } from "react";
import SpeakingPart1Container from "@/views/SpeakingPart1/SpeakingPart1Container";
import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";
import SpeakingPart3Container from "@/views/SpeakingPart3/SpeakingPart3Container";
import SpeakingPart4Container from "@/views/SpeakingPart4/SpeakingPart4Container";
import TestInstructions from "@/components/TestInstructions/TestInstructions";
import TestSelectionWelcome from "@/components/TestSelectionWelcome/TestSelectionWelcome";

import QuestionToggleSwitch from "../../components/QuestionToggleSwitch/QuestionToggleSwitch";
import ClassroomHeader from "../../components/ClassroomHeader/ClassroomHeader";
import SideNavBar from "../../components/SideNavBar/SideNavBar";
import ViewClassMembers from "@/components/ViewClassMembers/ViewClassMembers";

import style from "./Classroom.module.css";

const Classroom = () => {
	const [showMaterial, setShowMaterial] = useState(true);

	const { partNumber, testId } = useParams();
	const { classrooms } = useOutletContext();
	const navigate = useNavigate();

	// Find current classroom for welcome message
	const { id: classroomId } = useParams();
	const currentClassroom = classrooms?.find(
		(c) => String(c.id) === String(classroomId)
	);

	const renderPart = () => {
		// Show welcome message when no test is selected
		if (!testId) {
			return <TestSelectionWelcome classroomName={currentClassroom?.name} />;
		}

		// Check if we're on the instructions route
		if (window.location.pathname.includes("/instructions")) {
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
				return <TestSelectionWelcome classroomName={currentClassroom?.name} />;
		}
	};

	const handleClassroomChange = (newClassroomId) => {
		// Navigate to welcome state when changing classrooms
		navigate(`/my/classrooms/${newClassroomId}`);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				position: "relative",
			}}
		>
			<ClassroomHeader
				classrooms={classrooms}
				onClassroomChange={handleClassroomChange}
				setShowMaterial={setShowMaterial}
				showMaterial={showMaterial}
			/>
			{showMaterial ? (
				<div style={{ display: "flex", flex: 1, position: "relative" }}>
					<SideNavBar />
					<div className={style.test_wrapper}>
						{/* Only show QuestionToggleSwitch when a test is selected */}
						{testId && <QuestionToggleSwitch />}
						<div className={style.part_wrapper}>{renderPart()}</div>
					</div>
				</div>
			) : (
				<div className={style.test_wrapper}>
					<ViewClassMembers />
				</div>
			)}
		</div>
	);
};

export default Classroom;
