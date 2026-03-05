import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import DashboardLayout from "../../../../../Templates/DashboardLayout";
import DeleteStudentModal, {
  DeactivateStudentModal,
} from "../Modals/DeleteDeactivateStudentModal";
import ManualUploadModal from "../Modals/ManualUploadModal";
import PersonalBiodata from "./tabs/PersonalBiodata";
import GuardianBiodata from "./tabs/GuardianBiodata";
import Fees from "./tabs/Fees";

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteStudentModal, setOpenDeleteStudentModal] = useState(false);
  const [openDeactivateStudentModal, setOpenDeactivateStudentModal] =
    useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
  const [presentStep, setPresentStep] = useState(1);

  const stepComponents = {
    1: <PersonalBiodata />,
    2: <GuardianBiodata />,
    3: <Fees />,
  };

  return (
    // <DashboardLayout>
    <>
      <div className="flex flex-col">
        <span className="mb-10">
          <Link
            to="/school-management/admission"
            className="flex text-base items-center text-tertiary gap-x-2.5"
          >
            <KeyboardBackspaceIcon />
            Back to Student
          </Link>
        </span>
        <div className="mb-12 flex flex-col md:flex-row justify-between flex-wrap gap-y-5 md:gap-y-0 items-end">
          <div className="flex items-center gap-x-8 flex-1">
            <Avatar
              src=""
              alt=""
              sx={{
                height: "188px",
                width: "188px",
                borderRadius: "10px",
              }}
            />
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
          <div className="flex flex-1 items-center flex-wrap gap-2.5">
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditing(true);
                setOpenManualUploadModal(true);
              }}
              color="tertiary"
              sx={{
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "196px",
                width: "100%",
              }}
            >
              Edit profile
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDeactivateStudentModal(true)}
              sx={{
                background: "#1F2122",
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "196px",
                width: "100%",
              }}
            >
              Deactivate student
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDeleteStudentModal(true)}
              color="tertiary"
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "196px",
                width: "100%",
              }}
            >
              Delete student
            </Button>
          </div>
        </div>
        <div>
          <div className="mb-[22px] w-full max-w-[825px]">
            <div className="flex items-center justify-between">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setPresentStep(step.id)}
                  className={`text-center text-lg ${
                    step.id === presentStep ? "custom-rule relative" : ""
                  } py-[15px] px-[62px]`}
                >
                  {step.name}
                </button>
              ))}
            </div>
            <hr className="border border-[#CCE9F4]" />
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
      <ManualUploadModal
        isEditing={isEditing}
        openModal={openManualUploadModal}
        closeModal={() => setOpenManualUploadModal(false)}
      />
      {/* // </DashboardLayout> */}
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
    name: "Fees",
  },
];
