import React, { useState } from "react";
import DashboardCard from "../../../../Components/DashboardCard";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "../../../../Components/Forms";
import { Button } from "@mui/material";
import FilterComponent from "../../../../Components/FilterComponent";
import ModifiedTableComponent from "../../../../Components/Tables/ModifiedTable";
import RemoveParentModal from "../../SchoolManagement/Admissions/Modals/RemoveParentModal";
import LinkGuardianModal from "../../SchoolManagement/Admissions/Modals/LinkGuardianModal";
import EditParentProfile from "../../SchoolManagement/Admissions/Modals/EditParentProfile";
import BulkUploadParent from "../../SchoolManagement/Admissions/Modals/BulkUploadParent";
import AddStudentParentChoiceModal from "../../SchoolManagement/Admissions/Modals/AddStudentParentChoiceModal";
import ManualUploadParent from "../../SchoolManagement/Admissions/Modals/ManualUploadParent";
import CustomInput from "../../../Forms/CustomInput";
import CustomSelect from "../../../Forms/CustomSelect";
export const Parent = () => {
  const [num, setNum] = useState(6);
  const [openDeleteParentModal, setOpenDeleteParentModal] = useState(false);
  const [openLinkGuardianModal, setOpenLinkGuardianModal] = useState(false);
  const [openEditParentProfile, setOpenEditParentProfile] = useState(false);
  const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
  const [openAddParentModal, setOpenAddParentModal] = useState(false);
  const [choiceAdd, setChoiceAdd] = useState("Add parent");
  const [searchInput, setSearchInput] = useState("");
  // console.log(searchInput);
  const navigate = useNavigate();
  const tableData = Array(num)
    .fill("")
    .map((_, i) => ({
      parent: "John Doe",
      email: "john@gmail.com",
      phoneNo: "08165880245",
      wards: (
        <div className="flex flex-col gap-y-1">
          <p>Peter Adejare</p>
          <p>+ 2 more</p>
        </div>
      ),
      actions: [
        {
          name: "View profile",
          handleClick: () =>
            navigate("?profile=parent", {
              state: { from: "/student-management" },
            }),
        },
        {
          name: "Edit profile",
          handleClick: () =>
            navigate("?action=edit-parent", {
              state: { from: "/student-management" },
            }),
          // handleClick: () => setOpenEditParentProfile(true),
        },
        {
          name: "Link student",
          handleClick: () => setOpenLinkGuardianModal(true),
        },
        {
          name: <p style={{ color: "#FE3030" }}>Delete parent</p>,
          handleClick: () => setOpenDeleteParentModal(true),
        },
      ],
      id: `row_${i}`,
    }));
  const headcells = [
    {
      key: "parent",
      name: "Parent/Guardian",
    },
    {
      key: "email",
      name: "Email Address",
    },
    {
      key: "phoneNo",
      name: "Phone number",
    },
    {
      key: "wards",
      name: "Ward(s)",
    },
    {
      key: "actions",
      name: "",
    },
  ];
  const menuOptionsAdd = [
    {
      label: "Bulk upload parent",
      value: "Bulk upload parent",
      handleClick: () => setOpenBulkUploadModal(true),
    },
    {
      label: "Manual upload parent",
      value: "Manual upload parent",
      handleClick: () => navigate("?action=add-parent"),
      // handleClick: () => setOpenManualUploadModal(true),
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
  return (
    <>
      <div className="flex md:items-center justify-between gap-4 mb-[2em] mt-[2em] md:overflow-x-visible overflow-x-auto">
        <DashboardCard
          bgColor="bg-bg-4"
          label="Total Parents"
          val1="0"
          val2="0"
          val3="0"
        />
        <DashboardCard
          bgColor="bg-bg-5"
          label="Parents Linked"
          val1="0"
          val2="0"
          val3="0"
        />
        <DashboardCard
          bgColor="bg-bg-6"
          label="Parents not linked"
          val1="0"
          val2="0"
          val3="0"
        />
      </div>
      <button
        className="bg-red-500 hover:bg-red-600 text-white w-[500px] font-bold py-2 px-4 rounded m-2"
        onClick={() => setNum(num === 6 ? 0 : 6)}
      >
        {num === 6
          ? "click to remove parents for testing"
          : "click to see parents list for testing"}
      </button>
      <div className=" mb-[2em]">
        <div className="flex items-center justify-between gap-4">
          <CustomInput
            placeholder="Search Parent"
            otherclass="rounded-[5px]  bg-transparent"
            containerclass="md:w-[221px] w-[50%]"
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {tableData.length > 0 && (
            <CustomSelect
              placeholder="Add parent"
              value={choiceAdd}
              selectOption={menuOptionsAdd}
              onChange={handleSelectChange}
              arrowColor="white"
              centerContent={false}
              containerclass="bg-tertiary text-white"
              otherclass="md:w-[196px] w-[100%]"
            />
          )}
        </div>
      </div>
      <div>
        <ModifiedTableComponent
          headcells={headcells}
          tableData={tableData}
          handleClick2={() => setOpenAddParentModal(true)}
          btn2Name="Add parent"
          message="You have no parent list"
        />
      </div>
      <RemoveParentModal
        openModal={openDeleteParentModal}
        closeModal={() => setOpenDeleteParentModal(false)}
      />
      <LinkGuardianModal
        openModal={openLinkGuardianModal}
        closeModal={() => setOpenLinkGuardianModal(false)}
      />
      <EditParentProfile
        openModal={openEditParentProfile}
        closeModal={() => setOpenEditParentProfile(false)}
      />
      <AddStudentParentChoiceModal
        textOption="Individual upload "
        type="parent"
        openModal={openAddParentModal}
        closeModal={() => setOpenAddParentModal(false)}
        handleOpenBulkUploadModal={() => setOpenBulkUploadModal(true)}
        handleOpenManualUploadModal={() => navigate("?action=add-parent")}
      />
      <BulkUploadParent
        openModal={openBulkUploadModal}
        closeModal={() => setOpenBulkUploadModal(false)}
      />
      <ManualUploadParent
        openModal={openManualUploadModal}
        closeModal={() => setOpenManualUploadModal(false)}
      />
    </>
  );
};
