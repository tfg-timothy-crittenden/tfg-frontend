import { X } from "lucide-react";
import styles from "./Modal.module.css";

const Modal = ({
	modalRef,
	closeModal,
	children,
	modalTitle,
	FooterContent,
}) => {
	return (
		<div
			className={styles.modal_overlay}
			onClick={(e) => {
				if (e.target === e.currentTarget) closeModal();
			}}
		>
			<div ref={modalRef} className={styles.modal_container}>
				<div className={styles.modal_header}>
					<div className={styles.modal_close_container}>
						<span onClick={closeModal} className={styles.modal_close_button}>
							<X />
						</span>
					</div>
					{modalTitle && <h4 className={styles.modal_title}>{modalTitle}</h4>}
				</div>
				<div className={styles.modal_body}>{children}</div>
				{FooterContent && <FooterContent />}
			</div>
		</div>
	);
};

export default Modal;
