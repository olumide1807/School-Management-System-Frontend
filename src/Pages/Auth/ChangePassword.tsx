import { useState } from "react";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import Button from "../../Components/Forms/Button";
import InputField from "../../Components/Forms/InputField";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from "../../Utils/server";
import { Logout } from "../../redux/apiCall";
import { useDispatch } from "react-redux";

export default function ChangePassword() {
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const role = sessionStorage.getItem("userRole");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      return setError("Your new password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return setError("The two new passwords don't match");
    }
    if (newPassword === currentPassword) {
      return setError("Your new password must be different from the current one");
    }

    setSaving(true);
    try {
      await SERVER.put("auth/change-password", { currentPassword, newPassword });
      sessionStorage.setItem("mustChangePassword", "false");
      window.location.replace("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not change your password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout2>
      <div className="flex flex-col w-[483px] pb-32 lg:px-0 px-5">
        <div className="flex flex-col items-center mb-[34px]">
          <h3 className="font-semibold text-2xl tracking-widest mb-4 capitalize text-white">
            Choose a password
          </h3>
          <p className="text-base text-white/80 text-center leading-relaxed">
            {role === "student"
              ? "Your current password is your student ID, which other people can see. Choose one only you know."
              : "Your current password was issued by your school. Choose one only you know."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-y-9 my-4">
            <InputField
              placeholder="Current password"
              type="password"
              required={true}
              onChange={(e: any) => setCurrentPassword(e.target.value)}
            />
            <InputField
              placeholder="New password"
              type="password"
              required={true}
              onChange={(e: any) => setNewPassword(e.target.value)}
            />
            <InputField
              placeholder="Confirm new password"
              type="password"
              required={true}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button text={saving ? "Saving..." : "Save password"} type="submit" loading={saving} onClick={() => {}} />

          {error && <ErrorMsg text={error} />}
        </form>

        <button
          onClick={() => Logout(dispatch)}
          className="mt-8 text-center text-primary text-sm"
        >
          Sign out
        </button>
      </div>
    </OnboardingLayout2>
  );
}