import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import StudentData from "../Dashboard/SchoolManagement/Admissions/Modals/tabs/StudentData";
import GuardianData from "../Dashboard/SchoolManagement/Admissions/Modals/tabs/GuardianData";
import Review from "../Dashboard/SchoolManagement/Admissions/Modals/tabs/Review";
// import { sampleData } from "./EditStudentForm";
import { useStudentContext } from "../../context/StudentProvider";
export default function AddStudentForm({}) {
  const [presentStep, setPresentStep] = useState(1);
  // const [allData, setAllData] = useState({});
  const scrollRef = useRef(null);
  const location = useLocation();
  const { studentData, guardianData } = useStudentContext();

  const handleNext = () => {
    if (presentStep < steps.length) {
      setPresentStep((prev) => prev + 1);
      // Scroll to top whenever next or prev is clicked
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (presentStep > 1) {
      setPresentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  const steps = [
    {
      id: 1,
      name: "Student Data",
      component: <StudentData />,
    },
    {
      id: 2,
      name: "Parent/Guardian data",
      component: <GuardianData />,
    },
    {
      id: 3,
      name: "Review and Complete",
      component: <Review />,
    },
  ];
  // const { id } = useParams();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allData = { ...studentData, ...guardianData };
    console.log(allData);
    // Add your API call here
  };
  //set the from in the previous path like this navigate("student-profile", { state: { from: "/student-management" },}),
  const previousPath = location.state?.from;

  return (
    <>
      <span className="mb-10" ref={scrollRef}>
        <Link
          to={previousPath}
          className="flex text-base items-center text-tertiary gap-x-2.5"
        >
          <KeyboardBackspaceIcon />
          Back to Student
        </Link>
      </span>
      <div className="lg:mx-auto lg:flex flex-col place-items-center max-w-6xl w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-14  overflow-x-auto w-full">
          <div className="flex justify-center min-w-full border-b border-bg-2">
            {steps.map((step) => (
              <button
                type="button"
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

          <div className="mt-10 w-full ">
            <div className="flex items-center gap-x-6 w-[100%]">
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
              <div className="flex w-[100%] md:justify-end mt-4 md:mt-0">
                {presentStep === 2 && (
                  <Button
                    color="tertiary"
                    variant="outlined"
                    onClick={handleNext}
                    sx={{
                      color: "tertiary",
                      borderRadius: "10px",
                      paddingY: "12px",
                      maxWidth: "177px",
                      width: "100%",
                    }}
                  >
                    Skip
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
