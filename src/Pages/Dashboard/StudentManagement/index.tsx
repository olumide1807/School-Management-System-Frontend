import { useState } from "react";
import { Student } from "./Student";
import { Parent } from "./Parent";
import { useSearchParams } from "react-router-dom";
import { StudentResult } from "./StudentResult";
import GuardianProfile from "../SchoolManagement/Admissions/Profiles/GuardianProfile";
import StudentProfile from "./StudentProfile";
import AddStudentForm from "../../Forms/AddStudentForm";
import EditStudentForm from "../../Forms/EditStudentForm";
import AddParentForm from "../../Forms/AddParentForm";
import EditParentForm from "../../Forms/EditParentForm.tsx";
const StudentManagment = () => {
  const [studentTab, setStudent] = useState(true);
  const [studentResultTab, setStudentResult] = useState(false);
  const [parentTab, setParent] = useState(false);

  function handleStudent() {
    setStudent(true);
    setStudentResult(false);
    setParent(false);
  }
  function handleStudentResult() {
    setStudent(false);
    setStudentResult(true);
    setParent(false);
  }
  function handleParent() {
    setStudent(false);
    setStudentResult(false);
    setParent(true);
  }
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
  if (action === "add-student") return <AddStudentForm />;
  else if (action === "edit-student") return <EditStudentForm />;
  if (isProfile === "parent") return <GuardianProfile />;
  else if (isProfile === "student") return <StudentProfile />;
  if (action === "add-parent") return <AddParentForm />;
  else if (action === "edit-parent") return <EditParentForm />;

  return (
    <>
      <div className=" ">
        <section className="md:w-[25%] min-w-[50%] md:p-1 text-lg flex sm:m-0 m-auto md:overflow-x-visible overflow-x-auto">
          <menu
            className={`border-b-2 text-center cursor-pointer text-base md:w-[30%]  min-w-[50%] ${
              studentTab ? "border-tertiary" : "border-bg-2"
            } flex-1`}
            onClick={handleStudent}
          >
            Student
          </menu>
          <menu
            className={`border-b-2 text-center cursor-pointer text-base px-3 min-w-[50%] ${
              studentResultTab ? "border-tertiary" : "border-bg-2"
            } flex-1`}
            onClick={handleStudentResult}
          >
            Student Result
          </menu>
          <menu
            className={`border-b-2 text-center cursor-pointer text-base min-w-[50%] ${
              parentTab ? "border-tertiary" : "border-bg-2"
            } flex-1`}
            onClick={handleParent}
          >
            Parent
          </menu>
        </section>
        {studentTab ? (
          <Student />
        ) : studentResultTab ? (
          <StudentResult />
        ) : (
          <Parent />
        )}
      </div>
    </>
  );
};

export default StudentManagment;
