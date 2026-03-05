import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import ProfileDisplay from "../../../../../Components/ProfileDisplay";
import RemoveParentModal from "../Modals/RemoveParentModal";
import ParentBiodata from "./tabs/ParentBiodata";

export default function GuardianProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteParentModal, setOpenDeleteParentModal] = useState(false);
  const [openManualUploadModal, setOpenManualUploadModal] = useState(false);
  const [presentStep, setPresentStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const previousPath = location.state?.from;
  const stepComponents = {
    1: <ParentBiodata />,
  };

  return (
    <>
      <div className="flex flex-col">
        <span className="mb-10">
          <Link
            to={previousPath}
            className="flex text-base items-center text-tertiary gap-x-2.5"
          >
            <KeyboardBackspaceIcon />
            Back to Parent
          </Link>
        </span>
        <div className="mb-12 flex flex-col md:flex-row justify-between flex-wrap gap-y-5 md:gap-y-0 md:items-end">
          <div className="flex flex-col gap-y-5 flex-1">
            <p className="text-xl font-semibold">Pricilla Jane Gator</p>
            <p>Linked students</p>
            <div className="flex items-center gap-x-14">
              <ProfileDisplay name="Ade Gator" role="Father" />
              <ProfileDisplay name="Sola Gator" role="Father" />
            </div>
          </div>
          <div className="flex items-center md:flex-wrap flex-1 gap-9 md:gap-2.5 md:justify-end">
            <Button
              variant="outlined"
              onClick={() => {
                navigate("?action=edit-parent", {
                  state: { from: `${currentPath}${location.search}` },
                });
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
              onClick={() => setOpenDeleteParentModal(true)}
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
      <RemoveParentModal
        openModal={openDeleteParentModal}
        closeModal={() => setOpenDeleteParentModal(false)}
      />
    </>
  );
}

const steps = [
  {
    id: 1,
    name: "Personal Bio Data",
  },
];
