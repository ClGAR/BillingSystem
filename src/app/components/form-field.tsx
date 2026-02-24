import React from 'react';

type FormFieldProps = {
  label: string;
  type?: 'text' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  step?: number | string;
};

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  step
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="erp-input-label">{label}</span>
      <input
        className="erp-input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
      />
    </label>
  );
}
