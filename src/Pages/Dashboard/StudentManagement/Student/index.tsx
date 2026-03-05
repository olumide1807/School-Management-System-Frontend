import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { menuOptionsArm } from "../../SchoolManagement/Academics/tabs/Classes";
import { menuOptionsLevel } from "../../SchoolManagement/Academics/tabs/Classes";
import FilterComponent from "../../../../Components/FilterComponent";
import { DashboardCard2 } from "../../../../Components/DashboardCard";
import { SearchInput } from "../../../../Components/Forms";
import Avatar from "@mui/material/Avatar";
import moment from "moment";
import { menuOptionsDownload } from "../../SchoolManagement/Admissions/tabs/Student";
import ModifiedTableComponent from "../../../../Components/Tables/ModifiedTable";
import TableComponent from "../../../../Components/Tables";
import AddStudentParentChoiceModal from "../../SchoolManagement/Admissions/Modals/AddStudentParentChoiceModal";
import DeleteStudentModal from "../../SchoolManagement/Admissions/Modals/DeleteDeactivateStudentModal";
import LinkGuardianModal from "../../SchoolManagement/Admissions/Modals/LinkGuardianModal";
import BulkUploadModal from "../../SchoolManagement/Admissions/Modals/BulkUploadModal";
import ManualUploadModal from "../../SchoolManagement/Admissions/Modals/ManualUploadModal";
import EditStudentProfile from "../../SchoolManagement/Admissions/Modals/EditStudentProfile";
import CustomInput from "../../../Forms/CustomInput";
import CustomSelect from "../../../Forms/CustomSelect";
import Modal from "../../../../Components/Modals";
import ThreeDots from "../../../../assets/icons/three_dots_option.svg";
export const Student = () => {
  const [choiceArm, setChoiceArm] = useState("Arm");
  const [choiceLevel, setChoiceLevel] = useState("Class");
  const [choiceStatus, setChoiceStatus] = useState("Filter");
  const [choiceDownload, setChoiceDownload] = useState("Download");
  const [choiceAdd, setChoiceAdd] = useState("Add student");
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);
  const [openDeleteStudentModal, setOpenDeleteStudentModal] = useState(false);
  const [openLinkGuardianModal, setOpenLinkGuardianModal] = useState(false);
  const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
  const [openOptionModal, setOpenOptionModal] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const navigate = useNavigate();

  const [num, setNum] = useState(0);
  const menuOptionsStatus = [
    {
      label: "All Students",
      value: "All Students",
    },
    {
      label: "Activated Students",
      value: "Activated Students",
    },
    {
      label: "Deactivated Students",
      value: "Deactivated Students",
    },

    {
      label: "Linked Students",
      value: "Linked Students",
    },
    {
      label: "Non-Linked Students",
      value: "Non-Linked Students",
    },
  ];

  const tableData = Array(num)
    .fill("")
    .map((_, i) => ({
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
      level: "SSS1",
      guardian: "Mr. Peter Adejare",
      status: (
        <div
          className={`${
            promoted
              ? "bg-bg-active text-text-active"
              : "bg-inActive text-text-inactive"
          }  p-2 capitalize text-center w-[6rem]`}
        >
          {promoted ? "ACTIVE" : "INACTIVE"}
        </div>
      ),
      actions: [
        {
          name: "View profile",
          handleClick: () => navigate("?profile=student"),
        },
        {
          name: "Edit profile",
          handleClick: () => navigate("?action=edit-student"),
          // handleClick: (studentId) => navigate(`?action=edit&id=${studentId}`),
        },
        {
          name: "Link Parent/Guardian",
          handleClick: () => setOpenLinkGuardianModal(true),
        },

        {
          name: <p style={{ color: "#FE3030" }}>Delete Student</p>,
          handleClick: () => setOpenDeleteStudentModal(true),
        },
      ],
      id: `row_${i}`,
    }));
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
      key: "level",
      name: "Class level",
    },
    {
      key: "guardian",
      name: "Parent/Guardian",
    },
    {
      key: "status",
      name: "Status",
    },
    {
      key: "actions",
      name: "",
    },
  ];
  const menuOptionsAdd = [
    {
      label: "Individual upload student",
      value: "Individual upload student",
      //   handleClick: () => setOpenManualUploadModal(true),
      handleClick: () => navigate("?action=add-student"),
    },
    {
      label: "Bulk upload student",
      value: "Bulk upload student",
      handleClick: () => setOpenBulkUploadModal(true),
    },
  ];
  const handleSelectChange = (event, choiceAdd) => {
    setChoiceAdd(choiceAdd);

    const selectedOption = menuOptionsAdd.find(
      (option) => option.value === choiceAdd
    );
    if (selectedOption && selectedOption.handleClick) {
      selectedOption.handleClick();
    }
  };
  // console.log(choiceLevel, choiceArm, choiceDownload);

  return (
    <>
      <div className="flex items-center gap-x-[2em] w-full mt-[2em]">
        <FilterComponent
          menuOptions={menuOptionsLevel}
          choice={choiceLevel}
          setChoice={setChoiceLevel}
          textColor="text-dropdownColor"
        />
        <FilterComponent
          menuOptions={menuOptionsArm}
          choice={choiceArm}
          setChoice={setChoiceArm}
          textColor="text-dropdownColor"
        />
      </div>
      <button
        className="bg-red-500 hover:bg-red-600 mt-4 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => setNum(num === 6 ? 0 : 6)}
      >
        {num === 6
          ? "click to remove students for testing"
          : "click to see student list for testing"}
      </button>
      <div className="flex md:items-center justify-between gap-4 mb-[2em] mt-[2em] md:overflow-x-visible overflow-x-auto">
        <DashboardCard2
          bgColor="bg-bg-4"
          label="Total Students"
          val1={tableData.length}
          val2={tableData.filter((student) => student.gender === "M").length}
          val3={tableData.filter((student) => student.gender === "F").length}
        />
        <DashboardCard2
          bgColor="bg-bg-5"
          label="Linked Students"
          val1="0"
          val2="0"
          val3="0"
        />
        <DashboardCard2
          bgColor="bg-bg-6"
          label="Non-Linked Students"
          val1="0"
          val2="0"
          val3="0"
        />
      </div>
      <div className="flex md:flex-row flex-col items-center justify-between mb-[2em] gap-4 flex-wrap">
        <div className="flex justify-center flex-row items-center gap-[1em]">
          <CustomInput
            placeholder="Search by Student, Parent"
            otherclass="rounded-[5px]  bg-transparent"
            containerclass="md:w-[260px]"
          />
          <FilterComponent
            menuOptions={menuOptionsStatus}
            choice={choiceStatus}
            setChoice={setChoiceStatus}
            // otherClasses={" md:w-[170px]"}
            textColor="text-dropdownColor"
          />
          {/* <CustomSelect
            selectOption={menuOptionsStatus}
            value={choiceStatus}
            onChange={(e) => setChoiceStatus(e.target.value)}
            containerclass="bg-transparent rounded-[5px] "
            otherclass="md:w-[170px] "
            placeholder="Filter"
          /> */}

          {tableData.length > 0 && (
            <>
              {" "}
              <div
                onClick={() => setOpenOptionModal(true)}
                className="w-[5rem] md:hidden h-[2.5rem] flex items-center justify-center cursor-pointer"
              >
                <img src={ThreeDots} alt="options" className="w-full h-full" />
              </div>
              <Modal
                openModal={openOptionModal}
                closeModal={() => setOpenOptionModal(false)}
                maxWidth="90%"
                height="500px"
              >
                <div className="flex flex-col place-content-center h-[100vh] w-full gap-4">
                  <CustomSelect
                    selectOption={menuOptionsDownload}
                    placeholder="Download"
                    value={choiceDownload}
                    onChange={(e) => setChoiceDownload(e.target.value)}
                    containerclass="bg-transparent border-tertiary text-tertiary"
                    arrowColor="#0E7094"
                    otherclass="md:w-[170px]"
                    centerContent={true}
                  />
                  <CustomSelect
                    placeholder="Add student"
                    value={choiceAdd}
                    selectOption={menuOptionsAdd}
                    onChange={handleSelectChange}
                    containerclass=" bg-transparent border-tertiary text-tertiary"
                    centerContent={true}
                    otherclass="md:w-[170px]"
                    arrowColor="#0E7094"
                  />
                </div>
              </Modal>
            </>
          )}
        </div>
        {tableData.length > 0 && (
          <div className="hidden md:flex items-center gap-x-3 md:flex-row flex-col">
            <CustomSelect
              selectOption={menuOptionsDownload}
              placeholder="Download"
              value={choiceDownload}
              onChange={(e) => setChoiceDownload(e.target.value)}
              containerclass="bg-transparent border-tertiary text-tertiary"
              arrowColor="#0E7094"
              otherclass="md:w-[173px]"
            />
            <CustomSelect
              placeholder="Add student"
              value={choiceAdd}
              selectOption={menuOptionsAdd}
              onChange={handleSelectChange}
              arrowColor="white"
              containerclass=" bg-tertiary text-white"
              otherclass="md:w-[173px]"
            />
          </div>
        )}
      </div>
      <div>
        <ModifiedTableComponent
          headcells={headcells}
          handleClick2={() => setOpenAddStudentModal(true)}
          tableData={tableData}
          btn2Name="Add student"
          message="You have no student list"
        />
      </div>
      {/* Modals */}
      <DeleteStudentModal
        openModal={openDeleteStudentModal}
        closeModal={() => setOpenDeleteStudentModal(false)}
      />

      <LinkGuardianModal
        openModal={openLinkGuardianModal}
        closeModal={() => setOpenLinkGuardianModal(false)}
      />

      <AddStudentParentChoiceModal
        textOption={"Individual upload "}
        type="student"
        openModal={openAddStudentModal}
        closeModal={() => setOpenAddStudentModal(false)}
        handleOpenManualUploadModal={() => navigate("?action=add-student")}
        handleOpenBulkUploadModal={() => setOpenBulkUploadModal(true)}
      />

      <BulkUploadModal
        openModal={openBulkUploadModal}
        closeModal={() => setOpenBulkUploadModal(false)}
      />
    </>
  );
};
