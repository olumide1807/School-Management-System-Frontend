import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../../../Templates/DashboardLayout";
import Classes from "./tabs/Classes";
import GradingSystem from "./tabs/GradingSystem";
import SessionTerms from "./tabs/SessionTerms";
import Subjects from "./tabs/Subjects";
import Timetable from "./tabs/Timetable";
import View from "./tabs/tab2/View";
import ClassLevel from "./tabs/tab2/ClassLevel";
import { useDispatch, useSelector } from "react-redux";
import { setSlide } from "../../../../redux/slice/academicSlides";

export default function Academics() {
  // const [presentStep, setPresentStep] = useState(1);
  const dispatch = useDispatch();
  const presentStep = useSelector((state) => state.academicSlides.slideNo);
  const stepComponents = {
    1: <Classes />,
    2: <Subjects />,
    3: <SessionTerms />,
    4: <Timetable />,
    5: <GradingSystem />,
  };

  const [searchParams] = useSearchParams();
  const isShowingView = searchParams.get("name") !== null;
  const isShowingClassLevel = searchParams.get("level") !== null;
  if (isShowingView) return <View />;
  else if (isShowingClassLevel) return <ClassLevel />;

  return (
    <div>
      <div className="mb-[22px]">
        <div className="flex items-center justify-between w-full">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => dispatch(setSlide(step.id))}
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
    name: "Class",
  },
  {
    id: 2,
    name: "Subject",
  },
  {
    id: 3,
    name: "Session & Term",
  },
  {
    id: 4,
    name: "Timetable",
  },
  {
    id: 5,
    name: "Grading System",
  },
];
