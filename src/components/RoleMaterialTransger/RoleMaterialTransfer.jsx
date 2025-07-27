import React from "react";
import styles from "./RoleMaterialTransfer.module.css";

const RoleMaterialTransfer = ({
	listName,
	allMaterials,
	assignedItemsIds,
	setAssignedItemsIds,
	ListItem,
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

	const assignedItems = allMaterials.filter((item) =>
		assignedItemsIds.has(item.id)
	);
	const availableItems = allMaterials.filter(
		(item) => !assignedItemsIds.has(item.id)
	);

	return (
		<div className={styles.role_container}>
			<div className={styles.lists_wrapper}>
				{/* Assigned on the left */}
				<div className={styles.list_column}>
					<div className={styles.library_header}>
						<h3 className={styles.list_heading}>Assigned to {listName}</h3>
					</div>

					<ul className={`scrollable_inner ${styles.scrollable_list}`}>
						{assignedItems.map((item) => (
							<ListItem
								key={item.id}
								item={item}
								isChecked={true}
								onToggle={handleToggle}
								disabled={!isLibraryOpen}
							/>
						))}
					</ul>
					{isLibraryOpen && (
						<div className={styles.action_buttons}>
							<button className="action_button save_button">Save</button>
							<button className="action_button">Cancel</button>
						</div>
					)}
				</div>

				{/* Library on the right — always rendered */}
				<div className={`${styles.list_column} ${styles.library_column}`}>
					{isLibraryOpen ? (
						<>
							<div className={styles.library_header}>
								<h3 className={styles.list_heading}>Test Library</h3>
								<div
									role="button"
									className={styles.close_library_button}
									onClick={() => setIsLibraryOpen(false)}
								>
									<svg
										height="20px"
										width="auto"
										viewBox="0 0 20 20"
										aria-hidden="true"
										focusable="false"
										className={styles.deleteRowIcon}
									>
										<path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
									</svg>
								</div>
							</div>
							<ul className={`scrollable_inner ${styles.scrollable_list}`}>
								{availableItems.map((item) => (
									<ListItem
										key={item.id}
										item={item}
										isChecked={false}
										onToggle={handleToggle}
									/>
								))}
							</ul>
						</>
					) : (
						<div className={styles.placeholder_column}>
							<button
								className={styles.openButton}
								onClick={() => setIsLibraryOpen(true)}
							>
								Open Test Library
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RoleMaterialTransfer;
