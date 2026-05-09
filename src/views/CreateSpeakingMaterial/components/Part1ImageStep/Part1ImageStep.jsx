import { MapPin } from "lucide-react";

import CropEditor from "../ImageEditor/CropEditor";
import ImageDropzone from "../ImageDropzone/ImageDropzone";
import StepActionsRow from "../StepActionsRow/StepActionsRow";

import styles from "../../styles/CreateSpeakingMaterial.module.css";

const Part1ImageStep = ({ form, image, navigation }) => {
	const { register, errors, normalizedExistingMedia } = form;
	const {
		selectedImage,
		croppedImageUrl,
		imagePreviewUrl,
		hasExistingPartImage,
		showImagePicker,
		handleCropConfirmed,
		clearImage,
		replaceImage,
		recropImage,
		hasVisualPrompt,
	} = image;
	const { goToPrevStep, goToNextStep } = navigation;

	return (
		<div className={styles.section}>
			<div className={styles.step3_fields_card}>
				<div className={styles.fields_inner}>
					<label htmlFor="partTitle" className={styles.label}>
						<span className={styles.label_text_row}>
							<MapPin size={16} className={styles.label_icon} />
							Part 1 Location
						</span>
						<input
							{...register("partTitle", { required: true })}
							id="partTitle"
							className={styles.text_input}
							aria-invalid={!!errors.partTitle}
						/>
						{errors.partTitle && (
							<span className={styles.error}>Part title is required</span>
						)}
					</label>
				</div>
			</div>

			<div className={styles.step3_image_card}>
				{selectedImage?.[0] ? (
					croppedImageUrl ? (
						<>
							<img
								src={croppedImageUrl}
								alt="Confirmed crop preview"
								className={styles.preview_image}
							/>
							<div className={styles.image_action_row}>
								<button
									type="button"
									className={styles.back_button}
									onClick={recropImage}
								>
									Re-crop
								</button>
								<button
									type="button"
									className={styles.back_button}
									onClick={clearImage}
								>
									Change Image
								</button>
							</div>
						</>
					) : (
						<>
							<div className={styles.cropper_instruction}>
								Crop the image to the area students should see, then confirm.
							</div>
							<CropEditor
								imageUrl={imagePreviewUrl}
								onCropConfirmed={handleCropConfirmed}
							/>
							<button
								type="button"
								className={styles.back_button}
								onClick={clearImage}
							>
								Change Image
							</button>
						</>
					)
				) : hasExistingPartImage && !showImagePicker ? (
					<>
						<img
							src={normalizedExistingMedia.partImageUrl}
							alt="Current part image"
							className={styles.preview_image}
						/>
						<div className={styles.image_action_row}>
							<button
								type="button"
								className={styles.back_button}
								onClick={replaceImage}
							>
								Replace Image
							</button>
						</div>
					</>
				) : (
					<>
						<ImageDropzone
							id="image"
							registration={register("image", {
								required: !hasExistingPartImage,
							})}
							selectedFile={selectedImage}
							ariaInvalid={!!errors.image}
						/>
						{errors.image && (
							<span className={styles.error}>Image is required</span>
						)}
					</>
				)}
			</div>

			<StepActionsRow
				leftLabel="Back"
				leftOnClick={goToPrevStep}
				rightLabel="Next"
				rightOnClick={goToNextStep}
				rightDisabled={!hasVisualPrompt}
				rightType="button"
				styles={styles}
			/>
		</div>
	);
};

export default Part1ImageStep;