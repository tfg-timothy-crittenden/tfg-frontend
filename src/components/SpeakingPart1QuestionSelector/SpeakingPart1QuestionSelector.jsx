import styles from "./SpeakingPart1QuestionSelector.module.css";
import Tag from "@/components/Tag/Tag";
import tagStyles from "@/components/Tag/Tag.module.css";
import { useState, useRef, useEffect } from "react";
import useResponsiveLayout from "@/hooks/useResponsiveLayout"; // <-- import your hook

const SpeakingPart1QuestionSelector = ({
	topics,
	currentTopic,
	handleTopicChange,
}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const currentRef = useRef(null);
	const { isMobile } = useResponsiveLayout(); // <-- use your hook

	const handleSelectTopic = async (topic) => {
		await handleTopicChange(topic);
		setMenuOpen(false);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (currentRef.current && !currentRef.current.contains(event.target)) {
				setMenuOpen(false);
			}
		}
		if (menuOpen && isMobile) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuOpen, isMobile]);

	if (!isMobile) {
		// Always show aside on tablet and up
		return (
			<aside className={styles.tags_container}>
				<div className={styles.tags}>
					{topics.map((topic) => (
						<Tag
							key={topic}
							tagName={topic}
							handleSetTag={handleSelectTopic}
							selected={currentTopic === topic}
						/>
					))}
				</div>
			</aside>
		);
	}

	// Mobile: show menu logic
	return (
		<>
			{menuOpen && (
				<aside className={styles.tags_container + " fade_in"} ref={currentRef}>
					<div className={styles.tags}>
						{topics.map((topic) => (
							<Tag
								key={topic}
								tagName={topic}
								handleSetTag={handleSelectTopic}
								selected={currentTopic === topic}
							/>
						))}
					</div>
				</aside>
			)}
			{!menuOpen && (
				<div
					className={tagStyles.tag_item}
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{`#${currentTopic}`}
				</div>
			)}
		</>
	);
};

export default SpeakingPart1QuestionSelector;
