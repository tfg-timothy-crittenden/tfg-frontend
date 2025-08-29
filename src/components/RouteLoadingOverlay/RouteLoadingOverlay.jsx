import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./RouteLoadingOverlay.module.css";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

/**
 * Drop this anywhere. It portals an overlay to document.body.
 *
 * Props:
 * - loading: boolean (required)
 * - label?: string (aria-live text) default "Loading…"
 * - delay?: number (ms to debounce before showing) default 200
 * - inertTarget?: string | HTMLElement | null
 *      Where to apply `inert`/`aria-busy`. Defaults to auto-detect: #app-root, then #root, then first body child.
 */
export default function RouteLoadingOverlay({
	loading,
	label = "Loading…",
	delay = 200,
	inertTarget = null,
}) {
	// Debounce: only show after `delay` ms of continuous loading=true
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (!loading) return setOpen(false);
		const t = setTimeout(() => setOpen(true), delay);
		return () => clearTimeout(t);
	}, [loading, delay]);

	// Find where to set `inert`/`aria-busy`
	const targetEl = useMemo(() => {
		if (typeof document === "undefined") return null;
		if (inertTarget instanceof HTMLElement) return inertTarget;
		if (typeof inertTarget === "string")
			return document.querySelector(inertTarget);

		// auto-detect common app containers
		return document.querySelector("#root");
	}, [inertTarget]);

	// Apply/remove `inert` + `aria-busy` while overlay is open
	useEffect(() => {
		if (!targetEl) {
			console.log("No target element found for inert/aria-busy");
			return;
		}
		if (open) {
			targetEl.setAttribute("inert", "");
			targetEl.setAttribute("aria-busy", "true");
		} else {
			targetEl.removeAttribute("inert");
			targetEl.removeAttribute("aria-busy");
		}
		// cleanup on unmount
		return () => {
			targetEl.removeAttribute("inert");
			targetEl.removeAttribute("aria-busy");
		};
	}, [open, targetEl]);

	if (!open || typeof document === "undefined") return null;

	return createPortal(
		<div className={styles.backdrop} role="status" aria-live="polite">
			<LoadingSpinner />
			<span className={styles.sr_only}>{label}</span>
		</div>,
		document.body
	);
}
