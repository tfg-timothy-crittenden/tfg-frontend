import CountdownCountainer from "@/components/CountdownTimer/CountdownContainer";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import SubtitleViewer from "@/components/SubtitleViewer/SubtitleViewer";

import styles from "./ListenRepeat.module.css";

const ListenRepeatPresentation = ({ time, mode, modeEnum }) => {
	const renderTestElements = () => {
		switch (mode) {
			case modeEnum.LISTEN:
				return (
					<div className={styles.test_controls_container}>
						<audio controls></audio>
						<SubtitleViewer script={"this is a test script"} />
					</div>
				);
			case modeEnum.SPEAK:
				return (
					<div className={styles.test_controls_container}>
						<CountdownCountainer initialTime={time} />
						<SubtitleViewer script={"this is a test script"} />
					</div>
				);
		}
	};

	return (
		<div>
			<ToggleSwitch mode={mode} modeEnum={modeEnum} />
			<h1 className={styles.part_title}>Listen and Repeat</h1>
			<div className={styles.test_content_container}>
				<div className={styles.image_container}>
					<img
						className={styles.image}
						src="/assets/listen_repeat_example_image.PNG"
						alt="Listen Repeat"
					/>
				</div>
				{renderTestElements()};{/* </div> */}
			</div>
		</div>
	);
};

export default ListenRepeatPresentation;
