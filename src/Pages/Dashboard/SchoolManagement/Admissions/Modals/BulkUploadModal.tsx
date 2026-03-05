/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";
import CustomSelect from "../../../../Forms/CustomSelect";
import Modal from "../../../../../Components/Modals";
import AutocompleteField from "./../../../../../Components/Forms/AutocompleteField";

export default function BulkUploadModal({ openModal, closeModal }) {
  const method = useForm({
    mode: "all",
  });

  const onSubmit = async (data) => {
    console.log(data);
  };
  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      title="Bulk upload student"
      maxWidth="831px"
    >
      <FormProvider {...method}>
        <form
          onSubmit={method.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-16"
        >
          <div className="flex flex-col gap-y-9">
            <div className="h-[223px] w-full bg-bg-7 border border-dashed border-black flex items-center justify-center rounded-[5px]">
              <div className="flex flex-col gap-y-11">
                <p>Drop files here</p>
                <Button
                  variant="contained"
                  color="tertiary"
                  sx={{
                    color: "white",
                    borderRadius: "10px",
                    paddingY: "12px",
                    maxWidth: "153px",
                  }}
                >
                  <input
                    type="file"
                    {...method.register("item", {
                      required: {
                        value: true,
                        message: "This field is required",
                      },
                    })}
                    accept=".csv, .xls, .xlsx"
                    hidden
                  />
                  Browse file
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-y-5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-y-9 md:gap-x-[119px] md:gap-y-0">
                <CustomSelect
                  label="Class level"
                  required={true}
                  name="level"
                  placeholder="Select class level"
                  selectOption={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                  // className="w-[403px] "
                />

                <CustomSelect
                  label="Class arm "
                  required={true}
                  name="level"
                  placeholder="Select class arm"
                  selectOption={[]}
                />
              </div>

              <p className="text-tertiary">
                This action adds all uploaded students to the selected class
              </p>
              <Button
                variant="contained"
                type="submit"
                color="tertiary"
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  paddingY: "12px",
                  maxWidth: "193px",
                }}
              >
                Upload csv file
              </Button>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-9">
              Follow the steps below to download and use the csv file
            </p>
            <div className="flex flex-col gap-y-10">
              <div>
                <p className="mb-5">
                  Step 1: Click on the button below to download the csv file
                </p>
                <Button
                  variant="outlined"
                  color="tertiary"
                  sx={{
                    color: "tertiary",
                    borderRadius: "10px",
                    paddingY: "12px",
                    maxWidth: "193px",
                  }}
                >
                  Download csv file
                </Button>
              </div>
              <p>Step 2: Open the file on your computer</p>
              <p>
                Step 3: Fill all sections provided in the specified format, then
                save
              </p>
              <p>
                Step 4: Click on the “Browse file” button to select the filled
                template saved on your computer
              </p>
              <p>
                Step 5: Select a class level to add all students in the file
              </p>
              <p className="mb-[2em]">
                Step 6: Click on the “Upload csv file” button to upload
              </p>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
