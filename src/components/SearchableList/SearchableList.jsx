import { useState } from "react";

import useThrottledValue from "@/hooks/useThrottledValue";

import styles from "./SearchableList.module.css";

const SearchableList = ({ listItems = [], onSelectItem, selectedItemId }) => {
	const [searchTerm, setSearchTerm] = useState("");

	const throttledSearchTerm = useThrottledValue(searchTerm, 300);

	let filteredItems = [];

	const filterItems = () => {
		const term = throttledSearchTerm.trim().toLowerCase();
		if (!term) return listItems;
		return listItems.filter((c) => c.name?.toLowerCase().includes(term));
	};

	filteredItems = filterItems();

	const handleSelectItem = (item) => {
		// Pass the selected item ID up to the parent
		onSelectItem(item);
	};

	return (
		<div>
			<h2 className={styles.mobileHeading}>Classes</h2>
			<input
				placeholder="Search classes..."
				className={styles.search_input}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<ul
				id="class-listbox"
				role="listbox"
				aria-label="Class list"
				className={styles.item_list}
			>
				{filteredItems.map((item, idx) => {
					//Highlight the item that has been selected
					const selected = item.id === selectedItemId;

					return (
						<li
							key={item.id}
							data-index={idx}
							role="option"
							aria-selected={selected}
							className={`${styles.list_item} ${
								selected ? styles.selected_item : ""
							}`}
							onClick={() => handleSelectItem(item)}
						>
							{item.name}
						</li>
					);
				})}
				{filteredItems.length === 0 && (
					<li
						className={styles.list_item}
						aria-disabled="true"
						style={{ opacity: 0.6 }}
					>
						No matches
					</li>
				)}
			</ul>
		</div>
	);
};

export default SearchableList;
