import { useRef, useState, useEffect, useMemo } from "react";

import { fetchAllClassesAndTeachers } from "@/api/admin/admin";

import styles from "./AdminMaterialClassPanel.module.css";

const AdminMaterialClassPanel = ({
	selectedClassId,
	selectedClassName,
	selectClass,
	isMobile,
	dropdownOpen,
	setDropdownOpen,
	toggleBtnRef,
}) => {
	const listRef = useRef(null);

	const [highlightIndex, setHighlightIndex] = useState(-1);
	const [searchTerm, setSearchTerm] = useState("");
	const [classes, setClasses] = useState([]);

	const filteredClasses = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return classes;
		return classes.filter((c) => c.name?.toLowerCase().includes(term));
	}, [classes, searchTerm]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await fetchAllClassesAndTeachers();
				setClasses(result.data);
			} catch (err) {
				console.error("Error fetching classes:", err);
			}
		};
		fetchData();
	}, []);

	// Outside click (mobile dropdown)
	useEffect(() => {
		if (!isMobile || !dropdownOpen) return;
		const handler = (e) => {
			if (listRef.current && !listRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [isMobile, dropdownOpen]);

	// Keep highlightIndex in range when filtered list changes
	useEffect(() => {
		if (highlightIndex >= filteredClasses.length) {
			setHighlightIndex(filteredClasses.length - 1);
		}
	}, [filteredClasses, highlightIndex]);

	useEffect(() => {
		if (!isMobile) {
			setDropdownOpen(true);
		}
	}, [isMobile]);

	const buttonLabel = (() => {
		if (!isMobile) return "Classes";
		if (!selectedClassId) return "Select a class";
		return dropdownOpen ? "Hide Classes" : selectedClassName;
	})();

	return (
		<div className={styles.classPanelWrapper}>
			<button
				ref={toggleBtnRef}
				type="button"
				className={`${styles.toggleClassesBtn} ${
					dropdownOpen ? styles.open : ""
				}`}
				onClick={() =>
					isMobile ? setDropdownOpen((o) => !o) : setDropdownOpen(true)
				}
			>
				<span className={styles.toggleLabel}>{buttonLabel}</span>
				<span
					className={`${styles.chevron} ${
						dropdownOpen ? styles.chevronUp : styles.chevronDown
					}`}
					aria-hidden="true"
				/>
			</button>

			<div
				ref={listRef}
				className={`
                        ${styles.class_container} ${
					isMobile ? styles.dropdownSurface : ""
				} ${dropdownOpen ? styles.dropdownVisible : styles.dropdownHidden}
                    `}
			>
				<h2 className={styles.mobileHeading}>Classes</h2>
				<input
					placeholder="Search classes..."
					className={styles.search_input}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<ul
					id="class-listbox"
					role="listbox"
					aria-label="Class list"
					className={styles.class_list}
				>
					{filteredClasses.map((cls, idx) => {
						const selected = cls.id === selectedClassId;
						const focused = idx === highlightIndex;
						return (
							<li
								key={cls.id}
								tabIndex={isMobile ? -1 : 0}
								data-index={idx}
								role="option"
								aria-selected={selected}
								className={`${styles.listItem} ${
									selected ? styles.selectedClass : ""
								} ${focused ? styles.focusedOption : ""}`}
								onClick={() => selectClass(cls)}
								onKeyDown={(e) => onOptionKeyDown(e, idx, cls)}
							>
								{cls.name}
							</li>
						);
					})}
					{filteredClasses.length === 0 && (
						<li
							className={styles.listItem}
							aria-disabled="true"
							style={{ opacity: 0.6 }}
						>
							No matches
						</li>
					)}
				</ul>
			</div>
		</div>
	);
};

export default AdminMaterialClassPanel;
