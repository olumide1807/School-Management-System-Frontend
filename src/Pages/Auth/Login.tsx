import { Link } from "react-router-dom";
import OnboardingLayout from "../../Templates/OnboardingLayout";
import { useState } from "react";
import { Input, Button, ErrorMsg } from "../../Components/Forms";
import { login } from "../../redux/apiCall";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../Components/Forms/InputField";
import LoaderOverlay from "./Loader";

type AccountType = "staff" | "parent" | "student";

const TABS: { value: AccountType; label: string }[] = [
  { value: "staff", label: "Staff" },
  { value: "parent", label: "Parent" },
  { value: "student", label: "Student" },
];

export default function Login() {
  const [accountType, setAccountType] = useState<AccountType>("staff");
  const [email, setEmail] = useState("");
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  const isStudent = accountType === "student";

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await login(
      dispatch,
      isStudent ? { studentID, password } : { email, password },
      accountType
    );
  };

  return (
    <>
      <OnboardingLayout>
        <div className="flex flex-col w-[383px] pb-32 px-5 lg:px-0">
          <div className="flex flex-col items-center mb-8">
            <h3 className="font-semibold text-2xl tracking-widest mb-4 text-white">
              WELCOME BACK
            </h3>
            {accountType === "staff" ? (
              <p className="text-lg text-white">
                Don&apos;t have an account?{" "}
                <Link className="text-primary" to="/register">
                  Register
                </Link>
              </p>
            ) : (
              <p className="text-sm text-white/70 text-center">
                Your school gives you these details. Ask them if you don&apos;t
                have them yet.
              </p>
            )}
          </div>

          {/* Account type */}
          <div className="flex gap-2 mb-8 p-1 rounded-[10px] bg-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setAccountType(tab.value)}
                className={`flex-1 py-2 rounded-[8px] text-sm transition-colors ${
                  accountType === tab.value
                    ? "bg-white text-secondary font-medium"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col gap-y-9">
              {isStudent ? (
                <Input
                  name="studentID"
                  type="text"
                  placeholder="Student ID"
                  value={studentID}
                  onChange={(e: any) => setStudentID(e.target.value)}
                  required={true}
                  otherClass="text-white border border-x-0 b border-t-0 rounded-[5px]"
                />
              ) : (
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required={true}
                  otherClass="text-white border border-x-0 b border-t-0 rounded-[5px]"
                />
              )}

              <div className="flex flex-col">
                <InputField
                  name="password"
                  placeholder="Password"
                  type="password"
                  onChange={(e: any) => setPassword(e.target.value)}
                  required={true}
                  otherClass="text-white border border-x-0 b border-t-0 rounded-[5px]"
                />
                {accountType === "staff" && (
                  <Link
                    to="/forgot-password"
                    className="self-end text-primary text-[15px]"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-[10px]">
              <Button text="Login" type="submit" loading={loading} onClick={() => {}} />

              {error === true && (
                <ErrorMsg
                  text={
                    isStudent
                      ? "Please enter a valid student ID and password"
                      : "Please enter a valid email and password"
                  }
                />
              )}
            </div>
          </form>
        </div>
      </OnboardingLayout>
      {loading === true && <LoaderOverlay />}
    </>
  );
}