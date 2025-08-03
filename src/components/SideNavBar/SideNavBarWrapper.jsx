import { useState } from "react";
import styles from "./SideNavBar.module.css";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

const SideNavBarWrapper = ({ children }) => {
	const [isOpen, setIsOpen] = useState(true);

	const toggleSidebar = () => setIsOpen((prev) => !prev);

	return (
		<>
			{/* Always-visible vertical toggle bar when closed */}
			{!isOpen && (
				<div
					className={styles.sidebar_bar}
					onClick={toggleSidebar}
					title="Open sidebar"
				>
					<button className={`${styles.sidebar_toggle} `}>
						<PanelLeftOpen size={36} strokeWidth={1} />
					</button>
				</div>
			)}

			{/* Sidebar itself */}
			<nav
				className={`${styles.expanded} ${isOpen ? styles.expandedVisible : ""}`}
			>
				{isOpen && (
					<button
						className={`${styles.sidebar_toggle} ${styles.align_right}`}
						onClick={toggleSidebar}
						title="Close sidebar"
					>
						<PanelLeftClose size={36} strokeWidth={1} />
					</button>
				)}
				{children}
			</nav>
		</>
	);
};

export default SideNavBarWrapper;
