import ValidatedInput from "../../../Components/Forms/ValidatedInput";
import Modal from "../../../Components/Modals";
import { useForm, FormProvider } from "react-hook-form";
import { Button, Avatar } from "@mui/material";

export default function EditUserProfile({ openModal, closeModal, avatar }) {
  const method = useForm({
    method: "all",
  });
  return (
    <Modal title="Edit profile" openModal={openModal} closeModal={closeModal}>
      <FormProvider {...method}>
        <form>
          <section className="flex items-center">
            <Avatar
              src={avatar || "/images/placeholder.png"}
              alt="profile picture"
              sx={{ width: 120, height: 120 }}
            />

            <Button
              variant="outlined"
              sx={{ height: "fit-content", marginLeft: "8px" }}
            >
              {" "}
              <label htmlFor="change-pro-pic">Change profile image</label>
              <input type="file" id="change-pro-pic" hidden />
            </Button>
          </section>
          <ValidatedInput
            name="first name"
            label="First Name"
            otherClass="bg-white rounded-xl border-[#ccc] border mb-3"
          />
          <ValidatedInput
            name="last name"
            label="Last Name"
            otherClass="bg-white rounded-xl border-[#ccc] border mb-3"
          />
          <ValidatedInput
            name="email address"
            label="Email Address"
            otherClass="bg-white rounded-xl border-[#ccc] border mb-3"
          />
          <ValidatedInput
            name="phone number"
            label="Phone Number"
            otherClass="bg-white rounded-xl border-[#ccc] border mb-3"
          />
          <Button
            variant="contained"
            color="tertiary"
            sx={{ color: "white" }}
            onClick={closeModal}
          >
            Save changes
          </Button>
        </form>
      </FormProvider>
    </Modal>
  );
}
