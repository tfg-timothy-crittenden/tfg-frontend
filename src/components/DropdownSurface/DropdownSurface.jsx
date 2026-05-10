import { useImperativeHandle, useState, useRef, useEffect } from "react";

import styles from "./DropdownSurface.module.css";

const DropdownSurface = ({ children, buttonLabel = "", ref }) => {
	const [expanded, setExpanded] = useState(false);

	const surfaceRef = useRef(null);

	const toggleExpanded = (e) => {
		console.log("toggleExpanded", expanded);
		e.stopPropagation();
		setExpanded((prev) => !prev);

		//Allow parent to perform an action when surface visibility is toggled
		// onToggleExpanded();
	};

	const hideSurface = () => {
		setExpanded(false);
	};

	const showSurface = () => {
		setExpanded(true);
	};

	//Give parent control of expansion
	useImperativeHandle(ref, () => {
		return {
			hideSurface,
			showSurface,
		};
	});

	//Hide surface when click somewhere else
	useEffect(() => {
		const handler = (e) => {
			if (surfaceRef.current && !surfaceRef.current.contains(e.target)) {
				hideSurface();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [expanded]);

	return (
		<div ref={surfaceRef}>
			<button
				// ref={toggleBtnRef}
				type="button"
				className={styles.button}
				onClick={toggleExpanded}
			>
				<span className={styles.toggleLabel}>{buttonLabel}</span>
				<span
					className={`${styles.chevron} ${
						expanded ? styles.chevron_up : styles.chevron_down
					}`}
					aria-hidden="true"
				/>
			</button>
			{expanded && <div className={styles.surface_container}>{children}</div>}
		</div>
	);
};

export default DropdownSurface;
