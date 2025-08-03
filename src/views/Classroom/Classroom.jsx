import { useParams } from "react-router-dom";
import SpeakingPart1Container from "@/views/SpeakingPart1/SpeakingPart1Container";
import SpeakingPart2Container from "@/views/SpeakingPart2/SpeakingPart2Container";
import SpeakingPart3Container from "@/views/SpeakingPart3/SpeakingPart3Container";
import SpeakingPart4Container from "@/views/SpeakingPart4/SpeakingPart4Container";
import QuestionToggleSwitch from "../../components/QuestionToggleSwitch/QuestionToggleSwitch";

import style from "./Classroom.module.css";

const Classroom = () => {
	const { partNumber } = useParams();

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

	return (
		<>
			<div className={style.test_wrapper}>
				<QuestionToggleSwitch />
				<div className={style.part_wrapper}>{renderPart()}</div>
			</div>
		</>
	);
};

export default Classroom;
