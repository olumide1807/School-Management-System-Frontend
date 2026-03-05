/* eslint-disable react/prop-types */
// import { useState } from "react";
import { MessageModal2 } from "../../../../../Components/Modals/MessageModal";
import Student from "../tabs/Student";

export default function AddStudentParentChoiceModal({
  openModal,
  closeModal,
  handleOpenManualUploadModal,
  handleOpenBulkUploadModal,
  type,
  textOption,
}) {
  // const [active, setActive] = useState(false);
  return (
    <div className="">
      <MessageModal2
        desc={`How do you want to add ${type || "student"}?`}
        openModal={openModal}
        closeModal={closeModal}
      >
        <div className="flex flex-col gap-y-14 justify-center items-stretch md:pb-0 pb-9 md:w-full w-[80%] m-auto">
          <div
            className={`py-4 px-5 text-center rounded-[5px] cursor-pointer  border border-[#DDDDDD] hover:bg-bg-8`}
            onClick={() => {
              handleOpenManualUploadModal();
              closeModal();
            }}
          >
            {textOption || "Manual upload"}
            {type}
          </div>
          <div
            className={`py-4 px-5 text-center rounded-[5px] cursor-pointer border border-[#DDDDDD] hover:bg-bg-8`}
            onClick={() => {
              handleOpenBulkUploadModal();
              closeModal();
            }}
          >
            Bulk upload {type}
          </div>
        </div>
      </MessageModal2>
    </div>
  );
}
