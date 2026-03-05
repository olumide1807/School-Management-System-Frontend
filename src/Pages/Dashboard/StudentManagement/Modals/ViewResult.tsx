import React, { useState, useEffect } from "react";
import Modal from "../../../../Components/Modals";
import {
  menuOptionsArm,
  menuOptionsLevel,
} from "../../SchoolManagement/Academics/tabs/Classes";
import FilterComponent from "../../../../Components/FilterComponent";
import TableComponent from "../../../../Components/Tables";
import Button from "@mui/material/Button";

type ResultData = {
  subject: string;
  ca1: string;
  ca2: string;
  exam: string;
  total: string;
  grade: string;
  remark: string;
  id: string;
};

interface ViewResultProps {
  openViewResultModal: boolean;
  closeViewResultModal: () => void;
  title?: string;
  promotion_status?: string;
}
export const ViewResult: React.FC<ViewResultProps> = ({
  openViewResultModal,
  closeViewResultModal,
  title,
  promotion_status,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [resultData, setResultData] = useState<ResultData[]>([]);
  const [originalData, setOriginalData] = useState<ResultData[]>([]);

  const [choiceArm, setChoiceArm] = useState<string>("A");
  const [choiceLevel, setChoiceLevel] = useState<string>("SSS 1");
  const [choiceSessions, setChoiceSessions] = useState<string>("2021/2022");
  const [choiceTerms, setChoiceTerms] = useState<string>("First Term");

  useEffect(() => {
    const initialData = Array(6)
      .fill("")
      .map((_, i) => ({
        subject: "Mathematics",
        ca1: "15",
        ca2: "15",
        exam: "40",
        total: "70",
        grade: "A",
        remark: "Excellent",
        id: `row_${i}`,
      }));
    setResultData(initialData);
    setOriginalData(initialData);
  }, []);

  const getColor = (grade: string): string => {
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

  const calculateTotal = (ca1: number, ca2: number, exam: number) => {
    return Number(ca1) + Number(ca2) + Number(exam);
  };

  const handleInputChange = (
    id: string,
    field: keyof ResultData,
    value: string
  ) => {
    setResultData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              total: calculateTotal(
                field === "ca1" ? Number(value) : Number(item.ca1),
                field === "ca2" ? Number(value) : Number(item.ca2),
                field === "exam" ? Number(value) : Number(item.exam)
              ).toString(),
            }
          : item
      )
    );
  };

  const handleEditResult = () => {
    setIsEditing(true);
  };

  const handleUploadResult = () => {
    // Here you would typically send the data to your backend
    console.log("Uploading result:", resultData);
    setIsEditing(false);
    setOriginalData(resultData);
  };

  const handleDiscardChanges = () => {
    setResultData(originalData);
    setIsEditing(false);
  };

  const tableData = resultData.map((item) => ({
    ...item,
    ca1: isEditing ? (
      <input
        title="ca1"
        type="number"
        value={item.ca1}
        onChange={(e) => handleInputChange(item.id, "ca1", e.target.value)}
        className="text-center pl-4 w-[86px] h-[40px] border border-gray-300 rounded"
      />
    ) : (
      item.ca1
    ),
    ca2: isEditing ? (
      <input
        title="ca2"
        type="number"
        value={item.ca2}
        onChange={(e) => handleInputChange(item.id, "ca2", e.target.value)}
        className="text-center pl-4 w-[86px] h-[40px] border border-gray-300 rounded"
      />
    ) : (
      item.ca2
    ),
    exam: isEditing ? (
      <input
        title="exam"
        type="number"
        value={item.exam}
        onChange={(e) => handleInputChange(item.id, "exam", e.target.value)}
        className="text-center pl-4 w-[86px] h-[40px] border border-gray-300 rounded"
      />
    ) : (
      item.exam
    ),
    total: item.total,
    grade: <p className={`${getColor(item.grade)}`}>{item.grade}</p>,
    remark: <p className={`${getColor(item.grade)}`}>{item.remark}</p>,
  }));

  const headcells = [
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
      openModal={openViewResultModal}
      closeModal={closeViewResultModal}
      title={title || "View Result"}
      promotion_status={promotion_status || ""}
      maxWidth="1300px"
    >
      <div className="flex flex-col md:flex-row md:flex-wrap items-center w-full mt-[2em] gap-[2em]">
        <div className="flex flex-col items-start gap-y-2 w-full md:w-[250px]">
          <label htmlFor="">Session</label>
          <FilterComponent
            menuOptions={menuOptionsSessions}
            choice={choiceSessions}
            setChoice={setChoiceSessions}
            otherClasses2="px-3 py-3"
            otherClasses="w-full"
          />
        </div>
        <div className="flex flex-col items-start gap-y-2 w-full md:w-[250px]">
          <label htmlFor="">Term</label>
          <FilterComponent
            menuOptions={menuOptionsTerms}
            choice={choiceTerms}
            setChoice={setChoiceTerms}
            otherClasses2="px-3 py-3"
            otherClasses="w-full"
          />
        </div>
        <div className="flex flex-col items-start gap-y-2 w-full md:w-[250px]">
          <label htmlFor="">Class Level</label>
          <FilterComponent
            menuOptions={menuOptionsLevel}
            choice={choiceLevel}
            setChoice={setChoiceLevel}
            otherClasses2="px-3 py-3"
            otherClasses="w-full"
          />
        </div>
        <div className="flex flex-col items-start gap-y-2 w-full md:w-[250px]">
          <label htmlFor="">Arm</label>
          <FilterComponent
            menuOptions={menuOptionsArm}
            choice={choiceArm}
            setChoice={setChoiceArm}
            otherClasses2="px-3 py-3"
            otherClasses="w-full"
          />
        </div>
      </div>

      <div className="mt-[3em]">
        <TableComponent headcells={headcells} tableData={tableData} />
      </div>

      <div className="w-full flex justify-start gap-4 mt-[3em]">
        {!isEditing ? (
          <Button
            color="tertiary"
            variant="contained"
            onClick={handleEditResult}
            sx={{
              color: "white",
              borderRadius: "10px",
              paddingY: "12px",
              maxWidth: "177px",
              width: "100%",
            }}
          >
            Edit Result
          </Button>
        ) : (
          <>
            <Button
              color="tertiary"
              variant="contained"
              onClick={handleUploadResult}
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "177px",
                width: "100%",
              }}
            >
              Upload Result
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              onClick={handleDiscardChanges}
              sx={{
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "177px",
                width: "100%",
              }}
            >
              Discard Changes
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
const menuOptionsSessions = [
  {
    label: "2024/2025",
    value: "2024/2025",
  },
  {
    label: "2023/2024",
    value: "2023/2024",
  },
  {
    label: "2022/2023",
    value: "2022/2023",
  },
];
const menuOptionsTerms = [
  {
    label: "First Term",
    value: "First Term",
  },
  {
    label: "Second Term",
    value: "Second Term",
  },
  {
    label: "Third Term",
    value: "Third Term",
  },
];

// ... (menuOptions remain unchanged)
