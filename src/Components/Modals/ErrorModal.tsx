import Modal from "./index";
import error from "../../assets/icons/error.svg";
import { Button } from "@mui/material";

export default function ErrorModal({
  openModal,
  closeModal,
  message,
  btnName1 = "Try again",
  desc = "Password could not change",
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
          <img src={error} alt="successful" />
        </div>

        <p className="py-11 text-xl"></p>
        <p className="py-8 text-lg">{desc}</p>
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
