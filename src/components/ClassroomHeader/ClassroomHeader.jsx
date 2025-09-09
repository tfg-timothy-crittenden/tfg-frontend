import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import styles from "./ClassroomHeader.module.css";
import { PanelTopOpen, PanelTopClose } from "lucide-react";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";
import JoinCodeButtonContainer from "@/components/JoinCodeButtonContainer/JoinCodeButtonContainer";
import MaterialButtonContainer from "@/components/MaterialButtonContainer/MaterialButtonContainer";

const ClassroomHeader = ({ classrooms, onClassroomChange }) => {
	const { isMobile } = useResponsiveLayout();
	const [collapsed, setCollapsed] = useState(isMobile);
	const headerRef = useRef();

	useEffect(() => {
		setCollapsed(isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (!isMobile) return;

		const handleClickOutside = (e) => {
			if (headerRef.current && !headerRef.current.contains(e.target)) {
				setCollapsed(true);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMobile]);

	return (
		<nav className={styles.header} ref={headerRef}>
			<div
				className={`${styles.header_content} ${
					collapsed && isMobile ? styles.collapsed : styles.expanded
				}`}
			>
				<Breadcrumb
					classrooms={classrooms}
					onClassroomChange={onClassroomChange}
				/>

				{isMobile && (
					<>
						<MaterialButtonContainer />
						<JoinCodeButtonContainer />
					</>
				)}
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
