import React from "react";
import styles from "./RoleMaterialTransfer.module.css";
import documents_icon from "@/assets/icons/documents_icon.png";
import library_icon from "@/assets/icons/library_icon.png";

const getItemId = (item) => {
	const value = item?.materialId ?? item?.material_id ?? item?.id ?? null;
	return value === null || value === undefined ? null : String(value);
};

const getItemIdCandidates = (item) => {
	const candidates = [
		item?.materialId,
		item?.material_id,
		item?.id,
		item?.materialNodeId,
		item?.material_node_id,
	]
		.filter((value) => value !== null && value !== undefined)
		.map((value) => String(value));

	return [...new Set(candidates)];
};

const RoleMaterialTransfer = ({
	allMaterials = [],
	assignedItems = [],
	assignedItemsIds = new Set(),
	allAssignedItemIds = new Set(),
	setAssignedItemsIds,
	isAssignedListVisible,
	ListItem: MaterialListItem,
	isLibraryOpen,
	setIsLibraryOpen,
}) => {
	const handleToggle = (itemId) => {
		if (!isLibraryOpen) return;

		setAssignedItemsIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) newSet.delete(itemId);
			else newSet.add(itemId);
			return newSet;
		});
	};

	const inferredAssignedItems = allMaterials.filter((item) => {
		const itemId = getItemId(item);
		return itemId !== null && assignedItemsIds.has(itemId);
	});

	const assignedItemsToRender = Array.isArray(assignedItems)
		? assignedItems
		: inferredAssignedItems;

	const libraryItems = allMaterials;

	return (
		<div className={styles.role_container}>
			<div className={styles.lists_wrapper}>
				<div className={styles.list_column}>
					<h3 className={styles.list_heading}>Assigned</h3>
					{isAssignedListVisible ? (
						assignedItemsToRender.length > 0 ? (
							<ul className={`scrollable_inner ${styles.scrollable_list}`}>
								{assignedItemsToRender.map((item, index) =>
									React.createElement(MaterialListItem, {
										key: `${getItemId(item) || item.name}-${index}`,
										item,
										isChecked: true,
										onToggle: handleToggle,
										disabled: !isLibraryOpen,
									}),
								)}
							</ul>
						) : (
							<div
								className={`${styles.empty_state} ${styles.scrollable_list}`}
							>
								<img
									src={documents_icon}
									alt="No tests icon"
									className={styles.empty_icon}
								/>
								<h4>No tests assigned yet</h4>
								<p className={styles.empty_description}>
									Use the library to assign materials to this class.
								</p>
							</div>
						)
					) : (
						<div className={`${styles.empty_state} ${styles.scrollable_list}`}>
							<img
								src={documents_icon}
								alt="Documents Icon"
								className={styles.empty_icon}
							/>
							<p className={styles.empty_description}>
								Select a class to view materials
							</p>
						</div>
					)}
				</div>

				<div className={`${styles.list_column} ${styles.library_column}`}>
					<div className={styles.library_header}>
						<h3 className={styles.list_heading}>Test Library</h3>
					</div>
					{isLibraryOpen ? (
						<ul className={`scrollable_inner ${styles.scrollable_list}`}>
							{libraryItems.map((item, index) => {
								const itemId = getItemId(item);
								const idCandidates = getItemIdCandidates(item);
								const isAssignedAnywhere = idCandidates.some((id) =>
									allAssignedItemIds?.has(id),
								);

								return React.createElement(MaterialListItem, {
									key: `${itemId || item.name}-${index}`,
									item,
									isChecked: false,
									onToggle: handleToggle,
									disabled: isAssignedAnywhere,
								});
							})}
						</ul>
					) : (
						<div className={styles.empty_state + " " + styles.scrollable_list}>
							<img
								src={library_icon}
								alt="Library Icon"
								className={styles.empty_icon}
							/>
							<button
								className="action_button"
								onClick={() => setIsLibraryOpen(true)}
								disabled={!isAssignedListVisible}
							>
								Assign Tests from Library
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RoleMaterialTransfer;
