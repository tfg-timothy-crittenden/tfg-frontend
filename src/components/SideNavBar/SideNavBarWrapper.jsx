import React, { useState } from "react";
import styles from "./SideNavBar.module.css";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import ClassroomSelector from "../ClassroomSelector/ClassroomSelector";

const SideNavBarWrapper = ({ children }) => {
	const [isOpen, setIsOpen] = useState(true);

	const toggleSidebar = () => setIsOpen((prev) => !prev);

	return (
		<>
			<nav
				className={`${styles.expanded} ${isOpen ? styles.expandedVisible : ""}`}
			>
				<button
					className={`${styles.sidebar_toggle} ${styles.align_right}`}
					onClick={toggleSidebar}
					title="Close sidebar"
				>
					{isOpen ? (
						<PanelLeftClose size={36} strokeWidth={1} />
					) : (
						<PanelLeftOpen size={36} strokeWidth={1} />
					)}
				</button>
				{React.Children.map(children, (child) =>
					React.isValidElement(child)
						? React.cloneElement(child, { isOpen, setIsOpen })
						: child,
				)}
			</nav>
		</>
	);
};

export default SideNavBarWrapper;
