import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import StaffDataTab from "./Staff/Tabs/StaffDataTab";
import OtherInfoTab from "./Staff/Tabs/OtherInfoTab";
import ReviewTab from "./Staff/Tabs/ReviewTab";

export function AddStaffForm({}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const methods = useForm({
    mode: "all",
  });
  return (
    <div>
      <section
        className="text-tertiary cursor-pointer w-fit"
        onClick={() => navigate("/staff-management")}
      >
        <KeyboardBackspaceIcon sx={{ color: "inherit" }} />
        <span className="mx-2">Back</span>
      </section>

      <section className="mx-auto max-w-[850px]">
        <section className="flex justify-around text-[#7E969F]">
          <div
            className={`${
              step >= 1 ? "text-tertiary " : ""
            } p-4 text-center cursor-pointer ${
              step === 1 && "text-tertiary border-b-tertiary border-b-2"
            }`}
            onClick={() => setStep(1)}
          >
            <p>Step 1</p>
            <p className="font-semibold">Staff Data</p>
          </div>
          <div
            className={`${
              step >= 2 ? "text-tertiary " : ""
            } p-4 text-center cursor-pointer ${
              step === 2 ? "border-b-tertiary border-b-2" : ""
            } `}
            onClick={() => setStep(2)}
          >
            <p>Step 2</p>
            <p className="font-semibold">Other Information</p>
          </div>
          <div
            className={`${
              step >= 3 ? "text-tertiary " : ""
            } p-4 text-center cursor-pointer ${
              step === 3 && " border-b-tertiary border-b-2"
            }`}
            onClick={() => setStep(3)}
          >
            <p>Step 3</p>
            <p className="font-semibold">Review And Complete</p>
          </div>
        </section>
        <FormProvider {...methods}>
          <form className="my-7">
            {/* Tabs screen */}
            {step === 1 ? (
              <StaffDataTab />
            ) : step === 2 ? (
              <OtherInfoTab />
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
                {step === 3 ? "Upload Staff" : "Next"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
