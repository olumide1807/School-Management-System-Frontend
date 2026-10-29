import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import Input from "../../Components/Forms/Input";
import Button from "../../Components/Forms/Button";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from "../../Utils/server";
import { requestFailure } from "./passwordResetMessages";

// Step 1 of 3: ask for a code. The server answers the same way whether or
// not the email has an account, so this screen never says one was sent —
// only that one will be, if the account exists.
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  // The email used to be kept in localStorage between these screens; it
  // now travels in router state, so clear anything left behind
  useEffect(() => {
    try { localStorage.removeItem("Email"); } catch { /* storage unavailable */ }
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await SERVER.post("superadmin/forgotpassword", { email });
      // In memory only: gone when the tab closes
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(requestFailure(err));
    } finally {
      setSending(false);
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
            Enter the email address you sign in with. If it belongs to an account,
            we&apos;ll email a 6-digit code to it that lets you choose a new password.
          </p>
        </div>
        <form className="flex flex-col gap-y-9" onSubmit={handleForgotPassword}>
          <div className="flex flex-col ">
            <Input
              name="email"
              placeholder="Email address"
              type="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required={true}
            />
          </div>
          <Button text="Send me a code" type="submit" loading={sending} onClick={undefined} />

          <ErrorMsg text={error} />
        </form>
        <div className="mt-[44px] text-center text-primary">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </OnboardingLayout2>
  );
}
