/* eslint-disable react/prop-types */
import { Fade, Slide, Button } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface MessageModalProps {
  openModal: boolean;
  closeModal: () => void;
  maxWidth?: number;
  title?: string;
  desc?: string;
  desc2?: string;
  column?: boolean;
  btn1Name?: string;
  btn2Name?: string;
  handleClick: () => void;
  handleClick2?: () => void;
  holidayTo?: string[];
}

interface MessageModal2Props {
  openModal: boolean;
  closeModal: () => void;
  maxWidth?: number;
  title?: string;
  desc?: string;
  desc2?: string;
  column?: boolean;
  children?: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
}
export default function MessageModal({
  openModal,
  closeModal,
  maxWidth = 500,
  title,
  desc,
  desc2,
  column,
  btn1Name,
  btn2Name,
  handleClick,
  handleClick2,
  holidayTo,
}: // handleClick3,
MessageModalProps) {
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
            style={{ maxWidth }}
            className={`relative min-h-[400px] max-h-[583px]  w-[90%] overflow-y-auto items-center flex flex-col ${
              column ? "w-[583px] md:px-16 " : "w-[697px] md:px-24"
            } m-auto md:py-16 p-4 sm:p-5 rounded-[10px] bg-white`}
          >
            <button
              title="Close"
              type="button"
              className="absolute top-11 right-10 bg-[#7272721F] rounded-full w-max p-0.5 flex items-center justify-center"
              onClick={closeModal}
            >
              <ClearIcon />
            </button>

            <div
              className={`w-full my-auto max-w-[400px] flex flex-col items-center mb-24`}
            >
              {title && (
                <p className="font-semibold text-2xl text-black text-center">
                  {title}
                </p>
              )}
              <div className="w-full text-center text-black text-xl flex flex-col items-center mt-8 gap-y-2 ">
                <p>{desc}</p>
                {holidayTo ? (
                  <div className="w-full flex flex-col">
                    <div className="flex justify-between my-2">
                      <p>Showing for</p>
                      {desc2 && <p>{desc2}</p>}
                    </div>
                    <div className="flex justify-between my-2">
                      <p>Made visible To:</p>
                      <span className="p-1 md:w-20  w-16 bg-gray-200 rounded-full border border-black">
                        {holidayTo[0]}
                      </span>
                      <span className="p-1 md:w-20 w-16 bg-gray-200 rounded-full border border-black">
                        {holidayTo[1]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-11">{desc2}</p>
                )}
              </div>
            </div>
            <div
              className={`w-full flex ${
                column || window.screen.availWidth < 700
                  ? "flex-col gap-y-3 max-w-[331px]"
                  : "justify-between max-w-[313px]"
              }`}
            >
              <Button
                // color="tertiary"
                variant="contained"
                onClick={() => {
                  handleClick();
                  closeModal();
                }}
                sx={{
                  color: "white",
                  borderRadius: "10px",
                  width:
                    column || window.screen.availWidth < 700 ? "100%" : "119px",
                  height:
                    column || window.screen.availWidth < 700 ? "50px" : "",
                }}
              >
                {btn1Name ? btn1Name : column ? "Yes, Delete" : "Edit"}
              </Button>
              <Button
                // color="tertiary"
                variant={column ? "text" : "outlined"}
                onClick={!column ? handleClick2 : closeModal}
                sx={{
                  color: "tertiary",
                  borderRadius: "10px",
                  textTransform: "capitalize",
                  border: column ? "none" : "",
                  width:
                    column || window.screen.availWidth < 700 ? "100%" : "119px",
                  height:
                    column || window.screen.availWidth < 700 ? "50px" : "",
                }}
              >
                {btn2Name ? btn2Name : column ? "Cancel" : "Delete"}
              </Button>
            </div>
          </div>
        </Slide>
      </div>
    </Fade>
  );
}

export function MessageModal2({
  openModal,
  closeModal,
  maxWidth = 500,
  title,
  desc,
  desc2,
  column,
  children,
  direction,
}: MessageModal2Props) {
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
        <Slide
          direction={!direction ? "up" : direction}
          in={openModal}
          mountOnEnter
          unmountOnExit
        >
          <div
            style={{ maxWidth }}
            className={`relative min-h-[444px] max-h-[583px] overflow-y-auto items-center flex flex-col ${
              column ? "w-[583px] md:px-16" : "w-[697px] md:px-24"
            } m-auto md:py-16 p-4 sm:p-5 rounded-[10px] bg-white`}
          >
            <button
              title="Close"
              type="button"
              className="absolute top-11 right-10 bg-[#7272721F] rounded-full w-max p-0.5 flex items-center justify-center"
              onClick={closeModal}
            >
              <ClearIcon />
            </button>

            <div
              className={`my-auto max-w-[313px] flex flex-col gap-y-10 items-center mb-24`}
            >
              {title && (
                <p className="font-semibold text-xl text-black text-center">
                  {title}
                </p>
              )}
              <div className="text-center flex flex-col items-center gap-y-10">
                <div>{desc}</div>
                {desc2 && <p>{desc2}</p>}
              </div>
            </div>
            <div className={`w-full flex flex-col`}>{children}</div>
          </div>
        </Slide>
      </div>
    </Fade>
  );
}
