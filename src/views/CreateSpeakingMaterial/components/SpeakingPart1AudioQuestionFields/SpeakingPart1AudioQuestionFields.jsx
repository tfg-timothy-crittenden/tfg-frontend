import AudioDropzone from "../AudioDropzone/AudioDropzone";
import styles from "./SpeakingPart1AudioQuestionFields.module.css";
import { AlertCircle, Mic, AlignLeft } from "../../../../components/LucideMinimal";

const SpeakingPart1AudioQuestionFields = ({
	idx,
	number,
	register,
	errors,
	selectedAudioFile,
	existingAudioUrl,
	fieldPathPrefix = "questions",
	requireAudio = true,
}) => {
	const fieldErrors = errors?.[fieldPathPrefix]?.[idx];
	const transcriptPath = `${fieldPathPrefix}.${idx}.transcriptText`;
	const audioPath = `${fieldPathPrefix}.${idx}.audio`;

	return (
		<div className={styles.questionField}>
			<div className={styles.fieldRow}>
				<div className={styles.fieldLabelCol}>
					<AlignLeft size={18} strokeWidth={2} className={styles.fieldIcon} />
					<span className={styles.fieldLabel}>Transcript Text</span>
				</div>
				<div className={styles.fieldContentCol}>
					<textarea
						id={`${fieldPathPrefix}-question-transcript-${idx}`}
						className={styles.textArea}
						placeholder="Enter the transcript for this question..."
						{...register(transcriptPath, {
							required: true,
						})}
					/>
					{fieldErrors?.transcriptText && (
						<span className={styles.error}>
							<AlertCircle size={14} strokeWidth={2.2} /> Transcript is required
						</span>
					)}
				</div>
			</div>
			<div className={styles.fieldDivider} />
			<div className={styles.fieldRow}>
				<div className={styles.fieldLabelCol}>
					<Mic size={18} strokeWidth={2} className={styles.fieldIcon} />
					<span className={styles.fieldLabel}>Audio</span>
				</div>
				<div className={styles.fieldContentCol}>
					<AudioDropzone
						id={`${fieldPathPrefix}-question-audio-${idx}`}
						registration={register(audioPath, {
							required: requireAudio,
						})}
						selectedFile={selectedAudioFile}
						existingAudioUrl={existingAudioUrl}
						ariaInvalid={!!fieldErrors?.audio}
						showLabel={false}
					/>
					{fieldErrors?.audio && (
						<span className={styles.error}>
							<AlertCircle size={14} strokeWidth={2.2} /> Audio {number} is
							required
						</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default SpeakingPart1AudioQuestionFields;
