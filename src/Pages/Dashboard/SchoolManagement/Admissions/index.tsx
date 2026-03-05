import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../../../Templates/DashboardLayout";
import Student from "./tabs/Student";
import Parent from "./tabs/Parent";
// import StudentProfile from "./Profiles/StudentProfile";
import StudentProfile from "../../StudentManagement/StudentProfile";
import GuardianProfile from "./Profiles/GuardianProfile";
import EditStudentForm from "../../../Forms/EditStudentForm";
import AddStudentForm from "../../../Forms/AddStudentForm";

export default function Admissions() {
  const [presentStep, setPresentStep] = useState(1);
  const stepComponents = {
    1: <Student />,
    2: <Parent />,
  };

  const [searchParams] = useSearchParams();
  const isProfile = searchParams.get("profile");
  const action = searchParams.get("action");
  //   const studentId = searchParams.get("id");
  //   f (action === "add") {
  //   return <AddStudentForm />;
  // } else if (action === "edit") {
  //   if (studentId) {
  //     const studentExists = checkIfStudentExists(studentId);
  //     if (studentExists) {
  //       return <EditStudentForm studentId={studentId} />;
  //     } else {
  //       return <div>Error: Student with ID {studentId} not found.</div>;
  //     }
  //   } else {
  //     return <div>Error: No student ID provided for editing.</div>;
  //   }
  // }
  if (action === "add") return <AddStudentForm />;
  else if (action === "edit") return <EditStudentForm />;
  console.log(isProfile);
  if (isProfile === "student") return <StudentProfile />;
  else if (isProfile === "parent") return <GuardianProfile />;
  return (
    <div>
      <div className="mb-[22px]">
        <div className="flex items-center w-full">
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
  );
}

const steps = [
  {
    id: 1,
    name: "Student",
  },
  {
    id: 2,
    name: "Parent",
  },
];
