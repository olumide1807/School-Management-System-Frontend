import { useState } from "react";
import Modal from "../../../../Components/Modals";
import I_icon from "../../../../assets/icons/i_icon.svg";
import Button from "@mui/material/Button";
import TableComponent, { HeadCell } from "../../../../Components/Tables";
import CustomSelect from "../../../Forms/CustomSelect";
interface UploadStudentResultProps {
  openUploadResultModal: boolean;
  closeUploadResultModal: () => void;
  title?: string;
}
const UploadStudentResult = ({
  openUploadResultModal,
  closeUploadResultModal,
  title,
}: UploadStudentResultProps) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    session: "",
    term: "",
    level: "",
    arm: "",
    student: "",
    promotion: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prev) => {
      const newValues = { ...prev, [name]: Number(value) };

      // Calculate and update the total for this row
      const rowIndex = name.split("_")[1];
      const ca1 = newValues[`ca1_${rowIndex}`] || 0;
      const ca2 = newValues[`ca2_${rowIndex}`] || 0;
      const exam = newValues[`exam_${rowIndex}`] || 0;
      newValues[`total_${rowIndex}`] = ca1 + ca2 + exam;

      return newValues;
    });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<{ name: string; value: any }>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDiscardChanges = () => {
    setInputValues({});
    setFormData({
      session: "",
      term: "",
      level: "",
      arm: "",
      student: "",
      promotion: "",
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    console.log(inputValues);
    // Handle form submission logic here
  };

  const getColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "F":
        return "text-red-600";
      default:
        return "text-black";
    }
  };

  const tableData = Array(1)
    .fill("")
    .map((_, i) => {
      const ca1 = inputValues[`ca1_${i}`] || 0;
      const ca2 = inputValues[`ca2_${i}`] || 0;
      const exam = inputValues[`exam_${i}`] || 0;
      const total = ca1 + ca2 + exam;
      return {
        subject: "Mathematics",
        ca1: (
          <input
            type="number"
            name={`ca1_${i}`}
            placeholder="0"
            value={ca1 || ""}
            onChange={handleInputChange}
            className="text-center pl-4 w-[86px] h-[40px] border border-gray-300 rounded"
          />
        ),
        ca2: (
          <input
            type="number"
            name={`ca2_${i}`}
            placeholder="0"
            value={ca2 || ""}
            onChange={handleInputChange}
            className="text-center pl-4  w-[86px] h-[40px] py-1 px-2 border border-gray-300 rounded"
          />
        ),
        exam: (
          <input
            type="number"
            name={`exam_${i}`}
            placeholder="0"
            value={exam || ""}
            onChange={handleInputChange}
            className="text-center pl-4  w-[86px] h-[40px] py-1 px-2 border border-gray-300 rounded"
          />
        ),
        total: <p>{total}</p>,
        grade: <p className={`${getColor("A")}`}>A</p>,
        remark: <p className={`${getColor("A")}`}>Excellent</p>,
        id: `row_${i}`,
      };
    });

  const headcells: HeadCell[] = [
    { key: "subject", name: "Subject" },
    {
      key: "ca1",
      name: (
        <div className="flex items-center gap-x-1">
          <p>CA 1 </p>
          <p className="text-tertiary">(20)</p>
        </div>
      ),
    },
    {
      key: "ca2",
      name: (
        <div className="flex items-center gap-x-1">
          <p>CA 2</p>
          <p className="text-tertiary">(20)</p>
        </div>
      ),
    },
    {
      key: "exam",
      name: (
        <div className="flex items-center gap-x-1">
          <p>Exam</p>
          <p className="text-tertiary">(60)</p>
        </div>
      ),
    },
    {
      key: "total",
      name: (
        <div className="flex items-center gap-x-1">
          <p>Total</p>
          <p className="text-tertiary">(100)</p>
        </div>
      ),
    },
    { key: "grade", name: "Grade" },
    { key: "remark", name: "Remark" },
  ];

  return (
    <Modal
      openModal={openUploadResultModal}
      closeModal={closeUploadResultModal}
      title={title || "Upload Student result"}
      maxWidth="1300px"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-y-[3em]">
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <CustomSelect
              label="Session"
              name="session"
              placeholder="Select session"
              containerclass="bg-transparent rounded-[2px]"
              selectOption={[]}
              value={formData.session}
              onChange={handleSelectChange}
            />
            <CustomSelect
              label="Term"
              name="term"
              placeholder="Select term"
              containerclass="bg-transparent rounded-[2px]"
              selectOption={[]}
              value={formData.term}
              onChange={handleSelectChange}
            />
            <CustomSelect
              label="Class level"
              name="level"
              placeholder="Select class level"
              containerclass="bg-transparent rounded-[2px]"
              selectOption={[]}
              value={formData.level}
              onChange={handleSelectChange}
            />
            <CustomSelect
              label="Class arm"
              name="arm"
              placeholder="Select class arm"
              containerclass="bg-transparent rounded-[2px]"
              selectOption={[]}
              value={formData.arm}
              onChange={handleSelectChange}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <CustomSelect
              label="Student name"
              name="student"
              placeholder="Select Student"
              selectOption={[]}
              containerclass="bg-transparent rounded-[2px]"
              value={formData.student}
              onChange={handleSelectChange}
            />
            <CustomSelect
              label="Promote to"
              name="promotion"
              placeholder="SSS 2A"
              selectOption={[]}
              containerclass="max-w-[180px] bg-transparent border-[1.5px] border-lightGreen rounded-[2px]"
              value={formData.promotion}
              onChange={handleSelectChange}
            />
          </div>
        </div>
        <div className="flex bg-bgLightGreen p-1 w-[248px] gap-3">
          <img src={I_icon} alt="i icon" />
          <p className="font-light">Click on the box to edit</p>
        </div>
        <div>
          <TableComponent headcells={headcells} tableData={tableData} />
        </div>
        <div className="flex gap-4 items-center">
          <Button
            color="tertiary"
            variant="outlined"
            onClick={handleDiscardChanges}
            sx={{
              color: "tertiary",
              borderRadius: "10px",
              paddingY: "12px",
              maxWidth: "177px",
              width: "100%",
            }}
          >
            Discard changes
          </Button>
          <Button
            color="tertiary"
            variant="contained"
            type="submit"
            sx={{
              color: "white",
              borderRadius: "10px",
              paddingY: "12px",
              maxWidth: "177px",
              width: "100%",
            }}
          >
            Upload student
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadStudentResult;
