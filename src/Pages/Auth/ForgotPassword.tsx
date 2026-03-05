import { Link } from "react-router-dom";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import Input from "../../Components/Forms/Input";
import Button from "../../Components/Forms/Button";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../Utils/apiRoute";
import { ErrorMsg } from "../../Components/Forms";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL + "superadmin/forgotpassword", {
        email: email,
      });
      if (res.data.success === true) {
        localStorage.setItem("Email", email);
        navigate("/verify-otp");
      } else {
        return setError("Email does not exist");
      }
    } catch (error) {
      return setError("The email you entered is not valid");
    }
  };

  return (
    <OnboardingLayout2>
      <div className="flex flex-col w-[503px] pb-32 px-5 lg:px-0">
        <div className="flex flex-col items-center mb-[44px]">
          <h3 className="font-semibold text-2xl tracking-widest mb-4 text-white">
            FORGOT PASSWORD?
          </h3>
          <p className="text-lg text-white text-center">
            Enter your registered email below to receive instructions on how to
            reset your password
          </p>
        </div>
        <form className="flex flex-col gap-y-9" onSubmit={handleForgotPassword}>
          <div className="flex flex-col ">
            <Input
              name="email"
              placeholder="Email address"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required={true}
            />
          </div>
          <Button text="Continue" type="submit" />

          <ErrorMsg text={error} />
        </form>
        <div className="mt-[44px] text-center text-primary">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </OnboardingLayout2>
  );
}
