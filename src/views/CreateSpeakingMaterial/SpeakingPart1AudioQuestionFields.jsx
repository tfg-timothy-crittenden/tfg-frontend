import { useState, useEffect } from "react";
import styles from "./SpeakingPart1AudioQuestionFields.module.css";
import {
	AudioLines,
	FileAudio,
	AlertCircle,
} from "../../components/LucideMinimal";

const SpeakingPart1AudioQuestionFields = ({
	idx,
	number,
	register,
	errors,
	selectedAudioFile,
}) => {
	const [audioUrl, setAudioUrl] = useState("");

	useEffect(() => {
		if (selectedAudioFile && selectedAudioFile[0]) {
			const url = URL.createObjectURL(selectedAudioFile[0]);
			setAudioUrl(url);
			return () => URL.revokeObjectURL(url);
		} else {
			setAudioUrl("");
		}
	}, [selectedAudioFile]);

	return (
		<div className={styles.questionField}>
			{/* <div className={styles.questionNumber}>
				<AudioLines size={20} strokeWidth={2.2} />
				Question {number}
			</div> */}
			<label className={styles.inputLabel}>
				<FileAudio size={18} strokeWidth={2} /> Transcript Text
				<input
					type="text"
					className={styles.textInput}
					{...register(`questions.${idx}.transcriptText`, {
						required: true,
					})}
				/>
			</label>
			<label className={styles.inputLabel}>
				<AudioLines size={18} strokeWidth={2} /> Audio
				<input
					type="file"
					accept="audio/*"
					className={styles.fileInput}
					{...register(`questions.${idx}.audio`, { required: true })}
				/>
			</label>
			{errors?.questions?.[idx]?.audio && (
				<span className={styles.error}>
					<AlertCircle size={16} strokeWidth={2.2} /> Audio {number} is required
				</span>
			)}
			{audioUrl && (
				<audio controls src={audioUrl} className={styles.audioPlayer} />
			)}
		</div>
	);
};

export default SpeakingPart1AudioQuestionFields;
