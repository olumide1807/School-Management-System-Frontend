import axios from "axios";

// Telling "the server said no" apart from "we never got a proper answer".
// A wrong password and an unreachable API need different messages: one
// sends people to check what they typed, the other to try again later.

// Requests that a person is waiting on (sign-in, change password) give up
// after this long, so a hung API shows a message instead of spinning.
export const INTERACTIVE_TIMEOUT_MS = 20000;

export const UNREACHABLE_MESSAGE =
  "We couldn't reach the school portal. Please try again shortly.";

// True when the request failed for reasons that aren't about what the
// person entered: no response at all (offline, DNS, CORS, timeout) or a
// server-side error (5xx).
export const isUnreachable = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return false;
  if (!err.response) return true;
  return err.response.status >= 500;
};

// The HTTP status the server answered with, if it answered
export const statusOf = (err: unknown): number | null =>
  axios.isAxiosError(err) && err.response ? err.response.status : null;

// The server's own message for a 4xx, if it sent one
export const serverMessage = (err: unknown): string | null => {
  if (!axios.isAxiosError(err)) return null;
  const msg = (err.response?.data as any)?.error;
  return typeof msg === "string" && msg.trim() ? msg : null;
};
