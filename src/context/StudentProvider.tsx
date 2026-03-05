import React, { createContext, useState, useContext } from "react";
import {
  GuardianData,
  Option,
  ParentData,
  StudentContextType,
  StudentData,
  StudentProviderProps,
} from "../types/StudentProviderType";

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<StudentProviderProps> = ({
  children,
}) => {
  const [studentData, setStudentData] = useState<StudentData>({
    profile_image: "",
    img_blob: "",
    surname: "",
    first_name: "",
    other_name: "",
    gender: "",
    student_no: "",
    level: "",
    arm: "",
    email: "",
    phone: "",
    religion: "",
    dob: "",
    country: "",
    state: "",
    lga: "",
    home_address: "",
  });

  const [guardianData, setGuardianData] = useState<GuardianData>({
    guardian: "",
    relationship: "",
    title: "",
    parent_surname: "",
    parent_first_name: "",
    parent_other_name: "",
    parent_gender: "",
    marital_status: "",
    parent_email: "",
    parent_phone: "",
    alt_phone: "",
    occupation: "",
    parent_home_address: "",
    guardian_link: [
      {
        guardian_id: "",
        guardian_name: "",
        relationship: "",
      },
    ],
  });

  const [parentData, setParentData] = useState<ParentData>({
    guardian: "",
    relationship: "",
    title: "",
    parent_surname: "",
    parent_first_name: "",
    parent_other_name: "",
    parent_gender: "",
    marital_status: "",
    parent_email: "",
    parent_phone: "",
    alt_phone: "",
    occupation: "",
    parent_home_address: "",
    student_link: [
      {
        student_id: "",
        student_name: "",
        relationship: "",
      },
    ],
  });
  const handleGuardianLinkChange = (
    index: number,
    input: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = input.target;
    setGuardianData((prevData) => {
      const updatedGuardianLink = prevData.guardian_link
        ? prevData.guardian_link.map((guardian, idx) =>
            idx === index ? { ...guardian, [name]: value } : guardian
          )
        : [];
      return {
        ...prevData,
        guardian_link: updatedGuardianLink,
      };
    });
  };
  const handleStudentLinkChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedStudentLink = parentData.student_link.map((student, idx) =>
      idx === index ? { ...student, [name]: value } : student
    );
    setParentData((prevData) => ({
      ...prevData,
      student_link: updatedStudentLink,
    }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuardianData((prev) => ({ ...prev, [name]: value }));
  };
  const genderOptions: Option[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Others", label: "Others" },
  ];
  const classOptions: Option[] = [
    { value: "class1", label: "Class 1" },
    { value: "class2", label: "Class 2" },
    { value: "class3", label: "Class 3" },
  ];
  const classArms: Option[] = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
  ];
  const religionOptions: Option[] = [
    { value: "christian", label: "Christian" },
    { value: "muslim", label: "Muslim" },
  ];
  const countryOptions: Option[] = [
    { value: "nigeria", label: "Nigeria" },
    // { value: "ghana", label: "Ghana" },
    // { value: "togo", label: "Togo" },
  ];
  const titleOptions: Option[] = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Miss", label: "Miss" },
    { value: "Dr", label: "Dr" },
    { value: "Engr", label: "Engr" },
  ];
  const martianOptions: Option[] = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
  ];
  const relationshipOptions: Option[] = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother" },
    { value: "Sister", label: "Sister" },
    { value: "Aunt", label: "Aunt" },
    { value: "Uncle", label: "Uncle" },
    { value: "Other", label: "Other" },
  ];
  return (
    <StudentContext.Provider
      value={{
        studentData,
        setStudentData,
        handleParentChange,
        guardianData,
        setParentData,
        parentData,
        setGuardianData,
        handleStudentChange,
        handleGuardianLinkChange,
        handleStudentLinkChange,
        handleGuardianChange,
        genderOptions,
        classOptions,
        classArms,
        religionOptions,
        countryOptions,
        titleOptions,
        martianOptions,
        relationshipOptions,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return context;
};
// export const useParentContext = () => useContext(ParentContext);
