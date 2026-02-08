import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer, Save, Trash2 } from "lucide-react";
import { FormActionButton } from "./ui/FormActionButton";
import { applyPrintFit } from "../utils/printFit";
import "./SpecialCompanyEventsForm.css";

const storageKey = "eventForms.specialCompanyEvents";

type FormState = {
  eventDetails: string;
  eventDate: string;
  location: string;
  preparedByName: string;
  checkedByName: string;
};

const initialState: FormState = {
  eventDetails: "",
  eventDate: "",
  location: "",
  preparedByName: "",
  checkedByName: "",
};

const normalizeSpecialCompanyEventsState = (value: unknown): FormState => {
  if (!value || typeof value !== "object") return initialState;

  const parsed = value as Partial<FormState>;

  return {
    eventDetails: typeof parsed.eventDetails === "string" ? parsed.eventDetails : "",
    eventDate: typeof parsed.eventDate === "string" ? parsed.eventDate : "",
    location: typeof parsed.location === "string" ? parsed.location : "",
    preparedByName: typeof parsed.preparedByName === "string" ? parsed.preparedByName : "",
    checkedByName: typeof parsed.checkedByName === "string" ? parsed.checkedByName : "",
  };
};

type SpecialCompanyEventsFormProps = {
  showBackButton?: boolean;
  embedded?: boolean;
  showToolbar?: boolean;
  onRegisterActions?: (actions: {
    getState: () => unknown;
    setState: (state: unknown) => void;
    resetState: () => void;
  }) => void;
};


function printText(value: string) {
  return value.trim() || "\u00A0";
}

export function SpecialCompanyEventsForm({
  showBackButton = true,
  embedded = false,
  showToolbar = true,
  onRegisterActions,
}: SpecialCompanyEventsFormProps) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>(initialState);

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(formState));
  };

  const handleLoad = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      window.alert("No saved data yet.");
      return;
    }
    try {
      setFormState(normalizeSpecialCompanyEventsState(JSON.parse(saved)));
    } catch {
      window.alert("No saved data yet.");
    }
  };

  const handleClear = () => {
    if (!window.confirm("Clear this form?")) return;
    setFormState(initialState);
    localStorage.removeItem(storageKey);
  };

  const handlePrint = () => {
    applyPrintFit();
    requestAnimationFrame(() => window.print());
  };

  useEffect(() => {
    onRegisterActions?.({
      getState: () => formState,
      setState: (nextState) => setFormState(normalizeSpecialCompanyEventsState(nextState)),
      resetState: () => setFormState(initialState),
    });
  }, [onRegisterActions, formState]);

  return (
    <div className={embedded ? "sce-page" : "sce-page min-h-screen bg-gray-50"}>
      <div className={embedded ? "" : "pt-16"}>
        <div className={embedded ? "" : "max-w-[1440px] mx-auto px-6 py-8"}>
          {showToolbar && (
            <div className="form-toolbar no-print">
              {showBackButton ? (
                <div className="form-toolbar__left">
                  <FormActionButton onClick={() => navigate("/event-forms")} className="form-action-back">
                    <ArrowLeft className="form-btn__icon" />
                    Back to Forms
                  </FormActionButton>
                </div>
              ) : (
                <div />
              )}
              <div className="form-actions no-print">
                <FormActionButton onClick={handleSave}>
                  <Save className="form-btn__icon" />
                  Save
                </FormActionButton>
                <FormActionButton onClick={handleLoad}>
                  <Download className="form-btn__icon" />
                  Load
                </FormActionButton>
                <FormActionButton onClick={handleClear}>
                  <Trash2 className="form-btn__icon" />
                  Clear
                </FormActionButton>
                <FormActionButton onClick={handlePrint}>
                  <Printer className="form-btn__icon" />
                  Print
                </FormActionButton>
              </div>
            </div>
          )}

          <div className="screen-form no-print">
            <div className="sce-screen-head">
              <h1>SPECIAL COMPANY EVENTS</h1>
            </div>

            <div className="sce-top-grid">
              <label className="sce-field">
                <span>Event Details</span>
                <input
                  type="text"
                  value={formState.eventDetails}
                  onChange={(event) => setFormState((prev) => ({ ...prev, eventDetails: event.target.value }))}
                />
              </label>
              <label className="sce-field">
                <span>Event Date</span>
                <input
                  type="date"
                  value={formState.eventDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, eventDate: event.target.value }))}
                />
              </label>
              <label className="sce-field sce-field-full">
                <span>Location/Address</span>
                <input
                  type="text"
                  value={formState.location}
                  onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
            </div>

            <div className="sce-foot-grid">
              <label className="sce-field">
                <span>Prepared by (Name)</span>
                <input
                  type="text"
                  value={formState.preparedByName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, preparedByName: event.target.value }))}
                />
              </label>
              <label className="sce-field">
                <span>Checked by (Name)</span>
                <input
                  type="text"
                  value={formState.checkedByName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, checkedByName: event.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="print-only">
            <div className="print-fit-page">
              <div className="print-root print-fullpage print-fit-content" data-print-fit>
                <div className="sce-print-paper">
              <div className="sce-print-title">
                <div>SPECIAL COMPANY EVENTS</div>
              </div>

              <div className="sce-print-top">
                <div className="sce-print-line">
                  <span className="sce-print-label">Event Details:</span>
                  <span className="sce-print-value">{printText(formState.eventDetails)}</span>
                </div>
                <div className="sce-print-line">
                  <span className="sce-print-label">Event Date:</span>
                  <span className="sce-print-value">{printText(formState.eventDate)}</span>
                </div>
                <div className="sce-print-line">
                  <span className="sce-print-label">Location/Address:</span>
                  <span className="sce-print-value">{printText(formState.location)}</span>
                </div>
              </div>

              <div className="sce-print-footer">
                <div className="sce-print-line">
                  <span className="sce-print-label">Prepared by:</span>
                  <span className="sce-print-value">{printText(formState.preparedByName)}</span>
                </div>
                <div className="sce-print-line">
                  <span className="sce-print-label">Checked by:</span>
                  <span className="sce-print-value">{printText(formState.checkedByName)}</span>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
