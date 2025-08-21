import TestWrapper from "@/components/TestWrapper/TestWrapper";
import styles from "./TestInstructions.module.css";

const TestInstructions = () => {
	return (
		<TestWrapper>
			<div className={styles.instructions_container}>
				<h1 className={styles.title}>TOEFL Speaking Test Instructions</h1>
				<div className={styles.content}>
					<div className={styles.section}>
						<p>
							In the Speaking test, you will be able to demonstrate your ability
							to speak about a variety of topics. You will answer four questions
							by speaking into a microphone. Answer each of the questions as
							completely as possible.{" "}
						</p>
						<p>
							In question 1, you will speak about familiar topics. Your response
							will be scored on your ability to speak clearly and coherently
							about the topics.{" "}
						</p>
						<p>
							In questions 2 and 3, you will first read a short text. The text
							will go away and you will then listen to a talk on the same topic.
							You will then be asked a question about what you have read and
							heard. You will need to combine appropriate information from the
							text and the talk to provide a complete answer to the question.
							Your response will be scored on your ability to speak clearly and
							coherently and on your ability to accurately convey information
							about what you have read and heard.{" "}
						</p>
						<p>
							In question 4, you will listen to part of a lecture. You will then
							be asked a question about what you have heard. Your response will
							be scored on your ability to speak clearly and coherently and on
							your ability to accurately convey information about what you
							heard. In questions 3 and 4, you may take notes while you read and
							while you listen to the lectures. You may use your notes to help
							prepare your response.
						</p>
						<p>
							Listen carefully to the directions for each question. The
							directions will not be written on the screen. For each question,
							you will be given a short time to prepare your response (15 to 30
							seconds, depending on the question). A clock will show how much
							preparation time is remaining. When the preparation time is up,
							you will be told to begin your response. A clock will show how
							much response time is remaining.
						</p>
					</div>
				</div>
			</div>
		</TestWrapper>
	);
};

export default TestInstructions;
