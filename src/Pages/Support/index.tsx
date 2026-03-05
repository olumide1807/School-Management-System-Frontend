// Support Screen
import { FormProvider, useForm } from "react-hook-form";
import InputField from "../../Components/Forms/InputField";
import ValidatedInput from "../../Components/Forms/ValidatedInput";
import TextAreaField from "../../Components/Forms/TextAreaField";
import { Button } from "@mui/material";
import Thanks from "../../Components/Modals/SuccessModal";
import Suggest from "./Modals/SuggestionModal";
import { useState } from "react";
import { Cancel } from "@mui/icons-material";

export default function Support({}) {
  const [openThankYou, setOpenThankYou] = useState(false);
  const [filename, setFilename] = useState("");
  const [openSuggestion, setOpenSuggestion] = useState(false);

  const method = useForm({
    mode: "all",
  });
  return (
    <div className="">
      <FormProvider {...method}>
        <form
          className="lg:w-3/4 m-auto"
          onSubmit={method.handleSubmit((data) => {
            console.log(data);
            setOpenThankYou(true);
          })}
        >
          <h1 className="w-fit m-auto text-xl">How might we help you today?</h1>
          <div className="my-5">
            <ValidatedInput
              name="Email"
              type="email"
              required={true}
              placeholder="jane@gmail.com"
              label="Enter your email address"
              otherClass="bg-white rounded border-[#ccc] border"
            />
          </div>
          <div className="my-5">
            <TextAreaField
              placeholder="Type your issue here"
              label="What is the issue?"
              otherClass="bg-white rounded text-black"
            />
            <div className="my-5">
              <div className="bg-white w-full rounded-lg border border-[#ccc] flex items-center h-[7vh]">
                <p className="ml-2 text-sm">{filename}</p>
                {filename.length > 0 ? (
                  <div
                    className="rounded-full ml-auto mr-5 cursor-pointer"
                    onClick={() => {
                      setFilename("");
                    }}
                  >
                    <Cancel sx={{ color: "red" }} />
                  </div>
                ) : (
                  <Button
                    variant="contained"
                    color="tertiary"
                    sx={{
                      color: "white",
                      padding: "10px 40px",
                      height: "100%",
                      marginLeft: "auto",
                    }}
                  >
                    <label htmlFor="file-upload">Upload File</label>
                    <input
                      type="file"
                      id="file-upload"
                      hidden
                      onChange={(e) => {
                        setFilename(e.target.files[0].name);
                      }}
                    />
                  </Button>
                )}
              </div>
              <small className="italic text-placeholder">
                Image Upload should not be more than 5mb
              </small>
            </div>
            <div className="bg-tertiary w-fit rounded-xl">
              <Button
                sx={{
                  paddingInline: "45px",
                  paddingTop: "12px",
                  backgroundColor: "inherit",
                }}
                variant="contained"
                type="submit"
              >
                Send
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>

      <p
        onClick={() => setOpenSuggestion(true)}
        className="font-bold w-fit m-auto my-15 underline text-tertiary cursor-pointer"
      >
        Want to suggest a feature
      </p>

      {/* Thank you modal */}
      <Thanks
        openModal={openThankYou}
        closeModal={() => {
          setOpenThankYou(false);
        }}
      />
      {/* Suggesstion Modal */}
      <Suggest
        openModal={openSuggestion}
        closeModal={() => {
          setOpenSuggestion(false);
        }}
      />
    </div>
  );
}
