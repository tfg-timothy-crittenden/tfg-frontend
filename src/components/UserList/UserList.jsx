import { useState } from "react";

import AdminList from "@/components/AdminList/AdminList";
import useAdminList from "@/hooks/useAdminList";
import { personSortOptions, sortPeople } from "@/utils/sortUtils";

/**
 * Generic user list for teachers, students, etc.
 *
 * @param {function} loadItems - async function to load items
 * @param {function} deleteItem - function to delete a single item
 * @param {function} deleteMultipleItems - function to delete multiple items
 * @param {string} itemName - singular name (e.g. "teacher")
 * @param {string} itemNamePlural - plural name (e.g. "teachers")
 * @param {function} renderItem - function (item, { isSelected, onSelect }) => ReactNode
 * @param {string} emptyMessage
 * @param {string} loadingMessage
 */
const UserList = ({
	loadItems,
	deleteItem,
	deleteMultipleItems,
	itemName = "user",
	itemNamePlural = "users",
	renderItem,
	emptyMessage = "No users found.",
	loadingMessage = "Loading...",
	sortOptions = personSortOptions,
}) => {
	const adminList = useAdminList({
		loadItems,
		deleteItem,
		deleteMultipleItems,
		itemName,
		itemNamePlural,
	});

	// Sorting state
	const [currentSort, setCurrentSort] = useState(sortOptions[0]?.key || "");

	// Sort items before passing to AdminList
	const sortedItems = sortPeople(adminList.items, currentSort);

	return (
		<AdminList
			items={sortedItems}
			loading={adminList.loading}
			selectedItems={adminList.selectedItems}
			onSelectionChange={adminList.handleSelectionChange}
			onBulkAction={adminList.handleBulkAction}
			bulkActions={adminList.bulkActions}
			renderItem={renderItem}
			renderHeader={adminList.renderHeader}
			emptyMessage={emptyMessage}
			loadingMessage={loadingMessage}
			sortOptions={sortOptions}
			currentSort={currentSort}
			onSortChange={setCurrentSort}
		/>
	);
};

export default UserList;
