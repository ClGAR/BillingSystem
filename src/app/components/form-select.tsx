import React from 'react';

type SelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
};

export function FormSelect({ label, value, onChange, options }: FormSelectProps) {
  return (
    <label className="block">
      <span className="erp-input-label">{label}</span>
      <select
        className="erp-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
