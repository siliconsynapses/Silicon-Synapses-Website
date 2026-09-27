"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUERY_TYPES, QUERY_TYPE_LABELS } from "@/lib/validations/query";
import { cn } from "@/lib/utils";
import { submitQuery, type QueryFormState } from "./actions";

const initialState: QueryFormState = { status: "idle" };

const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/30";

export function ContactForm() {
  const [state, formAction] = useActionState(submitQuery, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">
          I want to send a…
        </legend>
        <div className="flex flex-wrap gap-2">
          {QUERY_TYPES.map((type, index) => (
            <label key={type} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-sm text-slate-300 transition-colors hover:border-white/20 peer-checked:border-accent/40 peer-checked:bg-accent/10 peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                {QUERY_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={state.errors?.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" error={state.errors?.subject}>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="What's this about?"
          className={inputClass}
        />
      </Field>

      <Field label="Message" htmlFor="message" error={state.errors?.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Write your message…"
          className={cn(inputClass, "h-auto resize-y py-3 leading-relaxed")}
        />
      </Field>

      {/* Honeypot — hidden from users, catches bots. */}
      <div aria-hidden className="hidden">
        <label>
          Company
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {state.status === "success" ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
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
        className="mb-1.5 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        "Sending…"
      ) : (
        <>
          Send message
          <Send size={16} />
        </>
      )}
    </Button>
  );
}
