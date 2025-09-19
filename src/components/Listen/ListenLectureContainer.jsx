import ListenPresentation from "./ListenPresentation";
import maleProfessor from "@/assets/male_professor.png";
import femaleProfessor from "@/assets/female_professor.png";

const ListenLectureContainer = ({ audio, voiceGender, listeningScript }) => {
	const image = voiceGender === "MALE" ? maleProfessor : femaleProfessor;

	return (
		<ListenPresentation
			audio={audio}
			image={image}
			listeningScript={listeningScript}
		/>
	);
};
export default ListenLectureContainer;
