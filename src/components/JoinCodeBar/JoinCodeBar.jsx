import React, { useState } from "react";
import { QrCode, Maximize2, Copy, Check, UserRoundPlus } from "lucide-react";
import styles from "./JoinCodeBar.module.css";

const JoinCodeBar = ({ code, onOpenModal, showLabel }) => {
	return (
		<>
			<UserRoundPlus />
			{showLabel && <span className={styles.label}>Invite</span>}
		</>
	);
};

export default JoinCodeBar;
