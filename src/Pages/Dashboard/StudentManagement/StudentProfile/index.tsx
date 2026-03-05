import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import DeleteStudentModal, {
  DeactivateStudentModal,
} from "../../SchoolManagement/Admissions/Modals/DeleteDeactivateStudentModal";
// import DeleteStudentModal from "../../SchoolManagement/Admissions/Modals/DeleteDeactivateStudentModal";
import ManualUploadModal from "../../SchoolManagement/Admissions/Modals/ManualUploadModal";
import EditStudentProfile from "../../SchoolManagement/Admissions/Modals/EditStudentProfile";
import { PersonalBio } from "./PersonalBio/personalBio";
import { ParentBio } from "./ParentBio/parentBio";
import Attendance from "./Attendance/attendance";
import { Edit_icon } from "../../../../assets/icons/edit_icon";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteStudentModal, setOpenDeleteStudentModal] = useState(false);
  const [openDeactivateStudentModal, setOpenDeactivateStudentModal] =
    useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
  const [presentStep, setPresentStep] = useState(1);
  const navigate = useNavigate();
  const stepComponents = {
    1: <PersonalBio />,
    2: <ParentBio />,
    3: <Attendance />,
  };
  const location = useLocation();
  const currentPath = location.pathname;
  console.log(currentPath, location.search);
  const previousPath = location.state?.from;
  //set the from in the previous path like this navigate("student-profile", { state: { from: "/student-management" },}),

  return (
    //   <DashboardLayout>
    <>
      <div className="flex flex-col">
        <span className="mb-10">
          <Link
            to={previousPath}
            className="flex text-base items-center text-tertiary gap-x-2.5"
          >
            <KeyboardBackspaceIcon />
            Back to Student
          </Link>
        </span>
        <div className="mb-12 flex flex-col md:flex-row justify-between flex-wrap gap-y-5 md:gap-y-0 md:items-end">
          <div className="flex md:flex-row flex-col md:items-center gap-8 flex-1">
            <div className="flex items-end gap-x-2">
              <Avatar
                src=""
                alt=""
                sx={{
                  height: "178px",
                  width: "188px",
                  borderRadius: "10px",
                }}
              />
              <div
                className="md:hidden block"
                onClick={() => {
                  navigate(`?action=edit-student`, {
                    state: { from: `${currentPath}${location.search}` },
                  });
                }}
              >
                <Edit_icon />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold mb-2.5">
                Pricilla Jane Gator
              </p>
              <div className="flex items-center gap-x-2.5 mb-5">
                <Chip label="SCH001" />
                <Chip label="SSS 1B" />
              </div>
              <p className="mb-2.5">Parent/Guardian</p>
              <p className="mb-2.5">Mr Ade Gator</p>
              <p className="">Father</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-9 md:flex-wrap md:gap-2.5">
            <div className="hidden md:block">
              <Button
                variant="outlined"
                onClick={() => {
                  navigate(`?action=edit-student`, {
                    state: { from: `${currentPath}${location.search}` },
                  });
                }}
                color="tertiary"
                sx={{
                  borderRadius: "10px",
                  paddingY: "10px",
                  maxWidth: "196px",
                  width: "100%",
                }}
              >
                Edit Profile
              </Button>
            </div>
            <Button
              variant="contained"
              onClick={() => setOpenDeactivateStudentModal(true)}
              sx={{
                background: "#1F2122",
                color: "white",
                borderRadius: "10px",
                paddingY: "10px",
                maxWidth: "196px",
                width: "100%",
              }}
            >
              Deactivate Student
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDeleteStudentModal(true)}
              color="tertiary"
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "10px",
                maxWidth: "196px",
                width: "100%",
              }}
            >
              Delete Student
            </Button>
          </div>
        </div>
        <div>
          <div className="mb-[22px] w-full max-w-[825px] overflow-x-auto">
            <div className="flex md:justify-center min-w-full border-b border-bg-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setPresentStep(step.id)}
                  className={`w-full text-center items-center flex flex-col gap-y-1 relative text-sm sm:text-base ${
                    step.id === presentStep
                      ? "text-tertiary"
                      : "text-buttonInactive"
                  } py-2 px-5 sm:px-4 md:px-8`}
                >
                  <p className="text-base w-full sm:text-sm whitespace-nowrap">
                    {step.name}
                  </p>
                  {step.id === presentStep && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          {stepComponents[presentStep]}
        </div>
      </div>
      {/* Modals */}
      <DeleteStudentModal
        openModal={openDeleteStudentModal}
        closeModal={() => setOpenDeleteStudentModal(false)}
      />
      <DeactivateStudentModal
        openModal={openDeactivateStudentModal}
        closeModal={() => setOpenDeactivateStudentModal(false)}
      />
      <EditStudentProfile
        openModal={isEditing}
        closeModal={() => setIsEditing(false)}
      />
      {/* </DashboardLayout> */}
    </>
  );
}

const steps = [
  {
    id: 1,
    name: "Personal Bio Data",
  },
  {
    id: 2,
    name: "Parent/Guardian Bio Data",
  },
  {
    id: 3,
    name: "Attendance ",
  },
];
