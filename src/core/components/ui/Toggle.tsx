import { useId, type ReactNode } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <label htmlFor={id} className="cursor-pointer font-bold text-cream">
          {label}
        </label>
        {description && <p className="text-sm text-night-200">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
          checked ? 'bg-gold-300' : 'bg-night-950 ring-1 ring-inset ring-white/20'
        }`}
      >
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
        <span className={`inline-block h-6 w-6 rounded-full shadow transition-transform ${checked ? 'translate-x-7 bg-ink' : 'translate-x-1 bg-night-200'}`} />
      </button>
    </div>
  );
}
