import styles from "./TransferListTestRepresentation.module.css";

const TransferListTestRepresentation = ({
	sectionTitle,
	part1Title,
	part2Title,
	isActive = false,
}) => {
	const hasPart1 = Boolean(String(part1Title || "").trim());
	const hasPart2 = Boolean(String(part2Title || "").trim());
	const hasParts = hasPart1 || hasPart2;

	return (
		<div className={`${styles.textBlock} ${isActive ? styles.active : ""}`}>
			<span className={styles.sectionTitle}>{sectionTitle}</span>
			{hasParts && (
				<div className={styles.textRow}>
					{hasPart1 && (
						<span className={styles.partItem}>
							<span className={styles.partKey}>Part 1:</span>
							<span className={styles.partTitle}>{part1Title}</span>
						</span>
					)}
					{hasPart2 && (
						<span className={styles.partItem}>
							<span className={styles.partKey}>Part 2:</span>
							<span className={styles.partTitle}>{part2Title}</span>
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default TransferListTestRepresentation;
