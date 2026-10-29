import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../Components/Forms/Button";
import { OnboardingLayout2 } from "../../Templates/OnboardingLayout";
import { ErrorMsg } from "../../Components/Forms";
import SERVER from "../../Utils/server";
import { CODES_PER_DAY, CODE_MINUTES, RESENT, requestFailure, sentTo, verifyFailure } from "./passwordResetMessages";

// Step 2 of 3: enter the 6-digit code. The email arrives in router state
// from step 1. A right code returns a single-use reset token, which goes to
// step 3 in router state too — never storage: it's a credential.
const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email: string | undefined = (location.state as any)?.email;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  // When the code can't be used any more, the next step is a new one
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CODE_MINUTES * 60);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  // Opened without coming from step 1 (a typed URL, a closed tab)
  if (!email) {
    return (
      <OnboardingLayout2>
        <div className="flex flex-col items-center p-4 gap-6 text-center">
          <h3 className="font-semibold text-3xl tracking-widest uppercase text-white">Verification Code</h3>
          <p className="text-lg text-white">
            Start by entering your email, and we&apos;ll send you a code.
          </p>
          <Link to="/forgot-password" className="text-primary text-lg">Get a code</Link>
        </div>
      </OnboardingLayout2>
    );
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from the email.");
    setChecking(true);
    try {
      const res = await SERVER.post(`superadmin/verifyOTP?email=${encodeURIComponent(email)}`, { otp: Number(code) });
      const resetToken = res?.data?.data?.resetToken;
      if (!resetToken) return setError("Something went wrong checking that code. Please try again.");
      // Replace this entry, so Back can't return to a spent code
      navigate("/reset-password", { state: { resetToken }, replace: true });
    } catch (err) {
      const failure = verifyFailure(err);
      setError(failure.message);
      setNeedsNewCode(failure.kind === "locked" || failure.kind === "noCode");
      setCode("");
      inputRef.current?.focus();
    } finally {
      setChecking(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await SERVER.post("superadmin/forgotpassword", { email });
      setInfo(RESENT);
      setNeedsNewCode(false);
      setCode("");
      setSecondsLeft(CODE_MINUTES * 60);
      inputRef.current?.focus();
    } catch (err) {
      setError(requestFailure(err));
    } finally {
      setResending(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <OnboardingLayout2>
      <div className="flex flex-col items-center p-4">
        <div className="flex flex-col items-center mb-10">
          <h3 className="font-semibold text-3xl tracking-widest mb-4 uppercase text-white">
            Verification Code
          </h3>
          <p className="text-lg text-white text-center max-w-[520px]">{sentTo(email)}</p>
        </div>

        <form onSubmit={verifyOtp} className="flex flex-col items-center gap-4 w-full max-w-[360px]">
          <label htmlFor="otp" className="sr-only">6-digit code</label>
          <input
            id="otp"
            ref={inputRef}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="••••••"
            aria-describedby="otp-help"
            className="w-full p-4 text-center text-3xl tracking-[0.5em] text-[#222] rounded"
          />
          <p id="otp-help" className="text-white text-base">
            {secondsLeft > 0 ? `This code lasts another ${minutes}:${seconds}.` : "This code has run out. Send yourself a new one."}
          </p>
          <Button text="Continue" type="submit" loading={checking} onClick={undefined} />
        </form>

        {error && <div className="mt-4"><ErrorMsg text={error} /></div>}
        {info && <p className="mt-4 text-white text-center max-w-[520px]">{info}</p>}

        <button
          type="button"
          onClick={resendOtp}
          disabled={resending}
          className={`mt-6 text-xl ${needsNewCode || secondsLeft <= 0 ? "text-white bg-tertiary px-5 py-2.5 rounded-[10px]" : "text-blue-400 underline"}`}
        >
          {resending ? "Sending…" : "Send a new code"}
        </button>

        <div className="flex flex-col mt-12 mb-28 max-w-[520px]">
          <p className="text-xl text-white">Didn&apos;t get a code?</p>
          <ul className="text-lg text-white list-disc ml-6">
            <li>It can take a few minutes to arrive, and may be in your spam folder.</li>
            <li>Check the email address is the one you sign in with — <Link to="/forgot-password" className="text-primary">use a different one</Link>.</li>
            <li>You can ask for up to {CODES_PER_DAY} codes a day. If you&apos;ve had that many, try again tomorrow.</li>
          </ul>
        </div>
      </div>
    </OnboardingLayout2>
  );
};

export default VerifyOtp;
