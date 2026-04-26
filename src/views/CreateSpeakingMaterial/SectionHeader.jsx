const SectionHeader = ({ badge, title, subtitle, styles }) => {
	return (
		<div className={styles.step3_header}>
			<div className={styles.step3_badge}>{badge}</div>
			<div>
				<h2 className={styles.step3_title}>{title}</h2>
				{subtitle ? <p className={styles.step3_subtitle}>{subtitle}</p> : null}
			</div>
		</div>
	);
};

export default SectionHeader;
