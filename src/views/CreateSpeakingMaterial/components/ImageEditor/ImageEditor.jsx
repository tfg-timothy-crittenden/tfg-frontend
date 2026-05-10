import { useEffect, useRef, useState } from "react";
import ImageCropper from "@/components/ImageCropper";
import DrawingOverlay from "@/components/DrawingOverlay";
import Lucide from "@/components/LucideIcons";
import styles from "./ImageEditor.module.css";

// Props:
// imageUrl: string
// cropping: boolean
// setCropping: fn
// croppedImageUrl: string
// setCroppedImageUrl: fn
// croppedAreaPixels: object
// setCroppedAreaPixels: fn
// highlightData: object
// onHighlightChange: fn
// drawingOverlayKey: string
// getCroppedImg: fn
// waitForImageLoad: fn

const ImageEditor = ({
	imageUrl,
	cropping,
	setCropping,
	croppedImageUrl,
	setCroppedImageUrl,
	croppedAreaPixels,
	setCroppedAreaPixels,
	highlightData,
	onHighlightChange,
	drawingOverlayKey,
	getCroppedImg,
	waitForImageLoad,
	onClearDrawing,
}) => {
	// Cropper state
	const [zoom, setZoom] = useState(1);
	// DrawingOverlay state
	const [shapeType, setShapeType] = useState("line");
	const [imageFocused, setImageFocused] = useState(false);
	const editorRef = useRef(null);
	const logicalOverlaySize = 400;
	const editorMaxSize = 400;

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

	// Toolbar actions
	const handleApplyCrop = async () => {
		if (!croppedAreaPixels) return;
		const url = await getCroppedImg(imageUrl, croppedAreaPixels);
		await waitForImageLoad(url);
		setCroppedImageUrl(url);
		setCropping(false);
	};
	const handleCancelCrop = () => setCropping(false);
	const handleStartCrop = () => {
		setImageFocused(true);
		setCropping(true);
	};
	// Call parent to clear drawing
	const handleClearDrawing = () => {
		setImageFocused(true);
		if (onClearDrawing) onClearDrawing();
	};

	const selectShape = (nextShapeType) => {
		setImageFocused(true);
		setShapeType(nextShapeType);
	};

	return (
		<div ref={editorRef}>
			{/* Show cropper if no image is selected or if cropping is active */}
			{!imageUrl || cropping ? (
				<div className={styles.image_cropper_container}>
					{imageUrl ? (
						<ImageCropper
							imageUrl={imageUrl}
							aspect={1}
							zoom={zoom}
							maxSize={editorMaxSize}
							focused={imageFocused}
							setZoom={setZoom}
							onInteract={() => setImageFocused(true)}
							onCropComplete={async (area) => {
								setCroppedAreaPixels(area);
							}}
						/>
					) : (
						<img
							src={"/assets/Placeholder_view_vector.svg.png"}
							alt="No image selected"
							style={{
								width: "100%",
								maxWidth: editorMaxSize,
								aspectRatio: "1 / 1",
								height: "auto",
								objectFit: "contain",
								background: "#f3f6fa",
								borderRadius: 8,
							}}
						/>
					)}
					{/* Show cropper toolbar only if cropping and image is selected */}
					{cropping && imageUrl && (
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
								className={styles.toolbar_icon_button + " " + styles.apply_crop}
								onClick={handleApplyCrop}
								title="Apply Crop"
							>
								<Lucide.Check size={18} />
							</button>
							<button
								type="button"
								className={
									styles.toolbar_icon_button + " " + styles.cancel_crop
								}
								onClick={handleCancelCrop}
								title="Cancel Crop"
							>
								<Lucide.X size={18} />
							</button>
						</div>
					)}
				</div>
			) : null}

			{/* Show DrawingOverlay and toolbar only after image is cropped and selected */}
			{imageUrl && !cropping && croppedImageUrl && (
				<>
					<div className={styles.image_cropper_container}>
						<DrawingOverlay
							key={drawingOverlayKey}
							imageUrl={croppedImageUrl}
							width={logicalOverlaySize}
							height={logicalOverlaySize}
							maxWidth={editorMaxSize}
							focused={imageFocused}
							highlightData={highlightData}
							onChange={onHighlightChange}
							shapeType={shapeType}
							setShapeType={setShapeType}
							onInteract={() => setImageFocused(true)}
						/>
					</div>
					<div className={styles.cropper_buttons_container}>
						<button
							type="button"
							className={styles.toolbar_icon_button}
							onClick={handleStartCrop}
							title="Crop / Zoom Image"
						>
							<Lucide.Crop size={18} />
						</button>
						<button
							type="button"
							className={
								styles.toolbar_icon_button +
								(shapeType === "line" ? " " + styles.active : "")
							}
							onClick={() => selectShape("line")}
							title="Line"
						>
							<Lucide.PenLine size={18} />
						</button>
						<button
							type="button"
							className={
								styles.toolbar_icon_button +
								(shapeType === "rect" ? " " + styles.active : "")
							}
							onClick={() => selectShape("rect")}
							title="Rectangle"
						>
							<Lucide.Square size={18} />
						</button>
						<button
							type="button"
							className={
								styles.toolbar_icon_button +
								(shapeType === "circle" ? " " + styles.active : "")
							}
							onClick={() => selectShape("circle")}
							title="Circle"
						>
							<Lucide.Circle size={18} />
						</button>
						<button
							type="button"
							className={styles.toolbar_icon_button}
							onClick={handleClearDrawing}
							title="Clear Drawing"
						>
							<Lucide.Eraser size={18} />
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default ImageEditor;
