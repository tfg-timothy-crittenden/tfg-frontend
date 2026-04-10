// src/components/TestSelectionModal/TestSelectionModal.jsx
import React from "react";
import styles from "./TestSelectionModalBody.module.css";

const TestSelectionModalBody = ({
	sections,
	sectionId,
	partNumber,
	onSectionSelect,
}) => {
	const items = Array.isArray(sections) ? sections : [];

	return (
		<div className={styles.test_selection}>
			{items.length === 0 ? (
				<div className={styles.no_tests_message}>
					<p>No sections available for this classroom.</p>
				</div>
			) : (
				<div className={styles.test_section}>
					<div className={styles.test_list}>
						{items.map((section) => (
							<button
								key={section.id}
								className={`${styles.test_item} ${
									String(sectionId) === String(section.id)
										? styles.active_test
										: ""
								}`}
								onClick={() => onSectionSelect(section, partNumber || 1)}
							>
								<div className={styles.test_title}>{section.name}</div>
								<div className={styles.test_subtitle}>Section {section.id}</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default TestSelectionModalBody;
