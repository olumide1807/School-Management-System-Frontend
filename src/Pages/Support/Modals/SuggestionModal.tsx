import { Button } from "@mui/material";
import Modal from "../../../Components/Modals";
import TextAreaField from "../../../Components/Forms/TextAreaField";
import { useState } from "react";
import SuccessModal from "../../../Components/Modals/SuccessModal";

export default function Suggest({ openModal, closeModal }) {
  const [successful, setSuccessful] = useState(false);

  return (
    <div>
      <Modal
        openModal={openModal}
        closeModal={closeModal}
        title="Suggest a feature"
        maxWidth={600}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            closeModal();
            setSuccessful(true);
          }}
        >
          <div>
            <TextAreaField placeholder="Type here" rows={"10"} />
          </div>
          <div className="mt-5">
            <Button
              type="submit"
              variant="contained"
              style={{
                color: "white",
                paddingBlock: "5px",
                paddingInline: "20px",
              }}
              color="tertiary"
            >
              Send
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Message */}
      <SuccessModal
        openModal={successful}
        closeModal={() => setSuccessful(false)}
        message={"Thank you for your suggestion"}
      />
    </div>
  );
}
