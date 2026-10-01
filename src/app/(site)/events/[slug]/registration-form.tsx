"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerForEvent, type RegisterState } from "./actions";

const initialState: RegisterState = { status: "idle" };

const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30";

export function RegistrationForm({
  eventSlug,
  isFull,
}: {
  eventSlug: string;
  isFull: boolean;
}) {
  const [state, formAction] = useActionState(registerForEvent, initialState);

  if (state.status === "success" && state.pass) {
    const waitlisted = state.pass.status === "WAITLISTED";
    return (
      <div className="mt-3 space-y-4">
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>
            {state.pass.alreadyRegistered
              ? "You're already registered — here's your pass."
              : waitlisted
                ? "You're on the waitlist. Save your pass; we'll confirm if a spot opens."
                : "You're registered! Save your digital pass below."}
          </span>
        </div>
        <Link
          href={state.pass.url}
          className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5 text-accent transition-colors hover:bg-accent/15"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <Ticket size={17} /> View your digital pass
          </span>
          <ArrowRight size={16} />
        </Link>
        <p className="text-xs text-slate-500">
          Bookmark or screenshot your pass — you&apos;ll show its QR code at the
          door.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-3" noValidate>
      <input type="hidden" name="eventSlug" value={eventSlug} />

      {isFull ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
          This event is at capacity. You can still register for the waitlist —
          we&apos;ll be in touch if a place opens up.
        </p>
      ) : null}

      <Field
        label="Full name"
        htmlFor="participantName"
        error={state.errors?.participantName}
      >
        <input
          id="participantName"
          name="participantName"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          className={inputClass}
        />
      </Field>
      <Field
        label="Email"
        htmlFor="participantEmail"
        error={state.errors?.participantEmail}
      >
        <input
          id="participantEmail"
          name="participantEmail"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>
      <Field
        label="Phone (optional)"
        htmlFor="participantPhone"
        error={state.errors?.participantPhone}
      >
        <input
          id="participantPhone"
          name="participantPhone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 …"
          className={inputClass}
        />
      </Field>

      {/* Honeypot — hidden from users, catches bots. */}
      <div aria-hidden className="hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
          {state.message}
        </p>
      ) : null}

      <SubmitButton isFull={isFull} />
      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        We use your details only to manage attendance. They&apos;re never shown
        publicly or embedded in your pass QR.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-slate-400"
      >
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ isFull }: { isFull: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm" className="w-full">
      {pending
        ? "Submitting…"
        : isFull
          ? "Join the waitlist"
          : "Register — get pass"}
    </Button>
  );
}
