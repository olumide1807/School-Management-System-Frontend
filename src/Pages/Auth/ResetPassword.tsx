import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import Button from "../../Components/Forms/Button";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from "../../Utils/server";
import AuthModal from "../../Components/Modals/AuthModal";
import InputField from "../../Components/Forms/InputField";
import { resetFailure } from "./passwordResetMessages";

// Step 3 of 3: choose a new password. The single-use reset token from
// step 2 arrives in router state — memory only, never storage — and is the
// only thing the server needs to know whose password this is.
const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken: string | undefined = (location.state as any)?.resetToken;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Opened without a code just verified (a typed URL, a closed tab)
  if (!resetToken && !success) {
    return (
      <OnboardingLayout2>
        <div className="flex flex-col items-center p-4 gap-6 text-center">
          <h3 className="font-semibold text-2xl tracking-widest capitalize text-white">Reset password</h3>
          <p className="text-lg text-white">
            To choose a new password, first get a code by email and enter it.
          </p>
          <Link to="/forgot-password" className="text-primary text-lg">Get a code</Link>
        </div>
      </OnboardingLayout2>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 7) return setError("Your new password needs at least 7 characters.");
    if (password !== confirmPassword) return setError("The two passwords don't match.");
    setSaving(true);
    try {
      await SERVER.post("superadmin/resetpassword", { token: resetToken, password });
      // The token is spent; drop it from this history entry too
      navigate(location.pathname, { replace: true, state: null });
      setSuccess(true);
    } catch (err) {
      const failure = resetFailure(err);
      setError(failure.message);
      setExpired(failure.kind === "expired");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout2>
      <div className="flex flex-col w-[483px] pb-32 lg:px-0 px-5">
        <div className="flex flex-col items-center mb-[44px]">
          <h3 className="font-semibold text-2xl tracking-widest mb-4 capitalize text-white">
            Reset password
          </h3>
          <p className="text-lg text-white">Choose a new password of at least 7 characters.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-y-9 my-4">
            <InputField
              placeholder="New password"
              type="password"
              required={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <InputField
              placeholder="Confirm new password"
              type="password"
              required={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button text="Reset password" type="submit" loading={saving} onClick={undefined} />

          {error && <ErrorMsg text={error} />}
          {expired && (
            <Link to="/forgot-password" className="mt-4 text-center text-primary text-lg">
              Start again
            </Link>
          )}
        </form>
      </div>

      {success && (
        <AuthModal
          open={success}
          setSuccess={setSuccess}
          desc="Password reset"
          message="Your password has been changed. Sign in with your new password."
          url="/login"
          btn="Sign in"
        />
      )}
    </OnboardingLayout2>
  );
};

export default ResetPassword;
