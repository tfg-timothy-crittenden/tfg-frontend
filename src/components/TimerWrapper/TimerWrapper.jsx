import styles from "./TimerWrapper.module.css";

const TimerWrapper = ({ children }) => {
	return <div className={`${styles.timer_wrapper}`}>{children}</div>;
};
export default TimerWrapper;
