import styles from "./SpeakingPart1QuestionSelector.module.css";
import Tag from "@/components/Tag/Tag";

const SpeakingPart1QuestionSelector = ({
	topics,
	currentTopic,
	handleTopicChange,
}) => {
	return (
		<aside className={styles.tags_container}>
			<div className={styles.tags}>
				{topics.map((topic) => (
					<Tag
						key={topic}
						tagName={topic}
						handleSetTag={handleTopicChange}
						selected={currentTopic === topic}
					/>
				))}
			</div>
		</aside>
	);
};

export default SpeakingPart1QuestionSelector;
