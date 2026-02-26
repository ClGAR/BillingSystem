import React, { useMemo, useState } from 'react';
import { FormField } from './form-field';
import { FormSelect } from './form-select';
import { FormToggle } from './form-toggle';
import { supabase } from '../../lib/supabaseClient';

type EncoderFormState = {
  location: string;
  date: string;
  poNumber: string;
  memberName: string;
  username: string;
  newMember: boolean;
  memberType: string;
  packageType: string;
  toBlister: string;
  quantity: string;
  blisterCount: string;
  originalPrice: string;
  discount: string;
  oneTimeDiscount: string;
  modeOfPayment: string;
  paymentModeType: string;
  referenceNumber: string;
  modeOfPayment2: string;
  paymentModeType2: string;
  referenceNumber2: string;
  amount2: string;
  releasedBottle: string;
  releasedBlister: string;
  toFollowBottle: string;
  toFollowBlister: string;
  remarks: string;
  received_by: string;
  collected_by: string;
};

const DEFAULT_LOCATION = 'Davao Office';

const initialState: EncoderFormState = {
  location: DEFAULT_LOCATION,
  date: '',
  poNumber: '',
  memberName: '',
  username: '',
  newMember: false,
  memberType: '',
  packageType: '',
  toBlister: '',
  quantity: '',
  blisterCount: '',
  originalPrice: '0',
  discount: '0',
  oneTimeDiscount: '',
  modeOfPayment: '',
  paymentModeType: '',
  referenceNumber: '',
  modeOfPayment2: '',
  paymentModeType2: '',
  referenceNumber2: '',
  amount2: '',
  releasedBottle: '',
  releasedBlister: '',
  toFollowBottle: '',
  toFollowBlister: '',
  remarks: '',
  received_by: '',
  collected_by: ''
};

const memberTypeOptions = [
  { label: 'Select type', value: '' },
  { label: 'Distributor', value: 'Distributor' },
  { label: 'Mobile Stockist', value: 'Mobile Stockist' },
  { label: 'City Stockist', value: 'City Stockist' },
  { label: 'Center', value: 'Center' },
  { label: 'Non-member', value: 'Non-member' }
];

const packageTypeOptions = [
  { label: 'Select package', value: '' },
  { label: 'Silver (1 bottle)', value: 'Silver (1 bottle)' },
  { label: 'Gold (3 bottles)', value: 'Gold (3 bottles)' },
  { label: 'Platinum (10 bottles)', value: 'Platinum (10 bottles)' },
  { label: 'Retail (1 bottle)', value: 'Retail (1 bottle)' },
  { label: 'Blister (1 blister pack)', value: 'Blister (1 blister pack)' }
];

const PACKAGE_PRICE_MAP: Record<string, number> = {
  'Silver (1 bottle)': 3500,
  'Gold (3 bottles)': 10500,
  'Platinum (10 bottles)': 35000,
  'Retail (1 bottle)': 2280,
  'Blister (1 blister pack)': 779
};

const yesNoOptions = [
  { label: 'Select option', value: '' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

const paymentModeOptions = [
  { label: 'Select mode', value: '' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank-transfer' },
  { label: 'E-Wallet', value: 'e-wallet' },
  { label: 'Cheque', value: 'cheque' }
];

const paymentTypeOptions = [
  { label: 'Select type', value: '' },
  { label: 'Maya', value: 'maya' },
  { label: 'GCash', value: 'gcash' },
  { label: 'BDO', value: 'bdo' },
  { label: 'BPI', value: 'bpi' }
];

const discountOptions = [
  { label: 'No discount', value: '0' },
  { label: '5%', value: '5' },
  { label: '10%', value: '10' },
  { label: '15%', value: '15' },
  { label: '20%', value: '20' }
];

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

function parseNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeOriginalPrice(packageType: string, quantity: string, blisterCount: string): number {
  const unitPrice = PACKAGE_PRICE_MAP[packageType] || 0;
  const count =
    packageType === 'Blister (1 blister pack)' ? parseNumber(blisterCount) : parseNumber(quantity);
  return Math.max(0, unitPrice * count);
}

function isMissingColumnError(error: { message?: string; code?: string } | null, column: string): boolean {
  if (!error) {
    return false;
  }

  const normalized = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  const columnName = column.toLowerCase();
  return (
    normalized.includes(columnName) &&
    (normalized.includes('does not exist') || normalized.includes('could not find'))
  );
}

export function EncoderPage() {
  const [form, setForm] = useState<EncoderFormState>(initialState);

  const handleFieldChange = (field: keyof EncoderFormState, value: string | boolean) => {
    setForm((previous) => {
      const nextForm = {
        ...previous,
        [field]: value
      } as EncoderFormState;

      if (field === 'packageType' || field === 'quantity' || field === 'blisterCount') {
        const nextOriginalPrice = computeOriginalPrice(
          nextForm.packageType,
          nextForm.quantity,
          nextForm.blisterCount
        );
        nextForm.originalPrice = nextOriginalPrice.toFixed(2);
      }

      return nextForm;
    });
  };

  const { priceAfterDiscount, totalSales } = useMemo(() => {
    const originalPrice = parseNumber(form.originalPrice);
    const discountRate = parseNumber(form.discount) / 100;
    const oneTimeDiscount = parseNumber(form.oneTimeDiscount);

    const discountedPrice = Math.max(0, originalPrice * (1 - discountRate));
    const computedPriceAfterDiscount = Math.max(0, discountedPrice - oneTimeDiscount);
    const computedTotalSales = computedPriceAfterDiscount;

    return {
      priceAfterDiscount: computedPriceAfterDiscount,
      totalSales: computedTotalSales
    };
  }, [form.discount, form.oneTimeDiscount, form.originalPrice]);

  const saveEntry = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      window.alert(`Failed to get current user: ${authError.message}`);
      return;
    }

    const toBlisterValue = form.toBlister.toLowerCase() === 'yes';

    const locationValue = form.location || DEFAULT_LOCATION;

    const baseEntryPayload: Record<string, unknown> = {
      sale_date: form.date || null,
      po_number: form.poNumber || null,
      member_name: form.memberName || null,
      username: form.username || null,
      is_new_member: Boolean(form.newMember),
      member_type: form.memberType || null,
      package_type: form.packageType || null,
      to_blister: toBlisterValue,
      quantity: parseNumber(form.quantity),
      blister_count: parseNumber(form.blisterCount),
      original_price: parseNumber(form.originalPrice),
      discount_percent: parseNumber(form.discount),
      price_after_discount: priceAfterDiscount,
      one_time_discount: parseNumber(form.oneTimeDiscount),
      total_sales: totalSales,
      remarks: form.remarks || null,
      created_by: authData.user?.id ?? null
    };

    const { error: locationProbeError } = await supabase.from('sales_entries').select('location').limit(1);
    const locationFieldCandidates: Array<'location' | 'event'> = locationProbeError
      ? ['event', 'location']
      : ['location', 'event'];

    let entry: { id: string | number } | null = null;
    let entryErrorMessage = 'Unknown error.';

    for (const locationField of locationFieldCandidates) {
      const entryPayload: Record<string, unknown> = {
        ...baseEntryPayload,
        [locationField]: locationValue
      };

      const { data: insertedEntry, error: entryError } = await supabase
        .from('sales_entries')
        .insert(entryPayload)
        .select()
        .single();

      if (!entryError && insertedEntry?.id) {
        entry = insertedEntry;
        break;
      }

      entryErrorMessage = entryError?.message ?? 'Unknown error.';
      if (!isMissingColumnError(entryError, locationField)) {
        break;
      }
    }

    if (!entry?.id) {
      window.alert(`Failed to save entry: ${entryErrorMessage}`);
      return;
    }

    console.log('Inserted sales_entries id:', entry.id);

    const warnings: string[] = [];

    const firstPaymentAmount = totalSales;
    const secondPaymentAmount = parseNumber(form.amount2);
    const paymentRows: Array<{
      sale_entry_id: string;
      payment_no: number;
      mode: string | null;
      mode_type: string | null;
      reference_no: string | null;
      amount: number;
    }> = [];

    if (form.modeOfPayment || firstPaymentAmount > 0) {
      paymentRows.push({
        sale_entry_id: String(entry.id),
        payment_no: 1,
        mode: form.modeOfPayment || null,
        mode_type: form.paymentModeType || null,
        reference_no: form.referenceNumber || null,
        amount: firstPaymentAmount
      });
    }

    if (form.modeOfPayment2 || secondPaymentAmount > 0) {
      paymentRows.push({
        sale_entry_id: String(entry.id),
        payment_no: 2,
        mode: form.modeOfPayment2 || null,
        mode_type: form.paymentModeType2 || null,
        reference_no: form.referenceNumber2 || null,
        amount: secondPaymentAmount
      });
    }

    if (paymentRows.length > 0) {
      const { data: insertedPayments, error: paymentsError } = await supabase
        .from('sales_entry_payments')
        .insert(paymentRows)
        .select();

      if (paymentsError) {
        warnings.push(`Failed to save payments: ${paymentsError.message}`);
      }
      console.log('Payments inserted:', insertedPayments ?? []);
    } else {
      console.log('Payments inserted:', []);
    }

    const inventoryPayload = {
      sale_entry_id: String(entry.id),
      released_bottle: parseNumber(form.releasedBottle),
      released_blister: parseNumber(form.releasedBlister),
      to_follow_bottle: parseNumber(form.toFollowBottle),
      to_follow_blister: parseNumber(form.toFollowBlister)
    };
    const hasInventoryData =
      inventoryPayload.released_bottle > 0 ||
      inventoryPayload.released_blister > 0 ||
      inventoryPayload.to_follow_bottle > 0 ||
      inventoryPayload.to_follow_blister > 0;

    if (hasInventoryData) {
      const { data: insertedInventory, error: inventoryError } = await supabase
        .from('sales_entry_inventory')
        .insert(inventoryPayload)
        .select();

      if (inventoryError) {
        warnings.push(`Failed to save inventory: ${inventoryError.message}`);
      }
      console.log('Inventory inserted:', insertedInventory ?? []);
    } else {
      console.log('Inventory inserted:', []);
    }

    if (warnings.length > 0) {
      window.alert(`Entry saved, but some related records failed:\n${warnings.join('\n')}`);
      return;
    }

    window.alert('Entry saved successfully!');
  };

  const clearForm = () => {
    setForm(initialState);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">New Sale Entry</h1>

      <div className="mx-auto w-full max-w-7xl">
        <div className="encoder-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div className="lg:col-span-1">
            <FormField label="Location" value={form.location} onChange={() => undefined} disabled />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Date"
              type="date"
              value={form.date}
              onChange={(value) => handleFieldChange('date', value)}
            />
          </div>
          <div className="lg:col-span-2 encoder-col-2">
            <FormField
              label="POF/PO Number"
              value={form.poNumber}
              onChange={(value) => handleFieldChange('poNumber', value)}
            />
          </div>

          <div className="lg:col-span-2 encoder-col-2">
            <FormField
              label="Member Name"
              value={form.memberName}
              onChange={(value) => handleFieldChange('memberName', value)}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Username"
              value={form.username}
              onChange={(value) => handleFieldChange('username', value)}
            />
          </div>
          <div className="lg:col-span-1">
            <FormToggle
              label="New Member?"
              checked={form.newMember}
              onChange={(value) => handleFieldChange('newMember', value)}
            />
          </div>

          <div className="lg:col-span-1">
            <FormSelect
              label="Member Type"
              value={form.memberType}
              onChange={(value) => handleFieldChange('memberType', value)}
              options={memberTypeOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormSelect
              label="Package Type"
              value={form.packageType}
              onChange={(value) => handleFieldChange('packageType', value)}
              options={packageTypeOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormSelect
              label="To Blister?"
              value={form.toBlister}
              onChange={(value) => handleFieldChange('toBlister', value)}
              options={yesNoOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Original Price"
              value={form.originalPrice}
              onChange={() => undefined}
              disabled
            />
          </div>

          <div className="lg:col-span-1">
            <FormField
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={(value) => handleFieldChange('quantity', value)}
              min={0}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Blister Count"
              type="number"
              value={form.blisterCount}
              onChange={(value) => handleFieldChange('blisterCount', value)}
              min={0}
            />
          </div>
          <div className="lg:col-span-1">
            <FormSelect
              label="Discount"
              value={form.discount}
              onChange={(value) => handleFieldChange('discount', value)}
              options={discountOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Price After Discount"
              value={priceAfterDiscount.toFixed(2)}
              onChange={() => undefined}
              disabled
            />
          </div>

          <div className="lg:col-span-1">
            <FormField
              label="One-Time Discount"
              type="number"
              value={form.oneTimeDiscount}
              onChange={(value) => handleFieldChange('oneTimeDiscount', value)}
              min={0}
              step="0.01"
            />
          </div>
          <div className="lg:col-span-3 encoder-col-3">
            <FormField
              label="Total Sales"
              value={currencyFormatter.format(totalSales)}
              onChange={() => undefined}
              disabled
            />
          </div>

          <div className="lg:col-span-1">
            <FormSelect
              label="Mode of Payment"
              value={form.modeOfPayment}
              onChange={(value) => handleFieldChange('modeOfPayment', value)}
              options={paymentModeOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormSelect
              label="Payment Mode Type"
              value={form.paymentModeType}
              onChange={(value) => handleFieldChange('paymentModeType', value)}
              options={paymentTypeOptions}
            />
          </div>
          <div className="lg:col-span-2 encoder-col-2">
            <FormField
              label="Reference Number"
              value={form.referenceNumber}
              onChange={(value) => handleFieldChange('referenceNumber', value)}
            />
          </div>

          <div className="lg:col-span-1">
            <FormSelect
              label="Mode of Payment (2)"
              value={form.modeOfPayment2}
              onChange={(value) => handleFieldChange('modeOfPayment2', value)}
              options={paymentModeOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormSelect
              label="Payment Mode Type (2)"
              value={form.paymentModeType2}
              onChange={(value) => handleFieldChange('paymentModeType2', value)}
              options={paymentTypeOptions}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Reference Number (2)"
              value={form.referenceNumber2}
              onChange={(value) => handleFieldChange('referenceNumber2', value)}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Amount (2)"
              type="number"
              value={form.amount2}
              onChange={(value) => handleFieldChange('amount2', value)}
              min={0}
              step="0.01"
            />
          </div>

          <div className="lg:col-span-1">
            <FormField
              label="Released (Bottle)"
              type="number"
              value={form.releasedBottle}
              onChange={(value) => handleFieldChange('releasedBottle', value)}
              min={0}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="Released (Blister)"
              type="number"
              value={form.releasedBlister}
              onChange={(value) => handleFieldChange('releasedBlister', value)}
              min={0}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="To Follow (Bottle)"
              type="number"
              value={form.toFollowBottle}
              onChange={(value) => handleFieldChange('toFollowBottle', value)}
              min={0}
            />
          </div>
          <div className="lg:col-span-1">
            <FormField
              label="To Follow (Blister)"
              type="number"
              value={form.toFollowBlister}
              onChange={(value) => handleFieldChange('toFollowBlister', value)}
              min={0}
            />
          </div>

          <div className="lg:col-span-4 encoder-col-4">
            <label className="block">
              <span className="erp-input-label">Remarks</span>
              <textarea
                className="erp-textarea min-h-[80px]"
                value={form.remarks}
                onChange={(event) => handleFieldChange('remarks', event.target.value)}
              />
            </label>
          </div>

          <div className="lg:col-span-2 encoder-col-2">
            <FormField
              label="Received By"
              value={form.received_by}
              onChange={(value) => handleFieldChange('received_by', value)}
            />
          </div>
          <div className="lg:col-span-2 encoder-col-2">
            <FormField
              label="Collected By"
              value={form.collected_by}
              onChange={(value) => handleFieldChange('collected_by', value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" className="erp-btn-primary" onClick={saveEntry}>
            Save Entry
          </button>
          <button type="button" className="erp-btn-danger" onClick={clearForm}>
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}
