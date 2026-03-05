/* eslint-disable react/prop-types */
import { useState } from "react";
import Button from "@mui/material/Button";
import { Link, useLocation } from "react-router-dom";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import StudentData from "../Dashboard/SchoolManagement/Admissions/Modals/ParentTabs/StudentData";
import GuardianData from "../Dashboard/SchoolManagement/Admissions/Modals/ParentTabs/GuardianData";
import Review from "../Dashboard/SchoolManagement/Admissions/Modals/ParentTabs/Review";
import { useStudentContext } from "../../context/StudentProvider";

export default function AddParentForm() {
  const { parentData } = useStudentContext();
  const [presentStep, setPresentStep] = useState(1);
  const location = useLocation();
  const previousPath = location.state?.from;
  const steps = [
    {
      id: 1,
      name: "Parent/Guardian Data",
      component: <GuardianData />,
    },
    {
      id: 2,
      name: "Link Student",
      component: <StudentData />,
    },
    {
      id: 3,
      name: "Review and Complete",
      component: <Review />,
    },
  ];
  // const stepComponents = {
  //   1: <GuardianData />,
  //   2: <StudentData />,
  //   3: <Review />,
  // };

  function handleNext() {
    if (presentStep < steps.length) setPresentStep((prev) => prev + 1);
  }

  function handlePrev() {
    if (presentStep > 1) setPresentStep((prev) => prev - 1);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const allData = { ...parentData };
    console.log(allData);
  }

  return (
    // <Modal openModal={openModal} closeModal={closeModal} maxWidth="1187px">
    <>
      <span className="mb-10">
        <Link
          to={previousPath}
          className="flex text-base items-center text-tertiary gap-x-2.5"
        >
          <KeyboardBackspaceIcon />
          Back to Parent
        </Link>
      </span>
      <div className="lg:mx-auto lg:flex flex-col place-items-center max-w-6xl w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-14  overflow-x-auto w-full">
          <div className="flex justify-center min-w-full border-b border-bg-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setPresentStep(step.id)}
                className={`text-center items-center flex flex-col gap-y-1 relative text-sm sm:text-base ${
                  step.id === presentStep
                    ? "text-tertiary"
                    : "text-buttonInactive"
                } py-2 px-2 sm:px-4 md:px-8`}
              >
                <p className="text-sm sm:text-base">Step {step.id}</p>
                <p className="text-xs sm:text-sm whitespace-nowrap">
                  {step.name}
                </p>
                {step.id === presentStep && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          {steps.find((step) => step.id === presentStep)?.component}
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
      </div>
    </>
  );
}
