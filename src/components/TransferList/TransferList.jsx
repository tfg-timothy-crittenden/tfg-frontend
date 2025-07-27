import { useState } from "react";
import styles from "./TransferList.module.css";

const TransferList = ({
	leftItems = [],
	rightItems = [],
	setLeftItems,
	setRightItems,
	ItemComponent, // Required
	leftTitle = "Available",
	rightTitle = "Selected",
}) => {
	if (!ItemComponent) {
		throw new Error("TransferList requires an ItemComponent prop.");
	}

	const [checkedLeft, setCheckedLeft] = useState(new Set());
	const [checkedRight, setCheckedRight] = useState(new Set());

	const toggle = (id, checkedSet, setCheckedSet) => {
		const newSet = new Set(checkedSet);
		newSet.has(id) ? newSet.delete(id) : newSet.add(id);
		setCheckedSet(newSet);
	};

	const transfer = (
		fromItems,
		toItems,
		setFromItems,
		setToItems,
		checkedSet,
		setCheckedSet
	) => {
		const idsToMove = Array.from(checkedSet);
		const idSet = new Set(idsToMove);

		const toMove = fromItems.filter((item) => idSet.has(item.id));
		const remaining = fromItems.filter((item) => !idSet.has(item.id));

		const deduped = Array.from(
			new Map([...toItems, ...toMove].map((item) => [item.id, item])).values()
		);

		setToItems(deduped);
		setFromItems(remaining);
		setCheckedSet(new Set());
	};

	const renderList = (items, checkedSet, setCheckedSet) => (
		<ul className={`${styles.list} scrollable_inner`}>
			{items.map((item) => (
				<ItemComponent
					key={item.id}
					item={item}
					isChecked={checkedSet.has(item.id)}
					onToggle={() => toggle(item.id, checkedSet, setCheckedSet)}
				/>
			))}
		</ul>
	);

	return (
		<section className={styles.container}>
			<div className={styles.list_container}>
				<h2 className={styles.list_heading}>{leftTitle}</h2>
				{renderList(leftItems, checkedLeft, setCheckedLeft)}
				<button className={"action_button save_button"}>save</button>
				<button className={"action_button"}>revert</button>
			</div>

			<div className={styles.transfer_buttons}>
				<button
					disabled={checkedRight.size === 0}
					className={styles.transfer_button}
					onClick={() =>
						transfer(
							rightItems,
							leftItems,
							setRightItems,
							setLeftItems,
							checkedRight,
							setCheckedRight
						)
					}
				>
					&lt;&lt;
				</button>
				<button
					disabled={checkedLeft.size === 0}
					className={styles.transfer_button}
					onClick={() =>
						transfer(
							leftItems,
							rightItems,
							setLeftItems,
							setRightItems,
							checkedLeft,
							setCheckedLeft
						)
					}
				>
					&gt;&gt;
				</button>
			</div>

			<div className={styles.list_container}>
				<h2 className={styles.list_heading}>{rightTitle}</h2>
				{renderList(rightItems, checkedRight, setCheckedRight)}
			</div>
		</section>
	);
};

export default TransferList;
