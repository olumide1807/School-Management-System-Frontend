/* eslint-disable react/prop-types */
import MessageModal from "../../../../../Components/Modals/MessageModal";

export default function DeleteClassLevelModal({ openModal, closeModal, desc2, btn2Name }) {
	return (
		<MessageModal
			column
			desc={`This will remove the class level and the arms entirely
    		Are you sure you want to delete this class level?` || `${desc2}`}
			btn1Name={"Delete class level" || `${btn2Name}`}
			openModal={openModal}
			closeModal={closeModal}
		/>
	);
}
