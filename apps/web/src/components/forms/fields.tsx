"use client";

import type { Option } from "@/lib/options";

const inputCls =
  "w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-white";
const labelCls = "block text-sm font-medium text-[var(--color-navy)] mb-1";
const errCls = "mt-1 text-xs text-red-600";

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errCls}>{message}</p> : null;
}

export function TextField({
  name,
  label,
  required,
  defaultValue,
  placeholder,
  error,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
      <FieldError message={error} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  required,
  defaultValue,
  placeholder,
  error,
  rows = 4,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
      <FieldError message={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  required,
  defaultValue,
  placeholder = "Select…",
  error,
}: {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputCls}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

export function CheckboxGroupField({
  name,
  label,
  options,
  defaultValues = [],
  error,
  columns = 2,
}: {
  name: string;
  label: string;
  options: Option[];
  defaultValues?: string[];
  error?: string;
  columns?: number;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-navy)] hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={defaultValues.includes(o.value)}
              className="accent-[var(--color-gold)]"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
