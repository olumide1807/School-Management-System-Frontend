import Button from "@mui/material/Button";
import { useState } from "react";
import CustomSelect from "../../../../../Forms/CustomSelect";
import plusSign from "../../../../../../assets/icons/plus.svg";
import { useStudentContext } from "../../../../../../context/StudentProvider";

export default function StudentData() {
  const {
    relationshipOptions,
    parentData,
    setParentData,
    handleStudentLinkChange,
  } = useStudentContext();

  const [guardians, setGuardians] = useState([{ id: 1, selected: null }]);

  const addGuardian = () => {
    setGuardians([...guardians, { id: guardians.length + 1, selected: null }]);
    setParentData((prevData) => ({
      ...prevData,
      student_link: [
        ...prevData.student_link,
        { student_id: "", student_name: "", relationship: "" },
      ],
    }));
  };

  const deleteGuardian = (index) => {
    setParentData((prevData) => {
      const updatedStudentLink = prevData.student_link.filter(
        (_, idx) => idx !== index
      );
      return { ...prevData, student_link: updatedStudentLink };
    });
  };

  return (
    <div className="flex flex-col gap-y-9 mb-[425px]">
      <p>Select student to link with this Parent/Guardian</p>
      {parentData.student_link.map((guardian, index) => (
        <div
          key={index}
          className="flex relative flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0"
        >
          <CustomSelect
            label="Student"
            required={true}
            name="student_name"
            placeholder="Select Student"
            selectOption={["Student 1", "Student 2"]}
            value={parentData.student_link[index]?.student_name || ""}
            onChange={(e) => handleStudentLinkChange(index, e)}
          />
          <CustomSelect
            label="Relationship"
            name="relationship"
            required={true}
            placeholder="Select Relationship"
            selectOption={relationshipOptions}
            value={parentData.student_link[index]?.relationship || ""}
            onChange={(e) => handleStudentLinkChange(index, e)}
          />
          {index !== 0 && (
            <p
              className="absolute cursor-pointer right-0 md:right-[-2em] md:top-[2.5em] text-removeRed pl-[5px] pr-[5px] bg-bgRemoveRed rounded-[50%]"
              onClick={() => deleteGuardian(index)}
            >
              X
            </p>
          )}
        </div>
      ))}
      <Button
        color="tertiary"
        variant="contained"
        onClick={addGuardian}
        sx={{
          color: "white",
          borderRadius: "10px",
          paddingY: "12px",
          maxWidth: "177px",
          width: "100%",
        }}
      >
        <div className="flex gap-x-2">
          <img src={plusSign} alt="Plus Sign" className="" />
          <p>Add more student</p>
        </div>
      </Button>
    </div>
  );
}
