import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

/**
 * ImageCropper
 * Props:
 * - imageUrl: string (required)
 * - aspect: number (optional, default 3/2)
 * - zoom: number (controlled)
 * - setZoom: function (controlled)
 * - onCropComplete: function(croppedAreaPixels, croppedImageUrl)
 */
function ImageCropper({
	imageUrl,
	aspect = 3 / 2,
	zoom = 1,
	setZoom,
	maxSize = 620,
	focused = false,
	onInteract,
	onCropComplete,
}) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [imageInfo, setImageInfo] = useState(null);

	// When imageUrl changes, load image and set crop/zoom if square
	useEffect(() => {
		if (!imageUrl) return;
		const img = new window.Image();
		img.onload = () => {
			setImageInfo({ width: img.naturalWidth, height: img.naturalHeight });
			// If image is square, set zoom to 1 and crop to center
			if (img.naturalWidth === img.naturalHeight && setZoom) {
				setZoom(1);
				setCrop({ x: 0, y: 0 });
			}
		};
		img.src = imageUrl;
	}, [imageUrl, setZoom]);

	const onCropCompleteCb = useCallback(
		(_, croppedAreaPixels) => {
			setCroppedAreaPixels(croppedAreaPixels);
			if (onCropComplete) onCropComplete(croppedAreaPixels);
		},
		[onCropComplete],
	);

	return (
		<div
			onMouseDown={onInteract}
			onTouchStart={onInteract}
			style={{
				width: "100%",
				maxWidth: maxSize,
				aspectRatio: "1 / 1",
				position: "relative",
			}}
		>
			<Cropper
				image={imageUrl}
				crop={crop}
				zoom={zoom}
				aspect={1}
				style={{
					containerStyle: {
						cursor: "crosshair",
					},
					mediaStyle: focused
						? {
								boxShadow: "0 0 0 3px rgba(74, 123, 160, 0.45)",
								borderRadius: "8px",
								cursor: "crosshair",
							}
						: {
								cursor: "crosshair",
							},
				}}
				onCropChange={setCrop}
				onZoomChange={setZoom}
				onCropComplete={onCropCompleteCb}
			/>
		</div>
	);
}

export default ImageCropper;
