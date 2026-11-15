import { Check } from 'lucide-react';
import type { TeamColorId } from '../../types';
import { TEAM_COLOR_IDS, TEAM_COLORS } from '../../engine/defaults';

interface ColorPickerProps {
  label: string;
  value: TeamColorId;
  onChange: (color: TeamColorId) => void;
  disabledColor?: TeamColorId;
}

export function ColorPicker({ label, value, onChange, disabledColor }: ColorPickerProps) {
  return (
    <fieldset>
      <legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLOR_IDS.map((id) => {
          const color = TEAM_COLORS[id];
          const selected = id === value;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              aria-label={`${color.label}${id === disabledColor ? ' (used by the other team)' : ''}`}
              title={color.label}
              disabled={id === disabledColor}
              onClick={() => onChange(id)}
              className={`grid h-10 w-10 place-items-center rounded-full ring-offset-2 ring-offset-night-800 transition disabled:opacity-25 ${selected ? 'ring-4 ring-cream' : ''}`}
              style={{ background: color.hex }}
            >
              {selected && <Check aria-hidden className="h-5 w-5" style={{ color: color.ink }} />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
