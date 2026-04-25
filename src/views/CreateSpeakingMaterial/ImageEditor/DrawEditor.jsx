import { useEffect, useRef, useState } from "react";
import DrawingOverlay from "../../../components/DrawingOverlay";
import Lucide from "../../../components/LucideIcons";
import styles from "./ImageEditor.module.css";

// Props:
// croppedImageUrl: string
// highlightData: object
// onHighlightChange: fn
// onClearDrawing: fn
// drawingOverlayKey: any (optional — forces overlay remount when changed)
const DrawEditor = ({
	croppedImageUrl,
	highlightData,
	onHighlightChange,
	onClearDrawing,
	drawingOverlayKey,
}) => {
	const [shapeType, setShapeType] = useState("line");
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

	const selectShape = (type) => {
		setImageFocused(true);
		setShapeType(type);
	};

	if (!croppedImageUrl) return null;

	return (
		<div ref={editorRef}>
			<div className={styles.drawEditorLayout}>
				<div className={styles.drawCanvasDock}>
					<div className={styles.drawToolbarVertical}>
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
							onClick={() => {
								setImageFocused(true);
								if (onClearDrawing) onClearDrawing();
							}}
							title="Clear Drawing"
						>
							<Lucide.Eraser size={18} />
						</button>
					</div>
					<div className={styles.image_cropper_container}>
						<DrawingOverlay
							key={drawingOverlayKey}
							imageUrl={croppedImageUrl}
							width={400}
							height={400}
							maxWidth={400}
							focused={imageFocused}
							highlightData={highlightData}
							onChange={onHighlightChange}
							shapeType={shapeType}
							setShapeType={setShapeType}
							onInteract={() => setImageFocused(true)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DrawEditor;
