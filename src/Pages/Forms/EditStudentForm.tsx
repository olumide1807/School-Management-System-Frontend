/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import Button from "@mui/material/Button";
import { Link, useLocation } from "react-router-dom";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
// import { useDropzone } from "react-dropzone";
import { useStudentContext } from "../../context/StudentProvider";
import EditStudentData from "../Dashboard/SchoolManagement/Admissions/Modals/EditStudentTabs/EditStudentData";
import ReviewEditedStudent from "../Dashboard/SchoolManagement/Admissions/Modals/EditStudentTabs/ReviewEditedStudent";

export const sampleData = {
  profile_image: "https://picsum.photos/200/300",
  surname: "Smith",
  first_name: "John",
  other_name: "Doe",
  gender: "Male",
  student_no: "SCH0001",
  level: "Class 1",
  email: "john.smith@example.com",
  phone: "+1234567890",
  religion: "Christian",
  dob: "2005-08-15",
  country: "Nigeria",
  state: "Lagos",
  lga: "Agege",
  home_address: "123 Main Street, Lagos",
  guardian: "Mr John Doe",
  relationship: "Father",
  title: "Mr",
  parent_surname: "Doe",
  parent_first_name: "John",
  parent_other_name: "Middle",
  parent_gender: "Male",
  marital_status: "Married",
  parent_email: "john.doe@example.com",
  parentPhone: "+1234567890",
  occupation: "Engineer",
  parent_home_address: "123 Main Street, Anytown, USA",
};

export default function EditStudentForm() {
  const { setGuardianData } = useStudentContext();
  const [presentStep, setPresentStep] = useState(1);
  // const [allData, setAllData] = useState({});
  const scrollRef = useRef<HTMLSpanElement>(null);
  // const [preview, setPreview] = useState("");
  const [isManual, setIsManual] = useState(false);

  const handleAddManually = () => {
    setIsManual((prevIsManual) => !prevIsManual);
    if (true) {
      setGuardianData((prevData) => ({
        ...prevData,
        title: "",
        parent_surname: "",
        parent_first_name: "",
        parent_other_name: "",
        parent_gender: "",
        marital_status: "",
        parent_email: "",
        parent_phone: "",
        occupation: "",
        relationship: "",
        parent_home_address: "",
      }));
    } else {
      setGuardianData((prevData) => ({
        ...prevData,
        guardian_link: [],
      }));
    }
  };

  function handleNext() {
    if (presentStep < steps.length) setPresentStep((prev) => prev + 1);
    scrollRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  }
  function handlePrev() {
    if (presentStep > 1) setPresentStep((prev) => prev - 1);
    scrollRef.current?.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  }
  const location = useLocation();
  // const { id } = useParams();
  //set the from in the previous path like this navigate("student-profile", { state: { from: "/student-management" },}),
  const previousPath = location.state?.from;

  const steps = [
    {
      id: 1,
      name: "Edit Data",
      component: <EditStudentData isManual={isManual} />,
    },
    {
      id: 2,
      name: "Review and Complete",
      component: <ReviewEditedStudent isManual={isManual} />,
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const allData = { ...studentData, ...guardianData };
    // console.log(allData);
    // Add your API call here to save the changes
  };

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
                key={step.id}
                onClick={() => setPresentStep(step.id)}
                className={`text-center items-center flex flex-col gap-y-1 relative text-sm sm:text-base ${
                  step.id === presentStep
                    ? "relative text-tertiary"
                    : "text-buttonInactive"
                } py-2 px-4 sm:py-2.5 sm:px-8 lg:px-16`}
              >
                <p className="text-xs sm:text-sm">Step {step.id}</p>
                <p className="text-xs sm:text-sm whitespace-nowrap ">
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
          <div className="mt-10 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-y-4 sm:gap-x-6">
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
                    sm: { maxWidth: "177px" },
                  }}
                >
                  Previous
                </Button>
              )}
              {presentStep < steps.length && (
                <div className="flex flex-col sm:flex-row items-center w-full  sm:gap-x-4 md:gap-x-8">
                  <Button
                    color="tertiary"
                    variant="outlined"
                    onClick={handleAddManually}
                    sx={{
                      color: "tertiary",
                      borderRadius: "10px",
                      paddingY: "12px",
                      paddingX: "32px",
                      maxWidth: "max-content",
                      width: "100%",
                      sm: { maxWidth: "max-content" },
                    }}
                  >
                    {isManual ? "Select Parent/Guardian" : "Add Manually"}
                  </Button>
                  <Button
                    color="tertiary"
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      color: "white",
                      backgroundColor: "tertiary",
                      borderRadius: "10px",
                      paddingY: "12px",
                      maxWidth: "177px",
                      width: "100%",
                      sm: { maxWidth: "177px" },
                    }}
                  >
                    Next
                  </Button>
                </div>
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
                    sm: { maxWidth: "177px" },
                  }}
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
