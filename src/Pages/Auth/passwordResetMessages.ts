import { UNREACHABLE_MESSAGE, isUnreachable, serverMessage, statusOf } from "../../Utils/requestFailure";

// What the forgot-password screens say when something goes wrong.
//
// None of it may reveal whether an email has an account. The server
// answers "send me a code" the same way for every email, and treats an
// unknown email at verify like an account with no code, so these only
// ever say what the person can do next.
//
// The server's rules, for the wording (SMS-main controller/passwords.js):
// a code is 6 digits and lasts 10 minutes; only the newest works; 5 wrong
// guesses kill it; up to 5 codes per account a day; the reset that follows
// lasts 15 minutes and works once.

export const CODE_MINUTES = 10;
export const CODES_PER_DAY = 5;

export const sentTo = (email: string) =>
  `If ${email} belongs to an account, we've sent a 6-digit code to it. It lasts ${CODE_MINUTES} minutes.`;

export const RESENT = "If that email belongs to an account, a new code is on its way. Only the newest code works.";

export type VerifyFailure =
  | { kind: "wrong"; message: string; attemptsLeft: number }
  | { kind: "locked" | "noCode" | "badInput" | "unreachable" | "other"; message: string };

// Why a code wasn't accepted, and what to do about it
export function verifyFailure(err: unknown): VerifyFailure {
  if (isUnreachable(err)) return { kind: "unreachable", message: UNREACHABLE_MESSAGE };
  const said = statusOf(err) === 400 ? serverMessage(err) || "" : "";

  const left = said.match(/(\d+) attempts? left/);
  if (left) {
    const n = Number(left[1]);
    return {
      kind: "wrong",
      attemptsLeft: n,
      message: `That code isn't right. Check the email and try again — you have ${n} more ${n === 1 ? "try" : "tries"} before you'll need a new code.`,
    };
  }
  if (/too many wrong codes/i.test(said)) {
    return {
      kind: "locked",
      message: "That code was entered wrongly too many times, so it no longer works. Send yourself a new code below.",
    };
  }
  if (/no valid code/i.test(said)) {
    return {
      kind: "noCode",
      message: `That code has expired or can't be used any more. Send yourself a new code below — codes last ${CODE_MINUTES} minutes and only the newest one works.`,
    };
  }
  if (/"otp"/.test(said)) return { kind: "badInput", message: "Enter the 6-digit code from the email." };
  return { kind: "other", message: "Something went wrong checking that code. Please try again." };
}

export type ResetFailure = { kind: "expired" | "unreachable" | "badInput" | "other"; message: string };

// Why a new password wasn't saved
export function resetFailure(err: unknown): ResetFailure {
  if (isUnreachable(err)) return { kind: "unreachable", message: UNREACHABLE_MESSAGE };
  const said = statusOf(err) === 400 ? serverMessage(err) || "" : "";
  if (/expired or has already been used|"token"/.test(said)) {
    return {
      kind: "expired",
      message: "This reset has expired or has already been used — each one works once, within 15 minutes of entering your code. Start again to get a new code.",
    };
  }
  if (/"password"/.test(said)) return { kind: "badInput", message: "Your new password needs at least 7 characters." };
  return { kind: "other", message: "Your password couldn't be changed. Please try again." };
}

// Why a code couldn't be requested. Never "no account with that email":
// the server doesn't say, and neither do we.
export function requestFailure(err: unknown): string {
  if (isUnreachable(err)) return UNREACHABLE_MESSAGE;
  if (statusOf(err) === 400) return "Enter a valid email address.";
  return "We couldn't send a code just now. Please try again.";
}
