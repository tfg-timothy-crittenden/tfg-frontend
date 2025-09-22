import styles from "./AudioWrapper.module.css";

const AudioWrapper = ({ children }) => {
	return (
		<section className={styles.audio_wrapper_container}>{children}</section>
	);
};

export default AudioWrapper;
