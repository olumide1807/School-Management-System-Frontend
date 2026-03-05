/* eslint-disable react/prop-types */
import { useForm, FormProvider } from "react-hook-form";
import Button from "@mui/material/Button";
import CustomSelect from "../../../../Forms/CustomSelect";
import AutocompleteField from "../../../../../Components/Forms/AutocompleteField";
import { MessageModal2 } from "../../../../../Components/Modals/MessageModal";

export default function LinkGuardianModal({ openModal, closeModal }) {
  const method = useForm({ mode: "all" });
  const onSubmit = async (data) => {
    console.log(data);
  };

  return (
    <MessageModal2
      desc={
        <>
          <p className="pb-2">Link</p>
          <p>
            <strong>Pricilla Jane Gator</strong> to a Parent/Guardian
          </p>
        </>
      }
      // title={"Link"}
      openModal={openModal}
      closeModal={closeModal}
    >
      <FormProvider {...method}>
        <form
          onSubmit={method.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-10 mt-[-4em]"
        >
          <CustomSelect
            label="Select Parent/Guardian"
            labelFor="guardian"
            name="guardian"
            placeholder="Select Parent/Guardian"
            selectOption={[]}
            otherclass="md:w-[100%] "
          />
          <CustomSelect
            label="Relationship"
            labelFor="relationship"
            name="relationship"
            placeholder="Select Relationship"
            otherclass="md:w-[100%] "
            // selectOption={relationship}
          />
          <div className="text-center">
            <Button
              color="tertiary"
              variant="contained"
              type="submit"
              sx={{
                color: "white",
                borderRadius: "10px",
                paddingY: "12px",
                maxWidth: "331px",
              }}
            >
              Link Parent/Guardian
            </Button>
          </div>
        </form>
      </FormProvider>
    </MessageModal2>
  );
}

const relationship = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Aunt",
  "Uncle",
  "Others",
];
