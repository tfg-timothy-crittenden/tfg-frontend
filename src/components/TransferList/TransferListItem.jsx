import styles from "./TransferListItem.module.css";

const getItemId = (item) => {
	const value =
		item?.materialId ??
		item?.material_id ??
		item?.id ??
		item?.materialNodeId ??
		item?.material_node_id ??
		null;
	return value === null || value === undefined ? null : String(value);
};

const TransferListItem = ({ item, onToggle, isChecked, disabled }) => {
	const itemId = getItemId(item);
	const itemLabel = item?.name || item?.title || `Material ${itemId ?? ""}`;

	return (
		<li
			className={`${styles.container} ${isChecked ? styles.selected : ""} ${
				disabled ? styles.disabled : ""
			}`}
			onClick={() => {
				if (!disabled && itemId !== null) onToggle(itemId);
			}}
		>
			<span className={styles.label}>
				{itemLabel}
				<span className={isChecked ? styles.removeIcon : styles.arrow}></span>
			</span>
		</li>
	);
};

export default TransferListItem;
