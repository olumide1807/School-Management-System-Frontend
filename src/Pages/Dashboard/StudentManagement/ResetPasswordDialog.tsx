import { useState } from "react";
import { Button, Dialog } from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";
import { toast } from "react-toastify";

import SERVER from "../../../Utils/server";
import { toastOptions } from "../../../Utils/toastOptions";

export type ResetTarget = {
  kind: "student" | "parent";
  id: string;
  name: string; // full name, for the headings
  shortName: string; // in running text: "Tobi" for a student, "Mrs Ade" for a parent
};

// Admin-triggered password reset for a student or parent.
//
// Two steps, both deliberate: a confirmation that names the person (a
// stray menu click must not lock someone out), then the new password,
// shown once. The password lives only in this component's state — not in
// a toast, the query cache, the console or storage — and is dropped when
// the admin clicks Done. Backdrop clicks and Escape are ignored so it
// can't vanish while someone is still writing it down.
export default function ResetPasswordDialog({
  target,
  onClose,
}: {
  target: ResetTarget | null;
  onClose: () => void;
}) {
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setPassword(null);
    setCopied(false);
    onClose();
  };

  const confirm = async () => {
    if (!target || resetting) return;
    setResetting(true);
    try {
      const res = await SERVER.put(`${target.kind}/${target.id}/reset-password`);
      const next = res?.data?.data?.newPassword;
      if (!next) throw new Error("No password returned");
      setPassword(next);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "Couldn't reset the password. Nothing was changed — please try again.",
        toastOptions,
      );
    } finally {
      setResetting(false);
    }
  };

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Clipboard is unavailable outside https/localhost; the password is
      // still on screen to read or type
      toast.error("Couldn't copy — please write it down instead.", toastOptions);
    }
  };

  if (!target) return null;

  const shortName = target.shortName || target.name;

  // ---- Step 2: the new password, shown once ----
  if (password) {
    return (
      <Dialog
        open
        // Only "Done" closes this — not the backdrop, not Escape
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <div className="p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-secondary">
              New password for {target.name}
            </h2>
            <p className="mt-1 text-sm text-gray-1">
              Give this to {shortName} now.
            </p>
          </div>

          <div className="rounded-[10px] bg-bg-7 px-4 py-5 text-center">
            <p
              className="font-mono text-[32px] leading-none font-semibold text-black tracking-[0.15em] select-all break-all"
              aria-label="New password"
            >
              {password}
            </p>
          </div>

          <Button
            variant="outlined"
            color="tertiary"
            onClick={copy}
            startIcon={copied ? <Check /> : <ContentCopy />}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            {copied ? "Copied" : "Copy password"}
          </Button>

          <div className="text-sm text-text-pry leading-relaxed flex flex-col gap-2">
            <p>
              <span className="font-semibold">
                This password won&apos;t be shown again.
              </span>{" "}
              Copy it or write it down before you close this.
            </p>
            <p>
              {shortName} will be asked to change it the first time they sign
              in.
            </p>
          </div>

          <Button
            variant="contained"
            color="tertiary"
            onClick={close}
            sx={{ color: "white", borderRadius: "10px", textTransform: "none" }}
          >
            Done
          </Button>
        </div>
      </Dialog>
    );
  }

  // ---- Step 1: confirm ----
  return (
    <Dialog
      open
      onClose={() => {
        if (!resetting) close();
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <div className="p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-secondary">
            Reset {target.name}&apos;s password?
          </h2>
          <p className="mt-2 text-sm text-gray-1 leading-relaxed">
            This replaces {shortName}&apos;s current password straight away.
            Their old password will stop working, and they&apos;ll need the new
            one from you to sign in.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outlined"
            color="tertiary"
            onClick={close}
            disabled={resetting}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirm}
            disabled={resetting}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            {resetting ? "Resetting…" : "Reset password"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
