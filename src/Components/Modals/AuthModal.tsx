import {Modal} from '@mui/material'
import verified from "../../assets/icons/verified.png";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function AuthModal({setSuccess, open, message, btn, desc, url}){

  return (
        <Modal
        open={open}
        onClose={() => setSuccess(false)}
        >
        <section className={`w-1/4 flex flex-col items-center justify-center mt-[10%] m-auto text-center bg-[#C3EEFF] border-r-8 p-8`}>
            <div className="w-fit mx-auto">
            <img src={verified} alt="successful" />
            </div>

            <p className="py-11 text-2xl text-sky-700">{desc}</p>
            <p className="py-8 text-xl text-[#222]">
            {message}
            </p>
            <div className="mt-2">
            <Link to={url}>
                <Button
                    variant="contained"
                    style={{ width: "100%", color: "white", padding: "10px", fontSize: '18px' }}
                    onClick={() => setSuccess(false)}
                    color="tertiary"
                    >
                    {btn}
                </Button>
            </Link>
            </div>
        </section>
        </Modal>

  );
}

// background: #C3EEFF;
