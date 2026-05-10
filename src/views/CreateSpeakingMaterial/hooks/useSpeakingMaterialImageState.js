import { useEffect, useState } from "react";

const useSpeakingMaterialImageState = (form) => {
	const { watch, setValue, normalizedExistingMedia } = form;

	const selectedImage = watch("image");
	const removedExistingPartImage = !!watch("removedExistingPartImage");

	const [showImagePicker, setShowImagePicker] = useState(
		!normalizedExistingMedia.partImageUrl,
	);
	const [imagePreviewUrl, setImagePreviewUrl] = useState("");
	const [croppedImageUrl, setCroppedImageUrl] = useState("");
	const [croppedImageFile, setCroppedImageFile] = useState(null);

	useEffect(() => {
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
		setValue("removedExistingPartImage", false, {
			shouldDirty: false,
			shouldTouch: false,
		});
	}, [normalizedExistingMedia.partImageUrl, setValue]);

	useEffect(() => {
		if (!selectedImage?.[0]) {
			setImagePreviewUrl("");
			return;
		}
		const objectUrl = URL.createObjectURL(selectedImage[0]);
		setImagePreviewUrl(objectUrl);
		setShowImagePicker(true);
		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedImage]);

	useEffect(() => {
		setCroppedImageUrl("");
		setCroppedImageFile(null);
	}, [imagePreviewUrl]);

	useEffect(() => {
		return () => {
			if (croppedImageUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(croppedImageUrl);
			}
		};
	}, [croppedImageUrl]);

	const hasExistingPartImage =
		!!normalizedExistingMedia.partImageUrl && !removedExistingPartImage;
	const hasPartImage = !!selectedImage?.[0] || hasExistingPartImage;
	const hasVisualPrompt =
		!!croppedImageUrl || (!selectedImage?.[0] && hasExistingPartImage);
	const activeVisualPromptUrl =
		croppedImageUrl ||
		(!selectedImage?.[0] ? normalizedExistingMedia.partImageUrl : "");

	const clearImage = () => {
		if (normalizedExistingMedia.partImageUrl) {
			setValue("removedExistingPartImage", true, {
				shouldDirty: true,
				shouldTouch: true,
			});
		}
		setValue("image", []);
		setCroppedImageUrl("");
		setCroppedImageFile(null);
		setImagePreviewUrl("");
		setShowImagePicker(true);
	};

	const replaceImage = () => {
		setValue("removedExistingPartImage", true, {
			shouldDirty: true,
			shouldTouch: true,
		});
		setShowImagePicker(true);
	};

	const recropImage = () => setCroppedImageUrl("");

	const resetImageUiToExistingState = () => {
		setValue("image", [], {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue("removedExistingPartImage", false, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setImagePreviewUrl("");
		setCroppedImageUrl("");
		setCroppedImageFile(null);
		setShowImagePicker(!normalizedExistingMedia.partImageUrl);
	};

	const handleCropConfirmed = async (newCroppedUrl) => {
		setCroppedImageUrl(newCroppedUrl);
		try {
			const blob = await fetch(newCroppedUrl).then((res) => res.blob());
			const file = new File([blob], "cropped-image.png", {
				type: blob.type || "image/png",
			});
			setCroppedImageFile(file);
		} catch {
			setCroppedImageFile(null);
		}
	};

	return {
		selectedImage,
		removedExistingPartImage,
		showImagePicker,
		imagePreviewUrl,
		croppedImageUrl,
		croppedImageFile,
		hasExistingPartImage,
		hasPartImage,
		hasVisualPrompt,
		activeVisualPromptUrl,
		setCroppedImageUrl,
		setCroppedImageFile,
		clearImage,
		replaceImage,
		recropImage,
		resetImageUiToExistingState,
		handleCropConfirmed,
	};
};

export default useSpeakingMaterialImageState;
