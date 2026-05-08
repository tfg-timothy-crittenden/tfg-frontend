import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import TaskResponseControls from "@/components/TaskResponseControls/TaskResponseControls";
import TopLoadingBar from "@/components/TopLoadingBar/TopLoadingBar";

import styles from "./ListenRepeat.module.css";

const ListenRepeatPresentation = ({
	time,
	mode,
	modeEnum,
	testData,
	sharedImageUrl,
	questionAudioUrl,
	loading,
}) => {
	const transcript = testData?.transcriptText || testData?.transcript || "";
	const highlightData = testData?.config?.highlight_data;
	const viewBoxWidth = highlightData?.viewBox?.[0] || 400; //Set this to square of 400 x 400, which SHOULD be what it is in the DB anyway
	const viewBoxHeight = highlightData?.viewBox?.[1] || 400;
	const highlightPaths = highlightData?.ds || [];
	const imageSrc = sharedImageUrl;
	const showImageSkeleton = loading && !imageSrc;

	return (
		<div>
			<TopLoadingBar loading={loading} />
			<h1 className={styles.part_title}>Listen and Repeat</h1>
			<ToggleSwitch mode={mode} modeEnum={modeEnum} />

			<div className={styles.test_content_container}>
				{showImageSkeleton ? (
					<div className={styles.skeletonImage} aria-hidden="true"></div>
				) : (
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
									strokeWidth="5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							))}
						</svg>
					</div>
				)}
				{loading ? (
					<p className={styles.loading_state}>Loading test...</p>
				) : (
					<TaskResponseControls
						mode={mode}
						modeEnum={modeEnum}
						time={time}
						questionAudioUrl={questionAudioUrl}
						transcript={transcript}
					/>
				)}
			</div>
		</div>
	);
};

export default ListenRepeatPresentation;
