import { useEffect, useRef, useState } from "react";
import ImageCropper from "../../../components/ImageCropper";
import Lucide from "../../../components/LucideIcons";
import styles from "./ImageEditor.module.css";

const OUTPUT_SIZE = 400;

function createImageEl(url) {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		img.addEventListener("load", () => resolve(img));
		img.addEventListener("error", (err) => reject(err));
		img.setAttribute("crossOrigin", "anonymous");
		img.src = url;
	});
}

function waitForLoad(url) {
	return new Promise((resolve) => {
		const img = new window.Image();
		img.onload = () => resolve();
		img.src = url;
	});
}

async function cropToSquare(imageSrc, crop) {
	const image = await createImageEl(imageSrc);
	const canvas = document.createElement("canvas");
	canvas.width = OUTPUT_SIZE;
	canvas.height = OUTPUT_SIZE;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(
		image,
		crop.x,
		crop.y,
		crop.width,
		crop.height,
		0,
		0,
		OUTPUT_SIZE,
		OUTPUT_SIZE,
	);
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) return resolve("");
			resolve(URL.createObjectURL(blob));
		}, "image/jpeg");
	});
}

// Props:
// imageUrl: string — original image URL
// onCropConfirmed: fn(croppedUrl) — called after the user confirms the crop
const CropEditor = ({ imageUrl, onCropConfirmed }) => {
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [imageFocused, setImageFocused] = useState(false);
	const editorRef = useRef(null);

	useEffect(() => {
		const handleOutsidePointer = (event) => {
			if (!editorRef.current) return;
			if (!editorRef.current.contains(event.target)) {
				setImageFocused(false);
			}
		};
		document.addEventListener("mousedown", handleOutsidePointer);
		document.addEventListener("touchstart", handleOutsidePointer, {
			passive: true,
		});
		return () => {
			document.removeEventListener("mousedown", handleOutsidePointer);
			document.removeEventListener("touchstart", handleOutsidePointer);
		};
	}, []);

	const handleApply = async () => {
		if (!croppedAreaPixels) return;
		const url = await cropToSquare(imageUrl, croppedAreaPixels);
		await waitForLoad(url);
		onCropConfirmed(url);
	};

	if (!imageUrl) return null;

	return (
		<div ref={editorRef}>
			<div className={styles.image_cropper_container}>
				<ImageCropper
					imageUrl={imageUrl}
					aspect={1}
					zoom={zoom}
					maxSize={OUTPUT_SIZE}
					focused={imageFocused}
					setZoom={setZoom}
					onInteract={() => setImageFocused(true)}
					onCropComplete={(area) => setCroppedAreaPixels(area)}
				/>
			</div>
			<div className={styles.cropper_buttons_container}>
				<button
					type="button"
					className={styles.toolbar_icon_button}
					onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
					title="Zoom Out"
				>
					<Lucide.ZoomOut size={20} />
				</button>
				<input
					type="range"
					min={1}
					max={3}
					step={0.01}
					value={zoom}
					onChange={(e) => setZoom(Number(e.target.value))}
					className={styles.zoom_slider}
					aria-label="Zoom"
				/>
				<button
					type="button"
					className={styles.toolbar_icon_button}
					onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
					title="Zoom In"
				>
					<Lucide.ZoomIn size={20} />
				</button>
				<button
					type="button"
					className={`${styles.toolbar_icon_button} ${styles.apply_crop}`}
					onClick={handleApply}
					title="Confirm Crop"
				>
					<Lucide.Check size={18} />
				</button>
			</div>
		</div>
	);
};

export default CropEditor;
