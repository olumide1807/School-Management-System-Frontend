// Forgot password → verify code → reset password, against the backend's
// flow: 6-digit codes, a single-use reset token handed from verify to reset
// in router state (never storage), and no wording that reveals whether an
// email has an account.
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { serverStub } from "../../test/serverStub";
import { bodyText, buttonByText, click, mount, setValue } from "../../test/dom";
import theme from "../../theme";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";
import { RESENT, sentTo } from "./passwordResetMessages";

vi.mock("../../Utils/server", () => import("../../test/serverStub"));

const TOKEN = "ab".repeat(32);
const EMAIL = "tunde@greenhill.ng";

const render = (path: string, state?: unknown) =>
  mount(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

const posts = (url: string) => serverStub.requests.filter(([m, u]) => m === "POST" && u.startsWith(url));
const submit = async () => {
  const form = document.querySelector("form")!;
  await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
};
const refuse = (status: number, error: string) => ({ status, data: { success: false, error } });
const nothingStored = () => {
  const stored = JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage });
  expect(stored).not.toContain(TOKEN);
  expect(stored).not.toContain(EMAIL);
};

beforeEach(() => {
  serverStub.reset();
  localStorage.clear();
  sessionStorage.clear();
  serverStub.respond = () => ({ success: true, data: null });
});

describe("step 1: asking for a code", () => {
  test("never says a code was sent — only that one will be, if the account exists", async () => {
    await render("/forgot-password");
    expect(bodyText()).toContain("If it belongs to an account, we'll email a 6-digit code to it");
    expect(bodyText()).not.toMatch(/we('ve| have) sent/i);
  });

  test("passes the email to the next step in memory, and clears what older versions stored", async () => {
    localStorage.setItem("Email", "old@example.com");
    await render("/forgot-password");
    expect(localStorage.getItem("Email")).toBeNull();
    await setValue(document.querySelector('input[name="email"]') as HTMLInputElement, EMAIL);
    await submit();
    expect(posts("superadmin/forgotpassword")[0][2]).toEqual({ email: EMAIL });
    expect(bodyText()).toContain(sentTo(EMAIL));
    nothingStored();
  });

  test("a malformed email, or no answer from the server", async () => {
    await render("/forgot-password");
    await setValue(document.querySelector('input[name="email"]') as HTMLInputElement, EMAIL);
    serverStub.refuse.POST = refuse(400, '"email" must be a valid email');
    await submit();
    expect(bodyText()).toContain("Enter a valid email address.");
    serverStub.refuse.POST = refuse(503, "down");
    await submit();
    expect(bodyText()).toContain("We couldn't reach the school portal. Please try again shortly.");
  });
});

describe("step 2: entering the code", () => {
  const codeInput = () => document.querySelector("#otp") as HTMLInputElement;
  const enter = async (code: string) => { await setValue(codeInput(), code); await submit(); };

  test("opened without coming from step 1: sends you back to start", async () => {
    await render("/verify-otp");
    expect(bodyText()).toContain("Start by entering your email, and we'll send you a code.");
    expect(document.querySelector('a[href="/forgot-password"]')).not.toBeNull();
  });

  test("takes six digits — and says so before sending anything shorter", async () => {
    await render("/verify-otp", { email: EMAIL });
    expect(bodyText()).toContain(sentTo(EMAIL));
    expect(codeInput().maxLength).toBe(6);
    await enter("1234");
    expect(bodyText()).toContain("Enter the 6-digit code from the email.");
    expect(posts("superadmin/verifyOTP")).toHaveLength(0);
  });

  test("a wrong code with tries left says how many, and clears the field", async () => {
    await render("/verify-otp", { email: EMAIL });
    serverStub.refuse.POST = refuse(400, "That code isn't right. 4 attempts left.");
    await enter("123456");
    expect(bodyText()).toContain("That code isn't right. Check the email and try again — you have 4 more tries before you'll need a new code.");
    expect(codeInput().value).toBe("");
    serverStub.refuse.POST = refuse(400, "That code isn't right. 1 attempt left.");
    await enter("123457");
    expect(bodyText()).toContain("you have 1 more try before");
  });

  test("a code killed by wrong guesses: says so, and offers a new code", async () => {
    await render("/verify-otp", { email: EMAIL });
    serverStub.refuse.POST = refuse(400, "Too many wrong codes. Request a new code.");
    await enter("123456");
    expect(bodyText()).toContain("That code was entered wrongly too many times, so it no longer works. Send yourself a new code below.");
    expect(buttonByText("Send a new code")[0].className).toContain("bg-tertiary");
  });

  test("an expired, used or unknown code — the same words whether or not the account exists", async () => {
    await render("/verify-otp", { email: "nobody@example.com" });
    serverStub.refuse.POST = refuse(400, "There's no valid code for this account: it has expired, been used, or had too many wrong attempts. Request a new code.");
    await enter("123456");
    expect(bodyText()).toContain("That code has expired or can't be used any more. Send yourself a new code below — codes last 10 minutes and only the newest one works.");
    expect(bodyText()).not.toMatch(/no account|not found|doesn't exist/i);
  });

  test("sending a new code: the same answer for every email, and the daily limit is stated", async () => {
    await render("/verify-otp", { email: EMAIL });
    await click(buttonByText("Send a new code")[0]);
    expect(posts("superadmin/forgotpassword")[0][2]).toEqual({ email: EMAIL });
    expect(bodyText()).toContain(RESENT);
    expect(bodyText()).toContain("You can ask for up to 5 codes a day. If you've had that many, try again tomorrow.");
  });

  test("the right code takes you on with the reset token, held in memory only", async () => {
    await render("/verify-otp", { email: EMAIL });
    serverStub.refuse.POST = undefined;
    // The verify endpoint's answer
    const post = vi.spyOn((await import("../../test/serverStub")).default, "post").mockResolvedValueOnce({
      data: { success: true, data: { resetToken: TOKEN, expiresInMinutes: 15 } },
    } as any);
    await enter("123456");
    expect(post.mock.calls[0]).toEqual([`superadmin/verifyOTP?email=${encodeURIComponent(EMAIL)}`, { otp: 123456 }]);
    expect(bodyText()).toContain("Choose a new password of at least 7 characters.");
    nothingStored();
    post.mockRestore();
  });
});

describe("step 3: the new password", () => {
  const fill = async (a: string, b = a) => {
    const [pw, confirm] = [...document.querySelectorAll('input[type="password"]')] as HTMLInputElement[];
    await setValue(pw, a);
    await setValue(confirm, b);
    await submit();
  };

  test("opened without a verified code: sends you back to start", async () => {
    await render("/reset-password");
    expect(bodyText()).toContain("To choose a new password, first get a code by email and enter it.");
  });

  test("sends the token and the password — nothing else", async () => {
    await render("/reset-password", { resetToken: TOKEN });
    await fill("a-new-password");
    const [[, url, body]] = posts("superadmin/resetpassword");
    expect(url).toBe("superadmin/resetpassword");
    expect(body).toEqual({ token: TOKEN, password: "a-new-password" });
    expect(bodyText()).toContain("Your password has been changed. Sign in with your new password.");
    nothingStored();
  });

  test("checks length and match before sending", async () => {
    await render("/reset-password", { resetToken: TOKEN });
    await fill("short");
    expect(bodyText()).toContain("Your new password needs at least 7 characters.");
    await fill("a-new-password", "a-different-one");
    expect(bodyText()).toContain("The two passwords don't match.");
    expect(posts("superadmin/resetpassword")).toHaveLength(0);
  });

  test("an expired or already-used reset: says so, and offers to start again", async () => {
    await render("/reset-password", { resetToken: TOKEN });
    serverStub.refuse.POST = refuse(400, "This reset link has expired or has already been used. Request a new code to start again.");
    await fill("a-new-password");
    expect(bodyText()).toContain("This reset has expired or has already been used — each one works once, within 15 minutes of entering your code. Start again to get a new code.");
    expect([...document.querySelectorAll("a")].some((a) => a.textContent === "Start again" && a.getAttribute("href") === "/forgot-password")).toBe(true);
  });
});
