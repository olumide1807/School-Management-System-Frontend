import { useState, useEffect } from "react";
import Button from "../../Components/Forms/Button";
import InputBox from "../../Components/Forms/OtpInput";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import axios from "axios";
import { API_URL } from "../../Utils/apiRoute";
import { useRef } from "react";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from "../../Utils/server";
import Loader from './Loader';

const VerifyOtp = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timer, setTimer] = useState(600);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("Email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Please enter your registered email to continue");
    }
  }, []);

  useEffect(() => {
    let intervalId;

    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isTimerRunning]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  useEffect(() => {
    if (timer === 0) {
      setIsTimerRunning(false);
    }
  }, [timer, isTimerRunning]);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  let currentOtpIndex = 0;

  const handleKeyDown = ({ key }, index) => {
    currentOtpIndex = index;
    if (key === "Backspace") setActiveOtpIndex(currentOtpIndex - 1);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    let newOtp = otp.join("");
    let verifiedOtp = parseInt(newOtp, 10);
    setLoading(true);
    try {
      const res = await SERVER.post(`superadmin/verifyOTP?email=${email}`, {
        otp: verifiedOtp,
      });
      if (res.data) {
        setLoading(false);
        return window.location.replace("/reset-password");
      } else {
        setLoading(false);
        setError("The code you entered is invalid");
      }
    } catch (error) {
      setLoading(false);
      setError('OTP not generated or expired, please regenerate OTP');
    }
  };

  const resendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimer(600);
    setIsTimerRunning(true);
    try {
      const res = await axios.post(API_URL + "superadmin/forgotpassword", {
        email: email,
      });
      if (res.data) {
        setLoading(false)
      } else {
        setLoading(false);
        setError("The code you entered is invalid");
      }
    } catch (error) {
      setLoading(false);
      setError("Something went wrong, pls try again later");
    }
  };


  if(loading === true) return <Loader/>

  return (
    <OnboardingLayout2>
      <div className="flex flex-col items-center p-4">
        <div className="flex flex-col items-center mb-12">
          <h3 className="font-semibold text-3xl tracking-widest mb-4 uppercase text-white">
            Verification Code
          </h3>
          <p className="text-lg text-white text-center">
            Please enter the verification code sent to
            <span className="text-primary">&nbsp;{email}</span>
          </p>
        </div>

        <div className="flex gap-x-9 items-center justify-center">
          <InputBox
            value={otp[0]}
            maxLength={1}
            onChange={(e) => handleChange(0, e.target.value)}
            ref={activeOtpIndex ? inputRef : null}
            onKeyDown={handleKeyDown}
          />

          <InputBox
            value={otp[1]}
            maxLength={1}
            onChange={(e) => handleChange(1, e.target.value)}
            ref={activeOtpIndex ? inputRef : null}
            onKeyDown={handleKeyDown}
            required={true}
          />

          <InputBox
            value={otp[2]}
            maxLength={1}
            onChange={(e) => handleChange(2, e.target.value)}
            ref={activeOtpIndex ? inputRef : null}
            onKeyDown={handleKeyDown}
          />

          <InputBox
            value={otp[3]}
            maxLength={1}
            onChange={(e) => handleChange(3, e.target.value)}
            ref={activeOtpIndex ? inputRef : null}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex flex-col items-center m-10">
          <p className="text-2xl text-white">
            Expires in {minutes}: {seconds}
          </p>

          <span
            className={`text-2xl text-blue-500 my-2 ${
              timer === 0 ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            onClick={resendOtp}
          >
            Resend OTP
          </span>
        </div>

          <Button text="Continue" onClick={verifyOtp} />
           {error && <ErrorMsg text={error} />}

        <div className="flex flex-col mt-12 mb-28">
          <p className="text-2xl text-white">Didn’t get the code?</p>
          <ul className="text-2xl text-white list-disc ml-6">
            <li>The code can take up to 5 minutes to arrive</li>
            <li>You can also check your spam folder for the code</li>
          </ul>
        </div>
      </div>
    </OnboardingLayout2>
  );
};

export default VerifyOtp;
