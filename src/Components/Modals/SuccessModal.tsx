import Modal from "./index";
import verified from "../../assets/icons/verified.png";
import { Button } from "@mui/material";

export default function Success({
  openModal,
  closeModal,
  message,
  btnName1 = "Okay",
  desc = "Sent Successfully",
  otherClasses,
}) {
  return (
    <Modal
      openModal={openModal}
      closeModal={closeModal}
      otherClasses={otherClasses}
    >
      <section className={`w-11/12 mx-auto text-center`}>
        <div className="w-fit mx-auto">
          <img src={verified} alt="successful" />
        </div>

        <p className="py-11 text-xl">{desc}</p>
        <p className="py-8 text-lg">
          {message || "Our team will reach out to you soon."}
        </p>
        <div className="mt-2">
          <Button
            variant="contained"
            style={{ width: "100%", color: "white", padding: "10px" }}
            onClick={closeModal}
            color="tertiary"
          >
            {btnName1}
          </Button>
        </div>
      </section>
    </Modal>
  );
}
