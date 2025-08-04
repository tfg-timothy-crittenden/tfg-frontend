import { useParams, useOutletContext, useNavigate } from "react-router-dom";

import SpeakingPart1Container from "@/views/SpeakingPart1/SpeakingPart1Container";
import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";
import SpeakingPart3Container from "@/views/SpeakingPart3/SpeakingPart3Container";
import SpeakingPart4Container from "@/views/SpeakingPart4/SpeakingPart4Container";

import QuestionToggleSwitch from "../../components/QuestionToggleSwitch/QuestionToggleSwitch";
import ClassroomHeader from "../../components/ClassroomHeader/ClassroomHeader";
import SideNavBar from "../../components/SideNavBar/SideNavBar";

import style from "./Classroom.module.css";

const Classroom = () => {
	const { partNumber, testId } = useParams();

	const { classrooms, partOneTopic } = useOutletContext();
	const navigate = useNavigate();

	const renderPart = () => {
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
				return <p>Invalid part</p>;
		}
	};

	const handleClassroomChange = (newClassroomId) => {
		navigate(
			`/my/classrooms/${newClassroomId}/test/${testId}/part/${partNumber}`
		);
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
			/>
			<div style={{ display: "flex", flex: 1, position: "relative" }}>
				<SideNavBar />
				<div className={style.test_wrapper}>
					<QuestionToggleSwitch />
					<div className={style.part_wrapper}>{renderPart()}</div>
				</div>
			</div>
		</div>
	);
};

export default Classroom;
