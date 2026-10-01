import type { ReactNode, SelectHTMLAttributes } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50";

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required ? <span className="ml-0.5 text-accent">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        className={controlClass}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  hint,
  required,
  rows = 5,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      error={error}
      hint={hint}
      required={required}
    >
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        className={controlClass}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  required,
  children,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        className={controlClass}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  name,
  hint,
  defaultChecked,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3">
      <input
        id={name}
        name={name}
        type="checkbox"
        value="true"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-accent focus:ring-2 focus:ring-accent/30"
      />
      <span>
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

export function FileField({
  label,
  name,
  error,
  hint,
  accept,
  required,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  accept?: string;
  required?: boolean;
}) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        required={required}
        aria-invalid={error ? true : undefined}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/25 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </FieldShell>
  );
}
