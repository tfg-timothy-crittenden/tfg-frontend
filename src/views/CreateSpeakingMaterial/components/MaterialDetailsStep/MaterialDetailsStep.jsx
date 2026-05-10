import { Type } from "lucide-react";

import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const MaterialDetailsStep = ({ form, navigation }) => {
	const { register, errors, materialInfoValid } = form;
	const { goToNextStep } = navigation;

	return (
		<div className={styles.section}>
			<div className={styles.step3_fields_card}>
				<div className={styles.fields_inner}>
					<label htmlFor="materialTitle" className={styles.label}>
						<span className={styles.label_text_row}>
							<Type size={16} className={styles.label_icon} />
							Material Title
						</span>
						<input
							type="text"
							{...register("materialTitle", { required: true })}
							id="materialTitle"
							className={styles.text_input}
							aria-invalid={!!errors.materialTitle}
						/>
						{errors.materialTitle && (
							<span className={styles.error}>Title is required</span>
						)}
					</label>
					<label htmlFor="materialDescription" className={styles.label}>
						Material Description
						<input
							type="text"
							{...register("materialDescription")}
							id="materialDescription"
							className={styles.text_input}
						/>
					</label>
					<input type="hidden" {...register("removedExistingPartImage")} />
					<input type="hidden" {...register("materialId")} />
				</div>
			</div>
			<div className={styles.step_actions_right}>
				<button
					type="button"
					onClick={goToNextStep}
					disabled={!materialInfoValid}
					className={`${styles.submit_button} ${styles.step_action_button}`}
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default MaterialDetailsStep;
