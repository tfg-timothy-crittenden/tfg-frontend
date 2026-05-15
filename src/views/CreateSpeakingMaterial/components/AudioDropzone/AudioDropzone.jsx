import { useEffect, useRef, useState } from "react";
import { FileAudio, Mic, Square, X } from "lucide-react";

import styles from "./AudioDropzone.module.css";

const AudioDropzone = ({
	id,
	registration,
	selectedFile,
	existingAudioUrl = "",
	accept = "audio/*",
	helperText = "Files Supported: MP3, WAV, MP4A (max size 50mb)",
	ariaInvalid = false,
	showLabel = true,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingError, setRecordingError] = useState("");
	const [hasUserCleared, setHasUserCleared] = useState(false);
	const inputRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const mediaStreamRef = useRef(null);
	const recordedChunksRef = useRef([]);

	const { ref: registerRef, onChange, onBlur, name } = registration;
	const selectedAudio = selectedFile?.[0] || null;
	const fileName = selectedAudio?.name || "";
	const [audioUrl, setAudioUrl] = useState("");
	const _hasSelectedAudio = !!selectedAudio;
	// Only show existing audio if the user hasn't explicitly cleared it
	const displayAudioUrl = audioUrl || (hasUserCleared ? "" : existingAudioUrl);

	// Keep the native input ref and react-hook-form ref pointed at the same node.
	const setRefs = (node) => {
		inputRef.current = node;
		if (typeof registerRef === "function") {
			registerRef(node);
			return;
		}
		if (registerRef) {
			registerRef.current = node;
		}
	};

	// Push dropped or recorded files back through the hidden input so the form
	// still sees a normal file selection change. Always set as array for RHF.
	const pushFilesToForm = (files) => {
		const arr = Array.isArray(files) ? files : files ? [files] : [];
		onChange({
			target: {
				name,
				value: arr,
			},
			currentTarget: {
				name,
				value: arr,
			},
			type: "change",
		});
	};

	const applyFiles = (fileList) => {
		if (!inputRef.current || !fileList?.length) return;
		setHasUserCleared(false);
		// Reset the global cleared flag when a new file is added
		if (typeof window !== "undefined") {
			window[`audioCleared_${name.replace(/\./g, "_")}`] = false;
		}
		const dataTransfer = new DataTransfer();
		Array.from(fileList).forEach((file) => dataTransfer.items.add(file));
		inputRef.current.files = dataTransfer.files;
		pushFilesToForm(Array.from(dataTransfer.files));
	};

	const handleInputChange = (event) => {
		const files = Array.from(event.target.files || []);
		if (files.length > 0) {
			setHasUserCleared(false);
			// Reset the global cleared flag when a new file is added
			if (typeof window !== "undefined") {
				window[`audioCleared_${name.replace(/\./g, "_")}`] = false;
			}
		}
		pushFilesToForm(files);
	};

	useEffect(() => {
		return () => {
			// Stop any recording if the component unmounts mid-session.
			const recorder = mediaRecorderRef.current;
			if (recorder && recorder.state !== "inactive") {
				recorder.stop();
			}
			mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		};
	}, []);

	// Create a blob URL for in-dropzone playback; revoke it when the file changes.
	useEffect(() => {
		if (!selectedAudio) {
			setAudioUrl("");
			return;
		}
		const url = URL.createObjectURL(selectedAudio);
		setAudioUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedAudio]);

	const openPicker = () => {
		inputRef.current?.click();
	};

	const stopRecording = () => {
		const recorder = mediaRecorderRef.current;
		if (!recorder || recorder.state === "inactive") return;
		recorder.stop();
	};

	const startRecording = async () => {
		if (
			typeof navigator === "undefined" ||
			!navigator.mediaDevices?.getUserMedia ||
			typeof MediaRecorder === "undefined"
		) {
			setRecordingError(
				"This browser does not support in-browser audio recording.",
			);
			return;
		}

		setRecordingError("");

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
				? "audio/webm;codecs=opus"
				: "audio/webm";
			const recorder = new MediaRecorder(
				stream,
				mimeType ? { mimeType } : undefined,
			);

			mediaStreamRef.current = stream;
			mediaRecorderRef.current = recorder;
			recordedChunksRef.current = [];

			// MediaRecorder emits the recording in chunks; buffer them until stop.
			recorder.addEventListener("dataavailable", (event) => {
				if (event.data?.size) {
					recordedChunksRef.current.push(event.data);
				}
			});

			// Convert the recorded blob into a File so it behaves like an uploaded file.
			recorder.addEventListener("stop", () => {
				const blobType = recorder.mimeType || "audio/webm";
				const extension = blobType.includes("ogg")
					? "ogg"
					: blobType.includes("mp4")
						? "m4a"
						: "webm";
				const blob = new Blob(recordedChunksRef.current, { type: blobType });
				if (blob.size) {
					const file = new File(
						[blob],
						`recording-${Date.now()}.${extension}`,
						{
							type: blobType,
						},
					);
					applyFiles([file]);
				}
				recordedChunksRef.current = [];
				mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
				mediaStreamRef.current = null;
				mediaRecorderRef.current = null;
				setIsRecording(false);
			});

			recorder.start();
			setIsRecording(true);
		} catch (_error) {
			setRecordingError("Microphone access was denied or unavailable.");
			mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
			mediaStreamRef.current = null;
			mediaRecorderRef.current = null;
			setIsRecording(false);
		}
	};

	// Clear the current file and notify react-hook-form of the empty value.
	const clearFile = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setHasUserCleared(true);
		// Set a global flag for validation (used by hidden input in field component)
		if (typeof window !== "undefined") {
			window[`audioCleared_${name.replace(/\./g, "_")}`] = true;
		}
		if (!inputRef.current) return;
		inputRef.current.files = new DataTransfer().files;
		pushFilesToForm([]);
	};

	// The mic button owns recording; the rest of the dropzone still opens upload.
	const toggleRecording = async (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (isRecording) {
			stopRecording();
			return;
		}
		await startRecording();
		inputRef.current?.focus();
	};

	const handleDragOver = (event) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (event) => {
		event.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (event) => {
		event.preventDefault();
		setIsDragging(false);
		applyFiles(event.dataTransfer.files);
	};

	const handleKeyDown = (event) => {
		if (isRecording) return;
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		openPicker();
	};

	return (
		<div className={styles.container}>
			{showLabel && (
				<label className={styles.label} htmlFor={id}>
					Audio
				</label>
			)}
			{displayAudioUrl && !isRecording ? (
				<div className={styles.playerOnlyContainer}>
					<div className={styles.playerContainer}>
						<audio
							key={displayAudioUrl}
							controls
							preload="metadata"
							className={styles.audioPlayer}
						>
							<source
								src={displayAudioUrl}
								type={selectedAudio?.type || undefined}
							/>
							Your browser cannot play this audio file.
						</audio>
						<button
							type="button"
							className={styles.removeButton}
							onClick={clearFile}
							aria-label="Remove audio file"
						>
							<X size={13} strokeWidth={2.5} />
							Remove file
						</button>
					</div>
					<input
						id={id}
						type="file"
						name={name}
						accept={accept}
						ref={setRefs}
						onChange={handleInputChange}
						onBlur={onBlur}
						className={styles.hiddenInput}
						aria-invalid={ariaInvalid}
					/>
				</div>
			) : (
				<div
					className={`${styles.dropzone}${isDragging ? ` ${styles.dragging}` : ""}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={openPicker}
					onKeyDown={handleKeyDown}
					role="button"
					tabIndex={0}
					aria-label="Upload audio file"
				>
					{fileName ? (
						<div className={styles.fileBadge}>
							<FileAudio size={16} strokeWidth={2} />
							<span className={styles.fileName}>{fileName}</span>
						</div>
					) : null}
					<button
						type="button"
						className={`${styles.iconHaloButton}${isRecording ? ` ${styles.recording}` : ""}`}
						onClick={toggleRecording}
						aria-label={isRecording ? "Stop recording" : "Start recording"}
						title={isRecording ? "Stop recording" : "Record audio"}
					>
						<div className={styles.iconHalo}>
							{isRecording ? (
								<Square size={28} strokeWidth={2.4} />
							) : (
								<Mic size={32} strokeWidth={2.1} />
							)}
						</div>
					</button>
					<>
						<p className={styles.prompt}>
							{isRecording
								? "Recording in progress. Click the microphone again to stop."
								: "Drop your audio file here, or"}
							{isRecording ? null : (
								<span className={styles.browseText}> Browse</span>
							)}
							{isRecording ? null : <span> to upload</span>}
						</p>
						<p
							className={`${styles.helperText}${recordingError ? ` ${styles.errorText}` : ""}`}
						>
							{recordingError || helperText}
						</p>
					</>
					<input
						id={id}
						type="file"
						name={name}
						accept={accept}
						ref={setRefs}
						onChange={handleInputChange}
						onBlur={onBlur}
						className={styles.hiddenInput}
						aria-invalid={ariaInvalid}
					/>
				</div>
			)}
		</div>
	);
};

export default AudioDropzone;
