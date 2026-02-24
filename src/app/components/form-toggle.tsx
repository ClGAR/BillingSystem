import React from 'react';

type FormToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function FormToggle({ label, checked, onChange }: FormToggleProps) {
  return (
    <div>
      <span className="erp-input-label">{label}</span>
      <div className="erp-toggle-wrap">
        <button
          type="button"
          className={`erp-toggle-btn ${checked ? 'active' : ''}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={`erp-toggle-btn ${checked ? '' : 'active'}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}
