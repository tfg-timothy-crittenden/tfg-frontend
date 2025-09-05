import styles from "./Read.module.css";
import CountdownContainer from "@/components/CountdownTimer/CountdownContainer";
import TestWrapper from "@/components/TestWrapper/TestWrapper";
import TimerWrapper from "../TimerWrapper/TimerWrapper";

const Read = ({ title, body, author }) => {
	return (
		<>
			<TestWrapper>
				<h2>{title}</h2>
				<p className={styles.body}>{body}</p>
				{author && (
					<>
						<p>Sincerely,</p>
						<p>{author}</p>
					</>
				)}
			</TestWrapper>

			<TimerWrapper>
				<CountdownContainer initialTime={45000} />
			</TimerWrapper>
		</>
	);
};

export default Read;
