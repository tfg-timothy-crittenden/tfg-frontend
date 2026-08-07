import Part1ImageStep from "@/views/CreateSpeakingMaterial/components/Part1ImageStep/Part1ImageStep";
import Part1QuestionsStep from "@/views/CreateSpeakingMaterial/components/Part1QuestionsStep/Part1QuestionsStep";
import Part2QuestionsStep from "@/views/CreateSpeakingMaterial/components/Part2QuestionsStep/Part2QuestionsStep";
import { useToeflSpeakingFormController } from "./useToeflSpeakingFormController";
import styles from "./ToeflSpeakingFormPage.module.css";

export function ToeflSpeakingFormPage({
	materialId,
}: { materialId?: number } = {}) {
	const controller = useToeflSpeakingFormController(materialId);
	const { form, state, context } = controller;

	//Step states
	const {
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,
	} = controller;

	return (
		<form className={styles.page}>
			<pre className={styles.debugPanel}>
				{JSON.stringify(state.value, null, 2)}
			</pre>
			<pre className={styles.debugPanel}>
				{JSON.stringify(context, null, 2)}
			</pre>

			{/* Material Details */}
			{isMaterialDetails && (
				<div className={styles.step}>
					<h1 className={styles.stepTitle}>Material Details</h1>
					<label className={styles.field}>
						Title
						<input
							className={styles.input}
							{...form.register("title")}
							placeholder="Material title"
						/>
					</label>
					<div className={styles.stepNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnPrimary}`}
							onClick={controller.nextStep}
							disabled={!state.can({ type: "NEXT_STEP" })}
						>
							Next →
						</button>
					</div>
				</div>
			)}

			{/* Part 1 Image */}
			{isPart1Image && <Part1ImageStep controller={controller} />}

			{/* Part 1 Questions */}
			{isPart1Questions && <Part1QuestionsStep controller={controller} />}

			{/* Part 2 Questions */}
			{isPart2Questions && <Part2QuestionsStep controller={controller} />}

			<div className={styles.globalActions}>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnSecondary}`}
					onClick={controller.saveDraft}
					disabled={!state.can({ type: "SAVE_DRAFT" })}
				>
					Save Draft
				</button>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnPrimary}`}
					onClick={controller.savePublishedChanges}
					disabled={!state.can({ type: "SAVE_PUBLISHED_CHANGES" })}
				>
					Save Changes
				</button>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnSuccess}`}
					onClick={controller.publish}
					disabled={!state.can({ type: "PUBLISH" })}
				>
					Publish
				</button>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnDanger}`}
					onClick={controller.revert}
					disabled={!state.can({ type: "REVERT" })}
				>
					Revert
				</button>
			</div>
		</form>
	);
}
