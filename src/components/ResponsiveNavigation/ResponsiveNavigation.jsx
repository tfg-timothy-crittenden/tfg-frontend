// src/components/ResponsiveNavigation/ResponsiveNavigation.jsx
import React from "react";
import MobileHierarchicalNav from "@/components/MobileHierarchicalNav/MobileHierarchicalNav";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import useResponsiveLayout from "@/hooks/useResponsiveLayout";

const ResponsiveNavigation = () => {
	const { isMobile } = useResponsiveLayout();

	return <>{isMobile ? <MobileHierarchicalNav /> : <SideNavBar />}</>;
};

export default ResponsiveNavigation;
