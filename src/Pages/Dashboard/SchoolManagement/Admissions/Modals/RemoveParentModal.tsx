/* eslint-disable react/prop-types */
import MessageModal from "../../../../../Components/Modals/MessageModal";

export default function RemoveParentModal({ openModal, closeModal }) {
	return (
		<MessageModal
			desc="This parent/guardian will be removed from the database including linked students"
			desc2="Are you sure you want to delete this parent profile?"
			column
			btn1Name="Delete parent profile"
			openModal={openModal}
			closeModal={closeModal}
		/>
	);
}
