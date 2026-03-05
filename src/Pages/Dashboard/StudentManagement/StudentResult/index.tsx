import React, { useState, useRef, useEffect } from "react";
import FilterComponent from "../../../../Components/FilterComponent";
import { menuOptionsArm } from "../../SchoolManagement/Academics/tabs/Classes";
import { menuOptionsLevel } from "../../SchoolManagement/Academics/tabs/Classes";
import { SearchInput } from "../../../../Components/Forms";
import { ViewResult } from "../Modals/ViewResult";
import Button from "@mui/material/Button";
import ModifiedTableComponent from "../../../../Components/Tables/ModifiedTable";
import Avatar from "@mui/material/Avatar";
import dropdown from "../../../../assets/icons/dropdown.png";
import AddStudentParentChoiceModal from "../../SchoolManagement/Admissions/Modals/AddStudentParentChoiceModal";
import BulkUploadResultModal from "../Modals/BulkUploadResult";
import UploadStudentResult from "../Modals/UploadStudentResult";
import CustomInput from "../../../Forms/CustomInput";
import CustomSelect from "../../../Forms/CustomSelect";
export const StudentResult = () => {
  const [choiceArm, setChoiceArm] = useState("Select arm");
  const [choiceLevel, setChoiceLevel] = useState("Select level");
  const [num, setNum] = useState(0);
  const [openViewResultModal, setOpenViewResultModal] = useState(false);
  const [promoted, setPromoted] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [promotionStatus, setPromotionStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
  const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);

  const handleViewResultClick = (studentName, promotionStatusElement) => {
    setSelectedStudent(studentName);
    setPromotionStatus(promotionStatusElement);
    setOpenViewResultModal(true);
  };

  const handleDropdownClick = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest(".dropdown-container")) {
      setDropdownOpen(null);
    }
  };
  console.log(choiceArm);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  const handleMenuClick = (option) => {
    console.log(`Selected option: ${option} for `);
  };
  const dropdownOptions = [
    {
      label: "Remove Promotion",
    },
    {
      label: "SSS 1A",
    },
    {
      label: "SSS 2A",
    },
    {
      label: "SSS 3A",
    },
  ];

  const tableData = Array(num)
    .fill("")
    .map((_, i) => {
      const promotionStatusElement = (
        <div
          className={`${
            promoted
              ? "bg-bg-active text-text-active"
              : "bg-inActive text-text-inactive"
          }  p-2 text-center w-[201px] font-roboto`}
        >
          <p className="font-roboto text-sm">
            {promoted ? "Promoted to SS 2A" : "Not promoted"}
          </p>
        </div>
      );
      return {
        student: (
          <div className="flex gap-x-3">
            <Avatar sx={{ width: 42, height: 42 }} src="" alt="A" />
            <div className="flex flex-col gap-y-2.5">
              <p>Peter Adejare</p>
              <p>BAS/9301</p>
            </div>
          </div>
        ),
        gender: "M",
        status: promotionStatusElement,
        actions: [
          {
            name: "View result",
            handleClick: () =>
              handleViewResultClick(
                "Peter Adejare's Result",
                promotionStatusElement
              ),
          },
          {
            name: (
              <div className="dropdown-container relative  ">
                <div
                  className="flex items-center justify-between cursor-pointer w-[130px]"
                  onClick={() => handleDropdownClick(i)}
                >
                  <p>Promote to</p>
                  <img
                    src={dropdown}
                    className={`w-[7px] transition-transform ${
                      dropdownOpen === i ? "rotate-90" : ""
                    }`}
                    alt="dropdown"
                  />
                </div>
                {dropdownOpen === i && (
                  <div className=" absolute  w-[180px] p-2 left-[-25px] bg-white border rounded-[10px] shadow-md mt-1 flex flex-col items-start z-10">
                    {dropdownOptions.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 w-full cursor-pointer hover:bg-gray-100"
                        onClick={() => handleMenuClick(item.label)}
                      >
                        <p>{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
            handleClick: null,
          },
        ],
        id: `row_${i}`,
      };
    });

  const headcells = [
    {
      key: "student",
      name: "Student",
    },
    {
      key: "gender",
      name: "Gender",
    },
    {
      key: "status",
      name: "Promotion status",
    },
    {
      key: "actions",
      name: "",
    },
  ];

  return (
    <>
      <button
        className="bg-red-500 ml-4 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
        onClick={() => setNum(num === 6 ? 0 : 6)}
      >
        {num === 6
          ? "click to remove students for testing"
          : "click to see student list for testing"}
      </button>
      <div className="flex md:flex-row flex-col md:gap-2 gap-y-4 items-center w-full mt-[2em]">
        <div className="flex items-center gap-4 lg:flex-nowrap flex-wrap w-full max-w-[100%]">
          <CustomInput
            placeholder="Search by Student, Parent"
            otherclass="border border-[#ABABAB] rounded-[5px] px-4 max-w-[252px] bg-transparent"
            containerclass="md:w-[240px] w-full "
          />
          <div className="flex gap-4 items-center md:justify-center md:w-fit w-full">
            <FilterComponent
              menuOptions={menuOptionsLevel}
              choice={choiceLevel}
              setChoice={setChoiceLevel}
            />
            <FilterComponent
              menuOptions={menuOptionsArm}
              choice={choiceArm}
              setChoice={setChoiceArm}
            />
          </div>
          {tableData.length > 0 && (
            <div className="flex lg:justify-end items-center">
              <Button
                color="tertiary"
                variant="contained"
                type="submit"
                onClick={() => setOpenAddStudentModal(true)}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  paddingY: "12px",
                  maxWidth: "177px",

                  width: "100%",
                }}
              >
                Add result
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-[3em]">
        <ModifiedTableComponent
          headcells={headcells}
          handleClick2={() => setOpenAddStudentModal(true)}
          tableData={tableData}
          btn2Name="Add student Result"
          message="You have no student"
        />
      </div>
      <ViewResult
        openViewResultModal={openViewResultModal}
        title={selectedStudent}
        promotion_status={promotionStatus}
        closeViewResultModal={() => setOpenViewResultModal(false)}
      />
      <AddStudentParentChoiceModal
        openModal={openAddStudentModal}
        closeModal={() => setOpenAddStudentModal(false)}
        textOption={"Individual upload "}
        type="result"
        handleOpenBulkUploadModal={() => setOpenBulkUploadModal(true)}
        handleOpenManualUploadModal={() => setOpenManualUploadModal(true)}
      />
      <BulkUploadResultModal
        openModal={openBulkUploadModal}
        closeModal={() => setOpenBulkUploadModal(false)}
      />
      <UploadStudentResult
        openUploadResultModal={openManualUploadModal}
        closeUploadResultModal={() => setOpenManualUploadModal(false)}
      />
    </>
  );
};
