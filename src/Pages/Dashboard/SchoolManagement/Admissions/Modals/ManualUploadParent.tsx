/* eslint-disable react/prop-types */
import { useState } from "react";
import Button from "@mui/material/Button";

import Modal from "../../../../../Components/Modals";
import StudentData from "./ParentTabs/StudentData";
import GuardianData from "./ParentTabs/GuardianData";
import Review from "./ParentTabs/Review";
// import { useStudentContext } from "../../../../../context/StudentProvider";

export default function ManualUploadParent({ openModal, closeModal }) {
  const [presentStep, setPresentStep] = useState(1);
  const [allData, setAllData] = useState({});

  const stepComponents = {
    1: <GuardianData />,
    2: <StudentData />,
    3: <Review data={allData} />,
  };

  function handleNext() {
    if (presentStep < steps.length) setPresentStep((prev) => prev + 1);
  }

  function handlePrev() {
    if (presentStep > 1) setPresentStep((prev) => prev - 1);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setAllData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log(allData);
  }

  return (
    <Modal openModal={openModal} closeModal={closeModal} maxWidth="1187px">
      <div className="mb-14 flex justify-center">
        <div className="flex items-center">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setPresentStep(step.id)}
              className={`text-center text-tertiary items-center flex flex-col gap-y-2.5 text-lg ${
                step.id === presentStep ? "custom-rule2 relative" : ""
              } py-2.5 px-16`}
            >
              <p>Step {step.id}</p>
              <p>{step.name}</p>
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        {stepComponents[presentStep]}
        <div className="mt-10">
          <div className="flex items-center gap-x-6">
            {presentStep > 1 && (
              <Button
                color="tertiary"
                variant="outlined"
                onClick={handlePrev}
                sx={{
                  color: "tertiary",
                  borderRadius: "10px",
                  paddingY: "12px",
                  maxWidth: "177px",
                  width: "100%",
                }}
              >
                Previous
              </Button>
            )}
            {presentStep < steps.length && (
              <Button
                color="tertiary"
                variant="contained"
                onClick={handleNext}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  paddingY: "12px",
                  maxWidth: "177px",
                  width: "100%",
                }}
              >
                Next
              </Button>
            )}
            {presentStep === steps.length && (
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
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

const steps = [
  {
    id: 1,
    name: "Parent/guardian Data",
  },
  {
    id: 2,
    name: "Link student",
  },
  {
    id: 3,
    name: "Review and Complete",
  },
];
