/* eslint-disable react/prop-types */
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";

import Modal from "../../../../../Components/Modals";
import EditParentData from "./EditParentTabs/EditParentData";
import ReviewEditedParent from "./EditParentTabs/ReviewEditedParent";

export default function EditParentProfile({ openModal, closeModal }) {
  const [presentStep, setPresentStep] = useState(1);
  const [allData, setAllData] = useState({});

  const stepComponents = {
    1: <EditParentData />,
    2: <ReviewEditedParent data={allData} />,
  };

  function handleNext() {
    if (presentStep < steps.length) setPresentStep((prev) => prev + 1);
  }
  function handlePrev() {
    if (presentStep > 1) setPresentStep((prev) => prev - 1);
  }

  const method = useForm({ mode: "all" });
  const onSubmit = async (data) => {
    setAllData(data);
    console.log(data);
  };

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
      <FormProvider {...method}>
        <form onSubmit={method.handleSubmit(onSubmit)}>
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
                  Save changes
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}

const steps = [
  {
    id: 1,
    name: "Edit Data",
  },
  {
    id: 2,
    name: "Review and Complete",
  },
];
