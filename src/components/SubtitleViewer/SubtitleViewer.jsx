import React, { useState, useRef, useEffect } from "react";
import { Captions, CaptionsOff, Minus, Plus, ALargeSmall } from "lucide-react";

import styles from "./SubtitleViewer.module.css";

const toArrayOfObjects = (val) => {
	// Already [{ speaker?, line }]
	if (
		Array.isArray(val) &&
		val.every((x) => typeof x === "object" && x !== null)
	) {
		return val.map((x) => ({
			speaker: x.speaker,
			line: x.line ?? String(x.line ?? ""),
		}));
	}

	// Array of strings -> [{ line }]
	if (Array.isArray(val) && val.every((x) => typeof x === "string")) {
		return val.map((line) => ({ line }));
	}

	// Single string (plain text) -> split into chunks
	if (typeof val === "string") {
		const trimmed = val.trim();

		// If it *looks* like JSON, try to parse
		if (/^[\[{]/.test(trimmed)) {
			try {
				const parsed = JSON.parse(trimmed);
				return toArrayOfObjects(parsed);
			} catch (e) {
				// fall through to plain text handling
				console.warn("Invalid JSON; rendering as plain text.", e);
			}
		}

		// Plain text fallback: paragraph/sentence-ish chunks
		const chunks = trimmed
			.split(/\n{2,}/)
			.flatMap((p) => p.split(/(?<=[.?!])\s+(?=[A-Z""'])/))
			.map((s) => s.trim())
			.filter(Boolean);

		return chunks.map((line) => ({ line }));
	}

	// Anything else -> empty
	return [];
};

const SubtitleViewer = ({ script = null }) => {
	const [showSubtitles, setShowSubtitles] = useState(false);
	const [fontSize, setFontSize] = useState(16);
	const containerRef = useRef(null); // This should reference the inner scrollable container
	const scriptArray = React.useMemo(() => toArrayOfObjects(script), [script]);

	// Smooth custom scroll handling
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let isScrolling = false;
		let scrollTarget = container.scrollTop;

		const smoothScroll = () => {
			if (!isScrolling) return;

			const currentScroll = container.scrollTop;
			const difference = scrollTarget - currentScroll;

			if (Math.abs(difference) < 0.5) {
				container.scrollTop = scrollTarget;
				isScrolling = false;
				return;
			}

			container.scrollTop += difference * 0.15; // Smooth easing
			requestAnimationFrame(smoothScroll);
		};

		const handleWheel = (e) => {
			e.preventDefault();
			e.stopPropagation(); // Prevent event from bubbling to parent

			const scrollAmount = e.deltaY / 8;
			scrollTarget += scrollAmount;

			// Clamp scroll target to valid range
			const maxScroll = container.scrollHeight - container.clientHeight;
			scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));

			if (!isScrolling) {
				isScrolling = true;
				requestAnimationFrame(smoothScroll);
			}
		};

		container.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			container.removeEventListener("wheel", handleWheel);
			isScrolling = false;
		};
	}, [showSubtitles]);

	// Don't render anything if there's no script
	if (!script || scriptArray.length === 0) {
		return null;
	}

	const increaseFontSize = () => {
		setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
	};

	const decreaseFontSize = () => {
		setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
	};

	return (
		<div className={styles.subtitle_viewer}>
			<div
				className={`${styles.subtitles_container} ${
					showSubtitles ? styles.open : styles.closed
				}`}
			>
				<div className={styles.subtitle_header}>
					<span
						type="button"
						className={`${styles.subtitle_toggle} ${
							showSubtitles ? styles.active : ""
						}`}
						onClick={() => setShowSubtitles(!showSubtitles)}
						aria-label={showSubtitles ? "Hide subtitles" : "Show subtitles"}
						title={showSubtitles ? "Hide subtitles" : "Show subtitles"}
					>
						{showSubtitles ? <CaptionsOff size={16} /> : <Captions size={24} />}
					</span>

					{showSubtitles && (
						<div className={styles.font_controls}>
							<button
								type="button"
								className={styles.font_button}
								onClick={decreaseFontSize}
								disabled={fontSize <= 12}
								aria-label="Decrease font size"
								title="Decrease font size"
							>
								<Minus size={16} />
							</button>
							<span className={styles.font_size_display}>
								<ALargeSmall size={16} />
							</span>
							<button
								type="button"
								className={styles.font_button}
								onClick={increaseFontSize}
								disabled={fontSize >= 24}
								aria-label="Increase font size"
								title="Increase font size"
							>
								<Plus size={16} />
							</button>
						</div>
					)}
				</div>

				<div className={styles.subtitle_content}>
					<div
						ref={containerRef} // Move ref to the inner scrollable container
						className={styles.subtitle_content_inner}
						style={{ "--subtitle-font-size": `${fontSize}px` }}
					>
						{scriptArray.map((p, idx) => (
							<p key={idx}>
								{p.speaker ? (
									<>
										<b>{p.speaker}:</b> {p.line}
									</>
								) : (
									p.line
								)}
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubtitleViewer;
