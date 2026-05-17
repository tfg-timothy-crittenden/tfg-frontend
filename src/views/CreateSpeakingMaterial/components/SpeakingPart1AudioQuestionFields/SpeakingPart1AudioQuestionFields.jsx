import AudioDropzone from "@/views/CreateSpeakingMaterial/components/AudioDropzone/AudioDropzone";
import styles from "./SpeakingPart1AudioQuestionFields.module.css";
import { AlertCircle, Mic, AlignLeft } from "@/components/LucideMinimal";

const SpeakingPart1AudioQuestionFields = ({
	idx,
	number,
	register,
	errors,
	selectedAudioFile,
	existingAudioUrl,
	fieldPathPrefix = "questions",
	requireAudio = true,
	onRemove,
}) => {
	console.log("[FIELDS] onRemove prop received:", typeof onRemove);

	// Wrap onRemove to log when called
	const handleRemove = () => {
		console.log("[FIELDS] onRemove called for idx", idx);
		if (typeof onRemove === "function") onRemove();
	};
	const fieldErrors = errors?.[fieldPathPrefix]?.[idx];
	const transcriptPath = `${fieldPathPrefix}.${idx}.transcriptText`;
	const audioPath = `${fieldPathPrefix}.${idx}.audio`;

	// Defensive: always ensure audio is an array in RHF

	// Accept either a selected file or an existing backend audio URL for validation
	// Accept either a selected file or an existing backend audio URL for validation,
	// but treat as missing if user has cleared the backend audio (via AudioDropzone)
	const customRegister = (path, options) => {
		// Use a ref to track if the backend audio has been cleared
		// (AudioDropzone will set a hidden input if cleared)
		const clearedKey = `audioCleared_${audioPath.replace(/\./g, "_")}`;
		const base = register(path, {
			...options,
			validate: (value) => {
				// Check for global cleared flag
				const cleared = typeof window !== "undefined" && window[clearedKey];
				if (cleared) return "Audio is required";
				if ((value && value.length > 0) || existingAudioUrl) return true;
				if (options && typeof options.validate === "function") {
					return options.validate(value);
				}
				return "Audio is required";
			},
		});
		return {
			...base,
			onChange: (e) => {
				let value = e?.target?.value;
				if (!Array.isArray(value)) value = value ? [value] : [];
				base.onChange({
					...e,
					target: {
						...e.target,
						value,
					},
				});
			},
		};
	};

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
						registration={customRegister(audioPath, {
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
