import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import Button from "../../Components/Forms/Button";
import { useEffect, useState } from "react";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from '../../Utils/server'
import AuthModal from '../../Components/Modals/AuthModal';
import InputField from "../../Components/Forms/InputField";


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem("Email");

    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Pls enter a valid email address to continue");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password.length < 7) {
        return setError("Password must be at least 7 characters");
      }

      if (password !== confirmPassword) {
        return setError("Password and Confirm Password must match");
      }

      const res = await SERVER.post(`superadmin/resetpassword?email=${email}`, {
          password }
      );
      return res.data && window.location.replace('/')
    } catch (error) {
       setError('Reset token expired! Please try again later', error);
    }
  };

  return (
    <OnboardingLayout2>
      <div className="flex flex-col w-[483px] pb-32 lg:px-0 px-5">
        <div className="flex flex-col items-center mb-[44px]">
          <h3 className="font-semibold text-2xl tracking-widest mb-4 capitalize text-white">
            Reset password
          </h3>
          <p className="text-lg text-white">
            Please enter your new password to Login
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-y-9 my-4">
            <InputField
              placeholder="Password"
              type="password"
              required={true}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              placeholder="Confirm password"
              type="password"
              required={true}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button text="Reset password" type="submit" />

          {error && <ErrorMsg text={error} />}
        </form>
      </div>
    
      { success &&
				<AuthModal 
				open={success} 
        setSuccess={setSuccess}
				desc='Password Reset Successful!' 
				message={`Your password has been successfully reset` }
				url='/login'
				btn='Login'
				/>
			}
    </OnboardingLayout2>
  );
};

export default ResetPassword;
