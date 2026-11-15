import { t } from '../../i18n/i18n';

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hideLabel?: boolean;
}

export function Segmented<T extends string>({ label, value, options, onChange, hideLabel }: SegmentedProps<T>) {
  return (
    <div>
      <p className={hideLabel ? 'sr-only' : 'field-label'} id={`seg-${label.replace(/\s+/g, '-')}`}>
        {t(label)}
      </p>
      <div className="segmented" role="group" aria-labelledby={`seg-${label.replace(/\s+/g, '-')}`}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
            {t(o.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
