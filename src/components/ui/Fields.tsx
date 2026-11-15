import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  help?: ReactNode;
  error?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  className?: string;
}

function FieldShell({ label, help, error, children, className = '' }: FieldShellProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const describedBy = help || error ? helpId : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children(id, describedBy)}
      {(error || help) && (
        <p id={helpId} className={error ? 'mt-1 text-xs font-bold text-rose-300' : 'field-help'}>
          {error ?? help}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: ReactNode;
  error?: string;
  className?: string;
};

export function TextField({ label, value, onChange, help, error, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} help={help} error={error} className={className}>
      {(id, describedBy) => (
        <input id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...rest} />
      )}
    </FieldShell>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  help?: ReactNode;
  suffix?: string;
  className?: string;
};

/** Commits only valid, clamped numbers; typing freely in between is allowed. */
export function NumberField({ label, value, onChange, min, max, step = 1, help, suffix, className }: NumberFieldProps) {
  return (
    <FieldShell label={label} help={help} className={className}>
      {(id, describedBy) => (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            className="input"
            min={min}
            max={max}
            step={step}
            defaultValue={value}
            key={value}
            aria-describedby={describedBy}
            onBlur={(e) => {
              const n = Number(e.target.value);
              const clamped = Number.isFinite(n) && e.target.value.trim() !== '' ? Math.min(max, Math.max(min, Math.round(n / step) * step)) : value;
              e.target.value = String(clamped);
              if (clamped !== value) onChange(clamped);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
          {suffix && <span className="shrink-0 text-sm text-night-200">{suffix}</span>}
        </div>
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  help?: ReactNode;
  className?: string;
};

export function SelectField({ label, value, onChange, options, help, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} help={help} className={className}>
      {(id, describedBy) => (
        <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: ReactNode;
  error?: string;
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>;

export function TextArea({ label, value, onChange, help, error, className, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} help={help} error={error} className={className}>
      {(id, describedBy) => (
        <textarea id={id} className="input min-h-[5rem] resize-y" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...rest} />
      )}
    </FieldShell>
  );
}
