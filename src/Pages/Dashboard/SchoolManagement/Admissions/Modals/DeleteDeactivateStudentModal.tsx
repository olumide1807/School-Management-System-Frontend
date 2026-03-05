/* eslint-disable react/prop-types */
import MessageModal from "../../../../../Components/Modals/MessageModal";

export default function DeleteStudentModal({ openModal, closeModal }) {
  return (
    <MessageModal
      desc="This student will be removed from the database.
Are you sure you want to delete this student profile?"
      column
      btn1Name="Delete Student Profile"
      openModal={openModal}
      closeModal={closeModal}
    />
  );
}

export function DeactivateStudentModal({ openModal, closeModal }) {
  return (
    <MessageModal
      column
      desc="This student will not be able to have access to their profile. You can still activate this student anytime."
      desc2="Are you sure you want to deactivate this student?"
      btn1Name="Deactivate Student"
      openModal={openModal}
      closeModal={closeModal}
    />
  );
}
