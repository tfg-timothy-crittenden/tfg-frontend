import { useState, useEffect, useCallback } from "react";
import ImageCropper from "../../components/ImageCropper";
import DrawingOverlay from "../../components/DrawingOverlay";
import Lucide from "../../components/LucideIcons";
import styles from "./CreateSpeakingMaterial.module.css";

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

	// Toolbar actions
	const handleApplyCrop = async () => {
		if (!croppedAreaPixels) return;
		const url = await getCroppedImg(imageUrl, croppedAreaPixels);
		await waitForImageLoad(url);
		setCroppedImageUrl(url);
		setCropping(false);
	};
	const handleCancelCrop = () => setCropping(false);
	const handleStartCrop = () => setCropping(true);
	// Call parent to clear drawing
	const handleClearDrawing = () => {
		if (onClearDrawing) onClearDrawing();
	};

	return (
		<>
			<div className={styles.image_cropper_container}>
				{cropping ? (
					<ImageCropper
						imageUrl={imageUrl}
						aspect={1}
						zoom={zoom}
						setZoom={setZoom}
						onCropComplete={async (area) => {
							setCroppedAreaPixels(area);
						}}
					/>
				) : (
					croppedImageUrl && (
						<DrawingOverlay
							key={drawingOverlayKey}
							imageUrl={croppedImageUrl}
							width={400}
							height={400}
							highlightData={highlightData}
							onChange={onHighlightChange}
							shapeType={shapeType}
							setShapeType={setShapeType}
						/>
					)
				)}
			</div>
			{/* Unified toolbar below the image */}
			<div className={styles.cropper_buttons_container} style={{ gap: 12 }}>
				{cropping ? (
					<>
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
							style={{ width: 80 }}
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
							className={styles.toolbar_icon_button}
							style={{
								background: "#4a7ba0",
								color: "#fff",
								borderColor: "#4a7ba0",
							}}
							onClick={handleApplyCrop}
							title="Apply Crop"
						>
							<Lucide.Check size={18} />
						</button>
						<button
							type="button"
							className={styles.toolbar_icon_button}
							style={{
								background: "#e9ecef",
								color: "#333",
								borderColor: "#e9ecef",
							}}
							onClick={handleCancelCrop}
							title="Cancel Crop"
						>
							<Lucide.X size={18} />
						</button>
					</>
				) : (
					<>
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
							onClick={() => setShapeType("line")}
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
							onClick={() => setShapeType("rect")}
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
							onClick={() => setShapeType("circle")}
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
					</>
				)}
			</div>
		</>
	);
};

export default ImageEditor;
