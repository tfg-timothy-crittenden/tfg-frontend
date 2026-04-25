import { useRef, useState } from "react";

/**
 * DrawingOverlay (fully controlled)
 * Props:
 * - imageUrl: string (required)
 * - width: number (optional, default 600)
 * - height: number (optional, default 400)
 * - highlightData: { viewBox: [w, h], ds: [string] } (required, source of truth)
 * - onChange: function({ viewBox, ds }) (called when drawing changes)
 * - shapeType: string ("line" | "rect" | "circle")
 * - setShapeType: function
 * - clearSignal: number (increments to clear)
 */
export default function DrawingOverlay({
	imageUrl,
	width = 400,
	height = 400,
	maxWidth = 620,
	focused = false,
	highlightData,
	onChange,
	shapeType = "line",
	setShapeType,
	clearSignal,
	onInteract,
}) {
	const svgRef = useRef(null);
	const [drawing, setDrawing] = useState(false);
	const [startPoint, setStartPoint] = useState(null);
	const [currentShape, setCurrentShape] = useState(null); // {type, start, end}

	// Clear drawing when clearSignal changes
	// (parent should update highlightData.ds to [] on clear)
	// No internal paths state

	const logicalWidth = highlightData?.viewBox?.[0] || width;
	const logicalHeight = highlightData?.viewBox?.[1] || height;

	const getPoint = (e) => {
		const rect = svgRef.current.getBoundingClientRect();
		let x, y;
		if (e.touches) {
			x = e.touches[0].clientX - rect.left;
			y = e.touches[0].clientY - rect.top;
		} else {
			x = e.clientX - rect.left;
			y = e.clientY - rect.top;
		}

		// Convert pointer position from rendered pixels to logical viewBox coords.
		const scaleX = logicalWidth / rect.width;
		const scaleY = logicalHeight / rect.height;
		return [x * scaleX, y * scaleY];
	};

	const handlePointerDown = (e) => {
		if (onInteract) onInteract();
		const [x, y] = getPoint(e);
		setStartPoint([x, y]);
		setCurrentShape({ type: shapeType, start: [x, y], end: [x, y] });
		setDrawing(true);
	};

	const handlePointerMove = (e) => {
		if (!drawing || !startPoint) return;
		const [x, y] = getPoint(e);
		setCurrentShape((prev) => ({ ...prev, end: [x, y] }));
	};

	const handlePointerUp = () => {
		if (!drawing || !currentShape) return;
		setDrawing(false);
		setStartPoint(null);
		const d = getShapePath(currentShape);
		const prevDs = highlightData?.ds || [];
		const newDs = d ? [...prevDs, d] : prevDs;
		if (onChange)
			onChange({ viewBox: [logicalWidth, logicalHeight], ds: newDs });
		setCurrentShape(null);
	};

	const paths = highlightData?.ds || [];

	// SVG path for a shape object
	function getShapePath(shape) {
		if (!shape) return "";
		const { type, start, end } = shape;
		if (type === "line") {
			return `M${start[0]} ${start[1]} L${end[0]} ${end[1]}`;
		} else if (type === "rect") {
			const [x1, y1] = start;
			const [x2, y2] = end;
			return `M${x1} ${y1} H${x2} V${y2} H${x1} Z`;
		} else if (type === "circle") {
			const [x1, y1] = start;
			const [x2, y2] = end;
			const cx = (x1 + x2) / 2;
			const cy = (y1 + y2) / 2;
			const rx = Math.abs(x2 - x1) / 2;
			const ry = Math.abs(y2 - y1) / 2;
			return `M${cx - rx},${cy} A${rx},${ry} 0 1,0 ${cx + rx},${cy} A${rx},${ry} 0 1,0 ${cx - rx},${cy}`;
		}
		return "";
	}

	return (
		<div>
			<div
				style={{
					width: "100%",
					maxWidth,
					margin: "0 auto",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<div style={{ position: "relative", width: "100%" }}>
					<svg
						ref={svgRef}
						width="100%"
						viewBox={`0 0 ${logicalWidth} ${logicalHeight}`}
						style={{
							display: "block",
							height: "auto",
							background: "#fff",
							borderRadius: 8,
							cursor: "crosshair",
							boxShadow: focused
								? "0 0 0 3px rgba(74, 123, 160, 0.45), 0 2px 8px #0001"
								: "0 2px 8px #0001",
							margin: 0,
							padding: 0,
						}}
						onMouseDown={handlePointerDown}
						onMouseMove={handlePointerMove}
						onMouseUp={handlePointerUp}
						onMouseLeave={handlePointerUp}
						onTouchStart={handlePointerDown}
						onTouchMove={handlePointerMove}
						onTouchEnd={handlePointerUp}
					>
						<image
							href={imageUrl}
							x="0"
							y="0"
							width={logicalWidth}
							height={logicalHeight}
						/>
						{paths.map((d, i) => (
							<path
								key={i}
								d={d}
								fill="none"
								stroke="#78C257"
								strokeWidth={4}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						))}
						{drawing && currentShape && (
							<path
								d={getShapePath(currentShape)}
								fill="none"
								stroke="#78C257"
								strokeWidth={4}
								strokeLinecap="round"
								strokeLinejoin="round"
								opacity={0.7}
							/>
						)}
					</svg>
				</div>
			</div>
		</div>
	);
}
