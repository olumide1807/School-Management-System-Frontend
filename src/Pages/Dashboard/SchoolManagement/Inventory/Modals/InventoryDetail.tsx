/* eslint-disable react/prop-types */
import { Fade, Slide, Button } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export function InventoryDetail({
    openModal,
    closeModal,
    maxWidth = 500,
    title,
    note,
    direction,
    handleClick
}) {
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
                <Slide direction={!direction ? "up" : direction} in={openModal} mountOnEnter unmountOnExit>
                    <div
                        style={{ maxWidth }}
                        className={`relative min-h-[444px] max-h-[583px]  w-[583px] md:px-16" "w-[697px] md:px-24 m-auto md:py-16 p-4 sm:p-5 rounded-[10px] bg-white flex flex-col`}
                    >
                        <button
                            className="absolute top-11 right-10 bg-[#7272721F] rounded-full w-max p-0.5 flex items-center justify-center"
                            onClick={closeModal}
                        >
                            <ClearIcon />
                        </button>

                        <div
                            className={`max-w-[313px] mb-9`}
                        >
                            {title && (
                                <p className="font-semibold text-xl text-black">
                                    {title}
                                </p>
                            )}
                        </div>
                        <div className={`w-full`}>{note && note.note}</div>
                        <Button variant="contained" sx={{ width: "85%", marginTop: "auto" }} onClick={handleClick}>Edit</Button>
                    </div>
                </Slide>
            </div>
        </Fade>
    );
}