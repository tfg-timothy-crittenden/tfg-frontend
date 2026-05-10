import React from "react";
import { ChevronUp, ChevronDown, File } from "lucide-react";
import styles from "./AccordionList.module.css";
import TransferListTestRepresentation from "@/components/TransferList/TransferListTestRepresentation";

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
				listIsOpen ? styles.header_open : styles.header_closed
			} ${headerIsHighlighted ? styles.active_header : ""}`}
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
					const isActive = activeItemId === item.testId;

					return (
						<li
							key={item.testId}
							className={`${styles.list_item} ${isActive ? styles.active : ""}`}
							onClick={() => onItemClick(item)}
						>
							<span className={styles.item_main}>
								{/* <File size={18} className={styles.item_icon} /> */}
								<span className={styles.item_text}>
									<TransferListTestRepresentation
										sectionTitle={item.sectionTitle}
										part1Title={item.part1Title}
										part2Title={item.part2Title}
										isActive={isActive}
									/>
								</span>
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	</div>
);

export default AccordionList;
