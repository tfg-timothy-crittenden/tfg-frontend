import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import CropEditor from "@/views/CreateSpeakingMaterial/components/ImageEditor/CropEditor";
import ImageDropzone from "@/views/CreateSpeakingMaterial/components/ImageDropzone/ImageDropzone";
import StepActionsRow from "@/views/CreateSpeakingMaterial/components/StepActionsRow/StepActionsRow";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const fileFromObjectUrl = async (objectUrl, fileName) => {
	const blob = await fetch(objectUrl).then((response) => response.blob());
	return new File([blob], fileName, { type: blob.type || "image/png" });
};

const Part1ImageStep = ({ controller }) => {
	const { form, state } = controller;

	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const part1Image = watch("part1Image");
	const part1ImageSource = watch("part1ImageSource");
	const [sourceImageUrl, setSourceImageUrl] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [showImagePicker, setShowImagePicker] = useState(!part1Image);

	useEffect(() => {
		if (!part1ImageSource) {
			setSourceImageUrl(null);
			return undefined;
		}

		const objectUrl = URL.createObjectURL(part1ImageSource);
		setSourceImageUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [part1ImageSource]);

	useEffect(() => {
		if (part1Image) setShowImagePicker(false);
	}, [part1Image]);

	useEffect(() => {
		if (part1Image instanceof File) {
			const objectUrl = URL.createObjectURL(part1Image);
			setPreviewUrl(objectUrl);
			return () => URL.revokeObjectURL(objectUrl);
		}

		setPreviewUrl(typeof part1Image === "string" ? part1Image : null);
		return () => {
			setPreviewUrl(null);
		};
	}, [part1Image]);

	const imageRegistration = {
		name: "part1ImagePicker",
		ref: () => {},
		onBlur: () => {},
		onChange: (event) => {
			const file = event?.target?.value?.[0] ?? null;
			setValue("part1ImageSource", file, {
				shouldDirty: false,
				shouldTouch: true,
			});
			setValue("part1Image", null, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		},
	};

	const clearImage = () => {
		setValue("part1ImageSource", null, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setValue("part1Image", null, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
		setShowImagePicker(true);
	};

	const handleCropConfirmed = async (croppedUrl) => {
		const file = await fileFromObjectUrl(
			croppedUrl,
			part1ImageSource?.name || "part-1-image.png",
		);
		setValue("part1Image", file, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
		setValue("part1ImageSource", null, {
			shouldDirty: false,
			shouldTouch: false,
		});
		setShowImagePicker(false);
	};

	return (
		<div className={styles.section}>
			<div className={styles.step3_fields_card}>
				<div className={styles.fields_inner}>
					<label htmlFor="part1Title" className={styles.label}>
						<span className={styles.label_text_row}>
							<MapPin size={16} className={styles.label_icon} />
							Part 1 Location
						</span>
						<input
							{...register("part1Title", { required: true })}
							id="part1Title"
							className={styles.text_input}
							aria-invalid={!!errors.part1Title}
						/>
						{errors.part1Title && (
							<span className={styles.error}>Part title is required</span>
						)}
					</label>
				</div>
			</div>

			<div className={styles.step3_image_card}>
				{part1ImageSource && sourceImageUrl ? (
					<>
						<div className={styles.cropper_instruction}>
							Crop the image to the area students should see, then confirm.
						</div>
						<CropEditor
							imageUrl={sourceImageUrl}
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
				) : previewUrl && !showImagePicker ? (
					<>
						<img
							src={previewUrl}
							alt="Current part image"
							className={styles.preview_image}
						/>
						<div className={styles.image_action_row}>
							<button
								type="button"
								className={styles.back_button}
								onClick={() => setShowImagePicker(true)}
							>
								Replace Image
							</button>
							<button
								type="button"
								className={styles.back_button}
								onClick={clearImage}
							>
								Remove Image
							</button>
						</div>
					</>
				) : (
					<>
						<ImageDropzone
							id="part1Image"
							registration={imageRegistration}
							selectedFile={part1ImageSource ? [part1ImageSource] : []}
							ariaInvalid={!!errors.part1Image}
						/>
						{errors.part1Image && (
							<span className={styles.error}>Image is required</span>
						)}
					</>
				)}
			</div>

			<StepActionsRow
				leftLabel="Back"
				leftOnClick={controller.previousStep}
				rightLabel="Next"
				rightOnClick={controller.nextStep}
				rightDisabled={!state.can({ type: "NEXT_STEP" })}
				rightType="button"
				styles={styles}
			/>
		</div>
	);
};

export default Part1ImageStep;
