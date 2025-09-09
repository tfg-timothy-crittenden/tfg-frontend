import styles from "./HeaderItem.module.css";

const HeaderItem = ({ icon: Icon, label, handleClick }) => {
	return (
		<div
			className={styles.header_item}
			onClick={handleClick}
			aria-label={label}
			role={"link"}
		>
			{Icon && <Icon />}
			{label}
		</div>
	);
};

export default HeaderItem;
