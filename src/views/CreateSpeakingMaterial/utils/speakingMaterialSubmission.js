export const toAlertErrorMessage = (fallbackLabel, error) =>
	`${fallbackLabel}: ${error?.response?.data?.message || error?.message || "Unknown error"}`;

export const buildSubmissionData = async ({
	data,
	croppedImageFile,
	croppedImageUrl,
	selectedImage,
}) => {
	const submissionData = { ...data };

	if (croppedImageFile) {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(croppedImageFile);
		submissionData.image = Array.from(dataTransfer.files);
	} else if (croppedImageUrl) {
		try {
			const blob = await fetch(croppedImageUrl).then((res) => res.blob());
			const croppedFile = new File([blob], "cropped-image.png", {
				type: blob.type || "image/png",
			});
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(croppedFile);
			submissionData.image = Array.from(dataTransfer.files);
		} catch {
			// Fall back to selected image if crop conversion fails.
		}
	}

	if (!submissionData.image?.[0] && selectedImage?.[0]) {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(selectedImage[0]);
		submissionData.image = Array.from(dataTransfer.files);
	}

	return submissionData;
};
