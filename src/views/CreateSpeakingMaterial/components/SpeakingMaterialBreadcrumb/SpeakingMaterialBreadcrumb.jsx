import styles from "@/views/CreateSpeakingMaterial/styles/CreateSpeakingMaterial.module.css";

const SpeakingMaterialBreadcrumb = ({
	navigation,
	materialInfoValid,
	hasVisualPrompt,
	part1NextDisabled,
}) => {
	const { activePart, step, setActivePart, goToStage, goToPart2 } = navigation;

	const currentBreadcrumbKey =
		activePart === 1
			? step === 0
				? "section-details"
				: step === 1
					? "part1-image"
					: "part1-questions"
			: "part2-questions";

	const breadcrumbItems = [
		{
			key: "section-details",
			label: "section details",
			onClick: () => {
				setActivePart(1);
				goToStage(0);
			},
		},
		{
			key: "part1-image",
			label: "part 1 image",
			onClick: () => {
				setActivePart(1);
				goToStage(1);
			},
		},
		{
			key: "part1-questions",
			label: "part 1 questions",
			onClick: () => {
				setActivePart(1);
				goToStage(2);
			},
		},
		{
			key: "part2-questions",
			label: "part 2 questions",
			onClick: goToPart2,
		},
	];

	const currentBreadcrumbIndex = breadcrumbItems.findIndex(
		(item) => item.key === currentBreadcrumbKey,
	);
	const progressionGates = [
		materialInfoValid,
		hasVisualPrompt,
		!part1NextDisabled,
	];

	const canNavigateToBreadcrumbIndex = (targetIndex) => {
		if (targetIndex <= currentBreadcrumbIndex) return true;
		for (
			let gateIndex = currentBreadcrumbIndex;
			gateIndex < targetIndex;
			gateIndex += 1
		) {
			if (!progressionGates[gateIndex]) return false;
		}
		return true;
	};

	const progressPercent =
		currentBreadcrumbIndex <= 0
			? 0
			: (currentBreadcrumbIndex / (breadcrumbItems.length - 1)) * 100;

	return (
		<nav className={styles.breadcrumb} aria-label="Speaking form stages">
			<div className={styles.progress_track} aria-hidden="true">
				<div
					className={styles.progress_fill}
					style={{ width: `${progressPercent}%` }}
				/>
			</div>
			<ol className={styles.breadcrumb_flow}>
				{breadcrumbItems.map((item, index) => {
					const canNavigate = canNavigateToBreadcrumbIndex(index);
					const stateClass =
						index === currentBreadcrumbIndex
							? styles.breadcrumb_current
							: index < currentBreadcrumbIndex
								? styles.breadcrumb_done
								: styles.breadcrumb_upcoming;

					return (
						<li
							key={item.key}
							className={stateClass}
							aria-current={
								index === currentBreadcrumbIndex ? "step" : undefined
							}
						>
							<button
								type="button"
								className={`${styles.breadcrumb_button} ${!canNavigate ? styles.breadcrumb_button_disabled : ""}`}
								onClick={canNavigate ? item.onClick : undefined}
								disabled={!canNavigate}
							>
								{item.label}
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export default SpeakingMaterialBreadcrumb;
