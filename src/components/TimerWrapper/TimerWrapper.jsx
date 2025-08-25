import styles from "./TimerWrapper.module.css";

const TimerWrapper = ({ children }) => {
	return (
		<div className={`${styles.timer_wrapper} mobile_side_padding mobile_side_margin`}>
			{children}
		</div>
	);
};
export default TimerWrapper;
