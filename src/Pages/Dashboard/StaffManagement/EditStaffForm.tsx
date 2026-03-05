import { FormProvider, useForm } from "react-hook-form";
import { InfoTab, InfoTab2 } from "./Staff/Tabs/OtherInfoTab";
import { staff } from "./Staff/Tabs/ReviewTab";
import StaffDataTab from "./Staff/Tabs/StaffDataTab";
import { useState } from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Button } from "@mui/material";
import ReviewTab from "./Staff/Tabs/ReviewTab";

export default function EditStaffForm() {
  const [assignedClass, setAssignedClass] = useState(Array(1).fill(nanoid()));
  const [step, setStep] = useState(1);

  const methods = useForm({
    mode: "all",
  });
  const navigate = useNavigate();
  return (
    <div>
      <section
        className="text-tertiary cursor-pointer w-fit"
        onClick={() => navigate(-1)}
      >
        <KeyboardBackspaceIcon sx={{ color: "inherit" }} />
        <span className="mx-2">Back</span>
      </section>

      <section className="mx-auto max-w-[850px]">
        <section className="flex justify-evenly w-[400px] mx-auto text-[#7E969F]">
          <div
            className={`${
              step >= 1 ? "text-tertiary " : ""
            } p-4 text-center cursor-pointer ${
              step === 1 && "text-tertiary border-b-tertiary border-b-2"
            }`}
            onClick={() => setStep(1)}
          >
            <p>Step 1</p>
            <p className="font-semibold">Edit Data</p>
          </div>

          <div
            className={`${
              step >= 2 ? "text-tertiary " : ""
            } p-4 text-center cursor-pointer ${
              step === 2 && " border-b-tertiary border-b-2"
            }`}
            onClick={() => setStep(2)}
          >
            <p>Step 2</p>
            <p className="font-semibold">Review And Complete</p>
          </div>
        </section>

        {/* Edit form data */}
        <FormProvider {...methods}>
          <form className="my-7">
            {step === 1 ? (
              <>
                <section className="flex justify-center items-center mt-4 mb-5">
                  <div className="w-32 bg-black p-[0.4px]"></div>
                  <div className="mx-3">Staff Data</div>
                  <div className="w-32 bg-black p-[0.4px]"></div>
                </section>
                <StaffDataTab staff={staff} edit={true} />
                <section className="flex justify-center items-center mt-5 mb-4">
                  <div className="w-32 bg-black p-[0.4px]"></div>
                  <div className="mx-3">Other Information</div>
                  <div className="w-32 bg-black p-[0.4px]"></div>
                </section>
                <InfoTab staff={staff} edit={true} />
                <InfoTab2
                  setAssignedClass={setAssignedClass}
                  assignedClass={assignedClass}
                />
              </>
            ) : (
              <ReviewTab />
            )}
            {/* Button That dynamically adjust the current slide and uploads staff data*/}
            <div className="mt-12">
              {step > 1 && (
                <Button
                  variant="outlined"
                  sx={{ width: "136px", marginRight: "25px" }}
                  onClick={() => (step >= 1 ? setStep(step - 1) : "")}
                >
                  Previous
                </Button>
              )}
              <Button
                variant="contained"
                color="tertiary"
                sx={{ color: "white", width: "136px" }}
                onClick={() => (step <= 2 ? setStep(step + 1) : "")}
              >
                {step === 2 ? "Save Changes" : "Next"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
