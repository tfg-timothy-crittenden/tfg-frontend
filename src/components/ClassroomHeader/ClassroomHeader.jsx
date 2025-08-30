import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import styles from "./ClassroomHeader.module.css";
import { PanelTopOpen, PanelTopClose } from "lucide-react";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";

const ClassroomHeader = ({ classrooms, onClassroomChange }) => {
	const { isMobile } = useResponsiveLayout();
	const [collapsed, setCollapsed] = useState(isMobile);

	useEffect(() => {
		setCollapsed(isMobile);
	}, [isMobile]);

	return (
		<nav className={styles.header}>
			<div
				className={`${styles.header_content} ${
					collapsed && isMobile ? styles.collapsed : styles.expanded
				}`}
			>
				<Breadcrumb
					classrooms={classrooms}
					onClassroomChange={onClassroomChange}
				/>
			</div>
			{isMobile && (
				<button
					className={styles.header_toggle_btn}
					onClick={() => setCollapsed((prev) => !prev)}
					aria-label={collapsed ? "Show header" : "Hide header"}
				>
					{collapsed ? (
						<PanelTopOpen size={32} strokeWidth={1} />
					) : (
						<PanelTopClose size={32} strokeWidth={1} />
					)}
				</button>
			)}
		</nav>
	);
};

export default ClassroomHeader;
