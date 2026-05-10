import { useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";

import styles from "./ImageDropzone.module.css";

const ImageDropzone = ({ id, registration, selectedFile, ariaInvalid = false }) => {
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef(null);

	const { ref: registerRef, onChange, onBlur, name } = registration;

	const selectedImage = selectedFile?.[0] || null;
	const fileName = selectedImage?.name || "";

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

	const pushFilesToForm = (files) => {
		onChange({
			target: { name, value: files },
			currentTarget: { name, value: files },
			type: "change",
		});
	};

	const applyFiles = (fileList) => {
		if (!inputRef.current || !fileList?.length) return;
		const dataTransfer = new DataTransfer();
		Array.from(fileList).forEach((file) => dataTransfer.items.add(file));
		inputRef.current.files = dataTransfer.files;
		pushFilesToForm(Array.from(dataTransfer.files));
	};

	const handleInputChange = (event) => {
		const files = Array.from(event.target.files || []);
		pushFilesToForm(files);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files).filter((f) =>
			f.type.startsWith("image/"),
		);
		if (files.length) applyFiles(files);
	};

	const handleClear = (e) => {
		e.stopPropagation();
		pushFilesToForm([]);
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div
			className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
			onClick={() => inputRef.current?.click()}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
			aria-invalid={ariaInvalid}
		>
			<input
				ref={setRefs}
				id={id}
				type="file"
				accept="image/*"
				className={styles.hidden_input}
				onChange={handleInputChange}
				onBlur={onBlur}
				name={name}
			/>

			{selectedImage ? (
				<div className={styles.file_badge}>
					<ImageIcon size={15} strokeWidth={2} />
					<span className={styles.file_name}>{fileName}</span>
					<button
						type="button"
						className={styles.clear_button}
						onClick={handleClear}
						aria-label="Remove image"
					>
						<X size={14} strokeWidth={2.5} />
					</button>
				</div>
			) : null}

			<div className={styles.icon_halo}>
				<ImageIcon size={30} strokeWidth={1.5} />
			</div>
			<p className={styles.prompt_text}>
				{selectedImage
					? "Drop a new image to replace, or click to browse"
					: "Drag & drop an image here, or click to browse"}
			</p>
			<p className={styles.helper_text}>Supported: JPG, PNG, WEBP, GIF</p>
		</div>
	);
};

export default ImageDropzone;
