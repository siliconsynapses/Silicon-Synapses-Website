"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ScanLine,
} from "lucide-react";
import { formatDateTime } from "@/lib/datetime";
import { checkInFromForm, type CheckInState } from "./actions";

const initialState: CheckInState = { status: "idle" };

/**
 * Door check-in console. Staff scan an attendee's QR with any phone camera to
 * open the pass, then paste its link here — or type the token. The server
 * verifies the opaque token and records the check-in; re-submitting is safe.
 */
export function CheckInConsole() {
  const [state, formAction] = useActionState(checkInFromForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the field after a successful check-in so the next scan starts clean.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="max-w-xl space-y-5">
      <form
        ref={formRef}
        action={formAction}
        className="rounded-2xl border border-white/10 bg-surface/40 p-5"
      >
        <label
          htmlFor="token"
          className="block text-sm font-medium text-slate-300"
        >
          Pass link or token
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="token"
            name="token"
            type="text"
            autoComplete="off"
            autoFocus
            placeholder="https://…/pass/… or paste the token"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <SubmitButton />
        </div>
      </form>

      {state.status === "error" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}

      {state.status === "success" && state.result ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.08] px-5 py-5">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 size={18} />
            <span className="text-sm font-semibold">
              {state.result.alreadyCheckedIn
                ? "Already checked in"
                : "Checked in"}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">
            {state.result.participantName}
          </p>
          <p className="text-sm text-slate-300">{state.result.eventTitle}</p>
          <p className="mt-2 text-xs text-slate-400">
            {state.result.alreadyCheckedIn ? "Checked in at " : "Recorded at "}
            {formatDateTime(state.result.checkedInAt)}
            {state.result.regStatus === "WAITLISTED"
              ? " · was on the waitlist"
              : ""}
          </p>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-slate-500">
        Scan the attendee&apos;s QR with your phone camera to open their pass,
        then paste its link above — or type the token. Check-in is verified on
        the server; the QR only carries an opaque token, never personal details.
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-accent/30 bg-accent/15 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ScanLine size={16} />
      )}
      Check in
    </button>
  );
}
