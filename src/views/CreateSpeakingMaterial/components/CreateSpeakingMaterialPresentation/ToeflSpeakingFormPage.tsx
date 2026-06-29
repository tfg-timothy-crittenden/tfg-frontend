import { useEffect, useMemo, useState } from "react";
import { useToeflSpeakingFormController } from "./useToeflSpeakingFormController";
import styles from "./ToeflSpeakingFormPage.module.css";

type CSSModuleStyles = Record<string, string>;

function AudioField({
	value,
	onChange,
	styles,
}: {
	value: File | string | null;
	onChange: (file: File | null) => void;
	styles: CSSModuleStyles;
}) {
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!(value instanceof File)) {
			setObjectUrl(null);
			return;
		}
		const url = URL.createObjectURL(value);
		setObjectUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [value]);

	const playbackUrl = value instanceof File ? objectUrl : (value ?? null);

	if (value) {
		return (
			<div className={styles.audioRow}>
				<audio
					controls
					src={playbackUrl ?? undefined}
					className={styles.audioPlayer}
				/>
				<span className={styles.audioName}>
					{value instanceof File ? value.name : "Existing audio"}
				</span>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnDanger}`}
					onClick={() => onChange(null)}
				>
					Remove
				</button>
			</div>
		);
	}
	return (
		<input
			className={styles.input}
			type="file"
			accept="audio/*"
			onChange={(e) => onChange(e.target.files?.[0] ?? null)}
		/>
	);
}

export function ToeflSpeakingFormPage() {
	const controller = useToeflSpeakingFormController();
	const { form, state, context } = controller;

	//Step states
	const {
		isMaterialDetails,
		isPart1Image,
		isPart1Questions,
		isPart2Questions,
	} = controller;

	const part1Image = form.watch("part1Image");
	const part1ImagePreviewUrl = useMemo(() => {
		if (part1Image instanceof File) return URL.createObjectURL(part1Image);
		if (typeof part1Image === "string") return part1Image;
		return null;
	}, [part1Image]);

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
			{isPart1Image && (
				<div className={styles.step}>
					<h1 className={styles.stepTitle}>Part 1 Image</h1>
					<div className={styles.field}>
						Image
						{part1ImagePreviewUrl ? (
							<div className={styles.imagePreview}>
								<img
									src={part1ImagePreviewUrl}
									alt="Part 1 image preview"
									style={{ maxWidth: 300 }}
								/>
								<button
									type="button"
									className={`${styles.btn} ${styles.btnDanger}`}
									onClick={() =>
										form.setValue("part1Image", null, { shouldDirty: true })
									}
								>
									Remove image
								</button>
							</div>
						) : (
							<input
								className={styles.input}
								type="file"
								accept="image/*"
								onChange={(e) =>
									form.setValue("part1Image", e.target.files?.[0] ?? null, {
										shouldDirty: true,
									})
								}
							/>
						)}
					</div>
					<div className={styles.stepNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.previousStep}
							disabled={!state.can({ type: "PREVIOUS_STEP" })}
						>
							← Previous
						</button>
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

			{/* Part 1 Questions */}
			{isPart1Questions && (
				<div className={styles.step}>
					<h2 className={styles.stepTitle}>
						Part 1 — Question {context.currentQuestion + 1} of 7
					</h2>

					{/* key forces a remount when navigating so RHF re-registers
					    the field and the uncontrolled textarea shows the correct
					    stored value instead of the previous question's text */}
					<div key={context.currentQuestion} className={styles.questionCard}>
						<label className={styles.field}>
							Transcript
							<textarea
								className={styles.textarea}
								{...form.register(
									`part1Questions.${context.currentQuestion}.transcript`,
								)}
								rows={4}
								placeholder="Enter question transcript…"
							/>
						</label>

						<div className={styles.field}>
							Audio
							<AudioField
								value={form.watch(
									`part1Questions.${context.currentQuestion}.audio`,
								)}
								onChange={(file) =>
									form.setValue(
										`part1Questions.${context.currentQuestion}.audio`,
										file,
										{ shouldDirty: true },
									)
								}
								styles={styles}
							/>
						</div>
					</div>

					<div className={styles.questionNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.previousQuestion}
							disabled={!state.can({ type: "PREVIOUS_QUESTION" })}
						>
							← Prev Question
						</button>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.nextQuestion}
							disabled={!state.can({ type: "NEXT_QUESTION" })}
						>
							Next Question →
						</button>
					</div>

					<div className={styles.stepNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.previousStep}
							disabled={!state.can({ type: "PREVIOUS_STEP" })}
						>
							← Back to Image
						</button>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnPrimary}`}
							onClick={controller.nextStep}
							disabled={!state.can({ type: "NEXT_STEP" })}
						>
							Next: Part 2 →
						</button>
					</div>
				</div>
			)}

			{/* Part 2 Questions */}
			{isPart2Questions && (
				<div className={styles.step}>
					<h2 className={styles.stepTitle}>
						Part 2 — Question {context.currentPart2Question + 1} of 4
					</h2>

					<div
						key={context.currentPart2Question}
						className={styles.questionCard}
					>
						<label className={styles.field}>
							Transcript
							<textarea
								className={styles.textarea}
								{...form.register(
									`part2Questions.${context.currentPart2Question}.transcript`,
								)}
								rows={4}
								placeholder="Enter question transcript…"
							/>
						</label>

						<div className={styles.field}>
							Audio
							<AudioField
								value={form.watch(
									`part2Questions.${context.currentPart2Question}.audio`,
								)}
								onChange={(file) =>
									form.setValue(
										`part2Questions.${context.currentPart2Question}.audio`,
										file,
										{ shouldDirty: true },
									)
								}
								styles={styles}
							/>
						</div>
					</div>

					<div className={styles.questionNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.previousPart2Question}
							disabled={!state.can({ type: "PREVIOUS_PART2_QUESTION" })}
						>
							← Prev Question
						</button>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.nextPart2Question}
							disabled={!state.can({ type: "NEXT_PART2_QUESTION" })}
						>
							Next Question →
						</button>
					</div>

					<div className={styles.stepNav}>
						<button
							type="button"
							className={`${styles.btn} ${styles.btnSecondary}`}
							onClick={controller.previousStep}
							disabled={!state.can({ type: "PREVIOUS_STEP" })}
						>
							← Back to Part 1
						</button>
					</div>
				</div>
			)}

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
