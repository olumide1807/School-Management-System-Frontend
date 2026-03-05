/* eslint-disable react/prop-types */
import { Fade, Slide } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
interface ModalProps {
  children: React.ReactNode;
  openModal: boolean;
  closeModal: () => void;
  maxWidth?: string | number;
  height?: string | number;
  title: string;
  // execOnClose?: () => void;
  otherClasses?: string;
  promotion_status?: React.ReactNode;
  // isCentered?: boolean;
}
export default function Modal({
  children,
  openModal,
  closeModal,
  maxWidth = 500,
  height,
  title,
  // execOnClose,
  otherClasses,
  promotion_status,
}: // isCentered,
ModalProps) {
  return (
    <Fade in={openModal}>
      <div
        onClick={(e) => e.target === e.currentTarget && closeModal()}
        className="fixed h-full w-full top-0 left-0 overflow-hidden z-[999] flex items-center justify-center"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(5px)",
        }}
      >
        <Slide direction="up" in={openModal} mountOnEnter unmountOnExit>
          <div
            style={{ maxWidth, height }}
            className={`relative min-h-[548px] py-10 lg:max-h-[85vh] h-full overflow-y-auto flex flex-col lg:w-[95vw] w-full m-auto md:pt-16 md:px-24 p-4 sm:p-5 md:rounded-[10px] bg-white ${otherClasses}`}
          >
            <div className="flex items-center justify-between mb-[4em]">
              <div
                className={`text-black text-xl  font-semibold  ${
                  promotion_status ? "flex gap-3 items-center" : null
                }`}
              >
                {title}
                {promotion_status}
              </div>

              <button
                type="button"
                aria-label="close"
                title="close"
                className="md:top-11 top-5 md:right-10 right-7 bg-[#7272721F] flex items-center justfy-center rounded-full p-0.5 w-max"
                onClick={closeModal}
              >
                <ClearIcon />
              </button>
            </div>
            {children}
          </div>
        </Slide>
      </div>
    </Fade>
  );
}
