// src/components/ResponsiveNavigation/ResponsiveNavigation.jsx
import React from "react";
import MobileHierarchicalNav from "@/components/MobileHierarchicalNav/MobileHierarchicalNav";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";
import SideNavBarWrapper from "../SideNavBar/SideNavBarWrapper";

const ResponsiveNavigation = ({
	classrooms,
	onClassroomChange,
	setShowMaterial,
	showMaterial,
}) => {
	const { isMobile } = useResponsiveLayout();

	return (
		<>
			{isMobile ? (
				<MobileHierarchicalNav />
			) : (
				<SideNavBarWrapper>
					<SideNavBar
						classrooms={classrooms}
						onClassroomChange={onClassroomChange}
						setShowMaterial={setShowMaterial}
						showMaterial={showMaterial}
					/>
				</SideNavBarWrapper>
			)}
		</>
	);
};

export default ResponsiveNavigation;
