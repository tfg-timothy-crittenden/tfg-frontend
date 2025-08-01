import { useEffect, useState } from "react";

import styles from "./SideNavBar.module.css";
import { PanelLeft } from "lucide-react";

const SideNavBarWrapper = ({ children }) => {
	const [isPinned, setIsPinned] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	// Load pin state on first render
	useEffect(() => {
		const stored = localStorage.getItem("sidebarPinned");
		if (stored === "true") {
			setIsPinned(true);
		}
	}, []);

	//Save pin state when it changes
	useEffect(() => {
		localStorage.setItem("sidebarPinned", isPinned.toString());
	}, [isPinned]);

	const shouldExpand = isPinned || isHovered;

	return (
		<nav
			className={`${styles.expanded} ${
				shouldExpand ? styles.expandedVisible : ""
			}`}
			onMouseEnter={() => !isPinned && setIsHovered(true)}
			onMouseLeave={() => !isPinned && setIsHovered(false)}
		>
			<div
				className={`${styles.pin_dot} ${
					isPinned ? styles.pinned : styles.unpinned
				}`}
				onClick={() => setIsPinned(!isPinned)}
				title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
			>
				<PanelLeft />
			</div>

			{children}
		</nav>
	);
};

export default SideNavBarWrapper;
