// src/hooks/useResponsiveLayout.js
import { useState, useEffect } from "react";
import { BREAKPOINTS } from "@/styles/breakpoints";

const useResponsiveLayout = () => {
	// Start with mobile as default (mobile-first)
	const [isMobile, setIsMobile] = useState(true);
	const [isTablet, setIsTablet] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);
	const [isLargeDesktop, setIsLargeDesktop] = useState(false);

	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth;

			console.log("Screen width:", width, "Breakpoints:", BREAKPOINTS); // Debug log

			// Mobile-first logic
			setIsMobile(width < BREAKPOINTS.TABLET);
			setIsTablet(width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP);
			setIsDesktop(
				width >= BREAKPOINTS.DESKTOP && width < BREAKPOINTS.LARGE_DESKTOP
			);
			setIsLargeDesktop(width >= BREAKPOINTS.LARGE_DESKTOP);
		};

		// Check initial size
		checkScreenSize();

		// Listen for resize events
		window.addEventListener("resize", checkScreenSize);

		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	return {
		isMobile,
		isTablet,
		isDesktop,
		isLargeDesktop,
		// Computed breakpoint string
		breakpoint: isMobile
			? "mobile"
			: isTablet
			? "tablet"
			: isDesktop
			? "desktop"
			: "large-desktop",
		// Convenience helpers
		isTabletUp: isTablet || isDesktop || isLargeDesktop,
		isDesktopUp: isDesktop || isLargeDesktop,
	};
};

export default useResponsiveLayout;
