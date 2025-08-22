// src/styles/breakpoints.js
export const BREAKPOINTS = {
	// Mobile-first breakpoints (min-width)
	TABLET: 769,
	DESKTOP: 1025,
	LARGE_DESKTOP: 1200,

	// Content constraints
	CONTENT_MAX_WIDTH: 1080,
	SIDEBAR_WIDTH: 350,
	SIDEBAR_COLLAPSED_WIDTH: 50,
};

// Mobile-first media queries
export const MEDIA_QUERIES = {
	TABLET_UP: `(min-width: ${BREAKPOINTS.TABLET}px)`,
	DESKTOP_UP: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,
	LARGE_DESKTOP_UP: `(min-width: ${BREAKPOINTS.LARGE_DESKTOP}px)`,

	// Utility queries
	CONTENT_CONSTRAINED: `(max-width: ${BREAKPOINTS.CONTENT_MAX_WIDTH + 40}px)`,
};

// CSS custom properties
export const CSS_BREAKPOINTS = {
	"--breakpoint-tablet": `${BREAKPOINTS.TABLET}px`,
	"--breakpoint-desktop": `${BREAKPOINTS.DESKTOP}px`,
	"--breakpoint-large-desktop": `${BREAKPOINTS.LARGE_DESKTOP}px`,
	"--content-max-width": `${BREAKPOINTS.CONTENT_MAX_WIDTH}px`,
	"--sidebar-width": `${BREAKPOINTS.SIDEBAR_WIDTH}px`,
	"--sidebar-collapsed-width": `${BREAKPOINTS.SIDEBAR_COLLAPSED_WIDTH}px`,
};
