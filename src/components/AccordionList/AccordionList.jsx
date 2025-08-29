import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./AccordionList.module.css";

// Displays a collapsable list of items
// Highlights the currently selected list
// Chevrons change direction when list is opened or collapsed
// List label and chevrons can be hidden by applying class conditionally with parentIsOpen - useful when parent is a navBar of adjustable width

const AccordionList = ({
	icon,
	label,
	labelIsVisible,
	chevronIsVisible,
	listIsOpen,
	onHeaderClick, // can be used to open/close the list and perform other actions
	items,
	activeItemId,
	onItemClick, // performs action when item is selected
	headerIsHighlighted = false,
}) => (
	<div className={styles.accordion_container}>
		<div
			className={`${styles.accordion_header} ${
				headerIsHighlighted ? styles.active_header : ""
			}`}
			onClick={onHeaderClick}
		>
			<span className={styles.icon_label}>
				{icon}
				<span
					className={`${styles.label} ${
						labelIsVisible ? styles.labelVisible : styles.labelHidden
					}`}
				>
					{label}
				</span>
			</span>

			<span
				className={`${styles.chevron} ${
					chevronIsVisible ? styles.chevronVisible : styles.chevronHidden
				}`}
			>
				{listIsOpen ? <ChevronUp /> : <ChevronDown />}
			</span>
		</div>
		<div
			className={`${styles.accordion_wrapper} ${listIsOpen ? styles.open : ""}`}
		>
			<ul className={styles.test_list}>
				{items.map((item) => {
					return (
						<li
							key={item.testId}
							className={`${styles.list_item} ${
								activeItemId === item.testId ? styles.active : ""
							}`}
							onClick={() => onItemClick(item)}
						>
							<span className={styles.test_title}>{item.title}</span>
							{item.readingTitle && (
								<span className={styles.reading_title}>
									{item.readingTitle}
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</div>
	</div>
);

export default AccordionList;
