import styles from "./TransferListItem.module.css";
import TransferListTestRepresentation from "./TransferListTestRepresentation";

const getItemId = (item) => {
	const value = item?.materialId;
	return value === null || value === undefined ? null : String(value);
};

const TransferListItem = ({ item, onToggle, isChecked, disabled }) => {
	const itemId = getItemId(item);

	return (
		<li
			className={`${styles.container} ${isChecked ? styles.selected : ""} ${
				disabled ? styles.disabled : ""
			}`}
			onClick={() => {
				if (!disabled && itemId !== null) onToggle(itemId);
			}}
		>
			<div className={styles.row}>
				<TransferListTestRepresentation
					sectionTitle={item?.sectionTitle}
					part1Title={item?.part1Title}
					part2Title={item?.part2Title}
				/>
				<span className={styles.iconWrapper}>
					<span className={isChecked ? styles.removeIcon : styles.arrow}></span>
				</span>
			</div>
		</li>
	);
};

export default TransferListItem;
