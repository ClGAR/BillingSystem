import React, { useMemo, useState } from "react";

type FormState = {
  event: string;
  date: string;
  poNumber: string;
  memberName: string;
  username: string;
  newMember: "yes" | "no";
  memberType: string;
  packageType: string;
  toBlister: string;
  quantity: string;
  blisterCount: string;
  originalPrice: string;
  discountRate: string;
  oneTimeDiscount: string;
  paymentMode: string;
  paymentModeType: string;
  referenceNumber: string;
  paymentMode2: string;
  paymentModeType2: string;
  referenceNumber2: string;
  paymentAmount2: string;
  releasedBottle: string;
  releasedBlister: string;
  toFollowBottle: string;
  toFollowBlister: string;
  remarks: string;
};

const initialFormState: FormState = {
  event: "",
  date: "",
  poNumber: "",
  memberName: "",
  username: "",
  newMember: "no",
  memberType: "",
  packageType: "",
  toBlister: "",
  quantity: "0",
  blisterCount: "0",
  originalPrice: "0.00",
  discountRate: "0",
  oneTimeDiscount: "0.00",
  paymentMode: "",
  paymentModeType: "",
  referenceNumber: "",
  paymentMode2: "",
  paymentModeType2: "",
  referenceNumber2: "",
  paymentAmount2: "0.00",
  releasedBottle: "0",
  releasedBlister: "0",
  toFollowBottle: "0",
  toFollowBlister: "0",
  remarks: ""
};

const formatCurrency = (value: number) => `₱ ${value.toFixed(2)}`;

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";
const selectClass = inputClass;
const readOnlyClass = `${inputClass} bg-gray-50 text-gray-500`;

export function EncoderForm() {
  const [form, setForm] = useState<FormState>(initialFormState);

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setNewMember = (value: "yes" | "no") => {
    setForm((prev) => ({ ...prev, newMember: value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
  };

  const parsed = (value: string) => {
    const numberValue = parseFloat(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  };

  const totals = useMemo(() => {
    const quantity = parsed(form.quantity);
    const originalPrice = parsed(form.originalPrice);
    const discountRate = parsed(form.discountRate);
    const oneTimeDiscount = parsed(form.oneTimeDiscount);
    const discountAmount = quantity * originalPrice * discountRate;
    const priceAfterDiscount = Math.max(0, originalPrice - originalPrice * discountRate);

    if (originalPrice === 0) {
      return {
        priceAfterDiscount: 0,
        totalSales: 0
      };
    }

    const totalSales = Math.max(
      0,
      quantity * originalPrice - discountAmount - oneTimeDiscount
    );

    return {
      priceAfterDiscount,
      totalSales
    };
  }, [form.quantity, form.originalPrice, form.discountRate, form.oneTimeDiscount]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8 h-full">
            <section>
              <div className="pb-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-600">
                  Transaction Details
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-12 gap-x-6 gap-y-4">
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Event
                  </label>
                  <select
                    name="event"
                    value={form.event}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select event
                    </option>
                    <option value="expo">Expo</option>
                    <option value="onsite">Onsite</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    PO Number
                  </label>
                  <input
                    type="text"
                    name="poNumber"
                    placeholder="Enter PO number"
                    value={form.poNumber}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Member Name
                  </label>
                  <input
                    type="text"
                    name="memberName"
                    placeholder="Enter member name"
                    value={form.memberName}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={form.username}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    New Member?
                  </span>
                  <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNewMember("yes")}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        form.newMember === "yes"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMember("no")}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                        form.newMember === "no"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Member Type
                  </label>
                  <select
                    name="memberType"
                    value={form.memberType}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Package Type
                  </label>
                  <select
                    name="packageType"
                    value={form.packageType}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select package
                    </option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To Blister?
                  </label>
                  <select
                    name="toBlister"
                    value={form.toBlister}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select option
                    </option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="pb-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-600">
                  Pricing &amp; Quantity
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-12 gap-x-6 gap-y-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Blister Count
                  </label>
                  <input
                    type="number"
                    name="blisterCount"
                    value={form.blisterCount}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Original Price
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount
                  </label>
                  <select
                    name="discountRate"
                    value={form.discountRate}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="0">No discount</option>
                    <option value="0.1">10% discount</option>
                    <option value="0.2">20% discount</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price After Discount
                  </label>
                  <input
                    type="number"
                    name="priceAfterDiscount"
                    value={totals.priceAfterDiscount.toFixed(2)}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    One-Time Discount
                  </label>
                  <input
                    type="number"
                    name="oneTimeDiscount"
                    value={form.oneTimeDiscount}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-700">Total Sales</div>
              <div className="mt-2 text-3xl font-semibold text-blue-900">
                {formatCurrency(totals.totalSales)}
              </div>
            </div>

            <div className="mt-auto hidden md:flex items-center gap-3">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                Save Entry
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-md border border-red-300 text-red-600 bg-white hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Clear Form
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <section>
              <div className="pb-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-600">
                  Payment &amp; Inventory
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-12 gap-x-6 gap-y-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mode of Payment
                  </label>
                  <select
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select mode
                    </option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="gcash">GCash</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payment Mode Type
                  </label>
                  <select
                    name="paymentModeType"
                    value={form.paymentModeType}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="full">Full Payment</option>
                    <option value="partial">Partial</option>
                    <option value="installment">Installment</option>
                  </select>
                </div>
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    placeholder="Enter reference number"
                    value={form.referenceNumber}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Additional Payment
              </div>
              <div className="mt-3 grid grid-cols-12 gap-x-6 gap-y-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mode of Payment
                  </label>
                  <select
                    name="paymentMode2"
                    value={form.paymentMode2}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select mode
                    </option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="gcash">GCash</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payment Mode Type
                  </label>
                  <select
                    name="paymentModeType2"
                    value={form.paymentModeType2}
                    onChange={updateField}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="full">Full Payment</option>
                    <option value="partial">Partial</option>
                    <option value="installment">Installment</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber2"
                    placeholder="Enter reference number"
                    value={form.referenceNumber2}
                    onChange={updateField}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="paymentAmount2"
                    value={form.paymentAmount2}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="pb-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-600">
                  Inventory Movement
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-12 gap-x-6 gap-y-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Released (Bottle)
                  </label>
                  <input
                    type="number"
                    name="releasedBottle"
                    value={form.releasedBottle}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Released (Blister)
                  </label>
                  <input
                    type="number"
                    name="releasedBlister"
                    value={form.releasedBlister}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To Follow (Bottle)
                  </label>
                  <input
                    type="number"
                    name="toFollowBottle"
                    value={form.toFollowBottle}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To Follow (Blister)
                  </label>
                  <input
                    type="number"
                    name="toFollowBlister"
                    value={form.toFollowBlister}
                    onChange={updateField}
                    className={inputClass}
                    min={0}
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="pb-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-blue-600">Remarks</h2>
              </div>
              <div className="mt-4">
                <textarea
                  name="remarks"
                  placeholder="Enter any additional remarks or notes..."
                  value={form.remarks}
                  onChange={updateField}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </section>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Save Entry
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-md border border-red-300 text-red-600 bg-white hover:bg-red-50 text-sm font-medium transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
