import Modal from "../../../../../Components/Modals";
// import { Input } from "../../../../../Components/Forms";
import FilterComponent from "../../../../../Components/FilterComponent";
import { useState } from "react";
import { Button } from "@mui/material";

export default function AddAdminModal({ openModal, closeModal, staffs }) {
  const [choiceStaff, setChoiceStaff] = useState("Select staff");
  const [adminList, setAdminList] = useState([]);
  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title="Add admin"
      otherClasses={"lg:h-[max-content]"}
      maxWidth={"40%"}
    >
      <FilterComponent
        setChoice={setChoiceStaff}
        choice={choiceStaff}
        menuLabel={"Select staff"}
        menuOptions={staffs.map((staff) => ({
          label: staff.name,
          value: staff.name,
          handleClick: (value) => {
            setChoiceStaff(value);
            setAdminList([...adminList, value]);
          },
        }))}
        multiSelect={adminList}
        setMultiSelect={setAdminList}
        otherClasses={"w-full bg-[#F7F8F8] rounded-[5px]"}
      />
      <Button
        variant="contained"
        color="tertiary"
        sx={{ width: "fit-content", color: "white", marginTop: "70px" }}
        onClick={closeModal}
      >
        Save changes
      </Button>
    </Modal>
  );
}
