import { useRef, useState } from "react";
import { Captions } from "lucide-react";
import CountdownCountainer from "@/components/CountdownTimer/CountdownContainer";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import SubtitleViewer from "@/components/SubtitleViewer/SubtitleViewer";

import styles from "./ListenRepeat.module.css";

const ListenRepeatPresentation = ({
	time,
	mode,
	modeEnum,
	testData,
	sharedImageUrl,
	questionAudioUrl,
}) => {
	const transcript = testData?.transcriptText || "";
	const highlightData = testData?.config?.highlight_data;
	const viewBoxWidth = highlightData?.viewBox?.[0] || 986;
	const viewBoxHeight = highlightData?.viewBox?.[1] || 882;
	const highlightPaths = highlightData?.ds || [];
	const imageSrc = sharedImageUrl;
	const subtitleViewerRef = useRef(null);
	const [showSubtitles, setShowSubtitles] = useState(false);

	const toggleSubtitles = () => {
		const nextState = !showSubtitles;
		setShowSubtitles(nextState);
		if (nextState) {
			subtitleViewerRef.current?.open?.();
		} else {
			subtitleViewerRef.current?.close?.();
		}
	};

	const isInstructionsMode = mode === modeEnum.INSTRUCTIONS;
	const isListenMode = mode === modeEnum.LISTEN;
	const isSpeakMode = mode === modeEnum.SPEAK;
	const isInteractiveMode = isListenMode || isSpeakMode;

	const renderPrimaryControl = () => {
		if (isListenMode) {
			return (
				<audio
					key={questionAudioUrl || "no-audio"}
					className={styles.listen_audio_player}
					controls
					src={questionAudioUrl || undefined}
				/>
			);
		}

		if (isSpeakMode) {
			return (
				<CountdownCountainer
					initialTime={time}
					className={styles.countdown_control_slot}
					compact
				/>
			);
		}

		return null;
	};

	const renderTestElements = () => {
		if (isInstructionsMode) {
			return <div className={styles.test_controls_container}></div>;
		}

		if (isInteractiveMode) {
			return (
				<>
					<div
						className={`${styles.test_controls_container} ${styles.listen_controls_row}`}
					>
						<div className={styles.primary_control_slot}>
							{renderPrimaryControl()}
						</div>
						<span
							className={`${styles.subtitle_toggle} ${
								showSubtitles ? styles.active : ""
							}`}
							onClick={toggleSubtitles}
							aria-label={showSubtitles ? "Hide subtitles" : "Show subtitles"}
							title={showSubtitles ? "Hide subtitles" : "Show subtitles"}
						>
							<Captions size={20} />
						</span>
					</div>
					<SubtitleViewer ref={subtitleViewerRef} script={transcript} />
				</>
			);
		}

		return (
			<div className={styles.test_controls_container}>
				<SubtitleViewer script={transcript} />
			</div>
		);
	};

	return (
		<div>
			<h1 className={styles.part_title}>Listen and Repeat</h1>
			<ToggleSwitch mode={mode} modeEnum={modeEnum} />
			<div className={styles.test_content_container}>
				<div className={styles.image_container}>
					<svg
						className={styles.image}
						viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
						preserveAspectRatio="xMidYMid meet"
						style={{ width: "100%", height: "auto" }}
						role="img"
						aria-label="Listen Repeat"
					>
						<image
							href={imageSrc}
							x="0"
							y="0"
							width={viewBoxWidth}
							height={viewBoxHeight}
							preserveAspectRatio="xMidYMid meet"
						/>
						{highlightPaths.map((path, index) => (
							<path
								key={`${index}-${path}`}
								d={path}
								fill="none"
								stroke="#78C257"
								strokeWidth="18"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						))}
					</svg>
				</div>
				{renderTestElements()}
			</div>
		</div>
	);
};

export default ListenRepeatPresentation;
