import AutoCompleteField from "../../../../../Components/Forms/AutocompleteField";
import InputField from "../../../../../Components/Forms/InputField";
// import TextAreaField from "../../../../../Components/Forms/TextAreaField";
import { DatePickerField } from "../../../../../Components/Forms";
import {
  Add,
  CancelPresentationRounded,
  CancelRounded,
  PlusOne,
} from "@mui/icons-material";
import { useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import FilterComponent from "../../../../../Components/FilterComponent";

export const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Agric Science",
  "Economics",
  "Government",
  "Commerce",
  "Accounting",
  "CRS",
  "IRS",
  "Yoruba",
  "French",
  "Literature",
  "Geography",
  "History",
  "Civic Education",
  "Computer Science",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Business Studies",
  "Fine Art",
  "Music",
  "Physical Health Education",
  "Home Economics",
  "Technical Drawing",
  "Further Mathematics",
  "Data Processing",
  "Animal Husbandry",
  "Fishery",
  "Catering",
  "Tourism",
  "Photography",
  "Visual Art",
  "Diction",
  "Handwriting",
  "Spelling",
  "Phonics",
  "Creative Writing",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Logical Reasoning",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Business Studies",
  "Fine Art",
  "Music",
  "Physical Health Education",
  "Home Economics",
  "Technical Drawing",
  "Further Mathematics",
  "Data Processing",
  "Animal Husbandry",
  "Fishery",
  "Catering",
  "Tourism",
  "Photography",
  "Visual Art",
  "Diction",
  "Handwriting",
  "Spelling",
  "Phonics",
  "Creative Writing",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Logical Reasoning",
];
export default function OtherInfoTab({}) {
  const [assignedClass, setAssignedClass] = useState(Array(1).fill(nanoid()));

  return (
    <>
      <InfoTab />
      <p className="mt-8 mb-4">
        Select the subjects and the classes that these subjects will be taught
        by this staff
      </p>
      <InfoTab2
        setAssignedClass={setAssignedClass}
        assignedClass={assignedClass}
      />
    </>
  );
}

export function InfoTab({ staff, edit }) {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-5">
      <AutoCompleteField
        label="Staff type"
        placeholder="Select Staff Type"
        name="staff_type"
        labelFor="staff_type"
        selectOption={["Academic", "Non-academic"]}
        defaultValue={staff ? staff.staffType : ""}
        readOnly={!(!staff || edit)}
        important={!staff}
        size="small"
        bg="#F3F3F3"
      />
      <InputField
        label="Salary with currency"
        placeholder="e.g $400, N30,000"
        name="salary"
        labelFor="salary"
        otherClass="rounded border border-[#ccc] h-[40px] md:h-[40px] bg-[#F3F3F3]"
        defaultValue={staff ? staff.salaryWithCurrency : ""}
        readOnly={!(!staff || edit)}
        important={!staff}
      />
      <DatePickerField
        label="Employment date"
        placeholder="DD / MM/ YYYY"
        name="doe"
        labelFor="doe"
        important
      />
    </div>
  );
}

export function InfoTab2({ setAssignedClass, assignedClass, staff }) {
  // const [assignedSubject, setAssignedSubject] = useState("Select subject");
  // const [subjectList, setSubjectList] = useState([]);
  const assignedClasses = [{}, {}];
  const assignedSubjects = [{}, {}];
  const classes = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
  const [choiceClass, setChoiceClass] = useState("Select Class");
  const [classList, setClassList] = useState([]);

  const [choiceSubject, setChoiceSubject] = useState("Select Class");
  const [subjectList, setSubjectList] = useState([]);
  return (
    <>
      {!staff ? (
        <div className="">
          {assignedClass.map((v, c) => {
            return (
              <div className="flex items-center relative" key={nanoid}>
                <div className="flex w-full justify-between gap-x-10 my-2">
                  <div className="w-full">
                    <FilterComponent
                      setChoice={setChoiceClass}
                      choice={choiceClass}
                      menuLabel={"Select Class"}
                      menuOptions={classes.map((cls) => ({
                        label: cls,
                        value: cls,
                        handleClick: (value) => {
                          setChoiceClass(value);
                          setClassList([...classList, value]);
                        },
                      }))}
                      label={"Select assigned class " + Number(c + 1)}
                      multiSelect={classList}
                      setMultiSelect={setClassList}
                      otherClasses={"w-full bg-[#F3F3F3] p-1"}
                    />
                  </div>
                  <div className="w-full">
                    <FilterComponent
                      setChoice={setChoiceSubject}
                      choice={choiceSubject}
                      menuLabel={"Select Subject"}
                      menuOptions={subjects.map((sub) => ({
                        label: sub,
                        value: sub,
                        handleClick: (value) => {
                          setChoiceSubject(value);
                          setSubjectList([...subjectList, value]);
                        },
                      }))}
                      label={"Select assigned subject " + Number(c + 1)}
                      multiSelect={subjectList}
                      setMultiSelect={setSubjectList}
                      className="w-full"
                      otherClasses={"w-full bg-[#F3F3F3] p-1"}
                    />
                  </div>
                </div>
                {c + 1 > 1 && (
                  <CancelRounded
                    color="red"
                    sx={{
                      color: "red",
                      margin: "35px 0  0 15px",
                      position: "absolute",
                      right: "-40px",
                      top: "10px",
                    }}
                    onClick={() =>
                      setAssignedClass(assignedClass.filter((cls) => cls !== v))
                    }
                  />
                )}
              </div>
            );
          })}
          <div
            className="bg-tertiary text-white w-fit my-9 rounded-md flex items-center cursor-pointer p-3"
            onClick={() => setAssignedClass([...assignedClass, nanoid()])}
          >
            <Add />
            <p>Add more field</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-24 gap-y-5 my-4">
          <aside className="">
            {assignedClasses.map((assignedClass, c) => (
              <>
                <p className="my-4">Assigned subject {c + 1}</p>
                <div className="flex justify-between">
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">History</p>
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">
                    English language
                  </p>
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl">CRS</p>
                </div>
              </>
            ))}
          </aside>
          <aside className="">
            {assignedSubjects.map((assignedSubject, c) => (
              <>
                <p className="my-4">Assigned class {c + 1}</p>
                <div className="flex justify-between">
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                    Jss 1b
                  </p>
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                    Jss 2a
                  </p>
                  <p className="px-5 py-3 bg-[#F3F3F3] rounded-3xl uppercase">
                    ss 1b
                  </p>
                </div>
              </>
            ))}
          </aside>
        </div>
      )}
    </>
  );
}
