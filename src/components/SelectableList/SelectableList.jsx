import React from "react";
import styles from "./SelectableList.module.css";

const SelectableList = ({
	listItems,
	ListItem,
	heading,
	selectedItemsIds = new Set(),
	setSelectedItemsIds,
}) => {
	const handleItemClick = (itemId) => {
		if (selectedItemsIds.has(itemId)) {
			setSelectedItemsIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(itemId);
				return newSet;
			});
		} else {
			setSelectedItemsIds((prev) => {
				const newSet = new Set(prev);
				newSet.add(itemId);
				return newSet;
			});
		}
	};

	const assignedItems = listItems.filter((item) =>
		selectedItemsIds.has(item.id)
	);
	const unassignedItems = listItems.filter(
		(item) => !selectedItemsIds.has(item.id)
	);

	return (
		<div className={styles.list_container}>
			<h2 className={styles.list_heading}>{heading}</h2>
			<div className={`${styles.grouped_list} scrollable_inner`}>
				{assignedItems.length > 0 && (
					<>
						<h3 className={styles.group_header}>Assigned Materials</h3>
						{assignedItems.map((item) => (
							<ListItem
								key={item.id}
								item={item}
								isChecked={true}
								onToggle={handleItemClick}
							/>
						))}
					</>
				)}

				{unassignedItems.length > 0 && (
					<>
						<h3 className={styles.group_header}>Available Materials</h3>
						{unassignedItems.map((item) => (
							<ListItem
								key={item.id}
								item={item}
								isChecked={false}
								onToggle={handleItemClick}
							/>
						))}
					</>
				)}
			</div>
		</div>
	);
};

export default SelectableList;
