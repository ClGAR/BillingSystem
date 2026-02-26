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
  originalPrice: '0.00',
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
  remarks: ''
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
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const { priceAfterDiscount, totalSales } = useMemo(() => {
    const originalPrice = parseNumber(form.originalPrice);
    const quantity = parseNumber(form.quantity);
    const discountRate = parseNumber(form.discount) / 100;
    const oneTimeDiscount = parseNumber(form.oneTimeDiscount);

    const computedPriceAfterDiscount = Math.max(0, originalPrice * (1 - discountRate));
    const computedTotalSales = Math.max(0, quantity * computedPriceAfterDiscount - oneTimeDiscount);

    return {
      priceAfterDiscount: computedPriceAfterDiscount,
      totalSales: computedTotalSales
    };
  }, [form.discount, form.oneTimeDiscount, form.originalPrice, form.quantity]);

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
    <div>
      <h1 className="text-2xl font-semibold mb-6 erp-title-primary">New Sale Entry</h1>

      <div className="erp-card p-6">
        <div className="erp-grid-main">
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold erp-section-title">Transaction Details</h2>
              <div className="space-y-4 mt-4">
                <FormField
                  label="Location"
                  value={form.location}
                  onChange={() => undefined}
                  disabled
                />
                <FormField
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(value) => handleFieldChange('date', value)}
                />
                <FormField
                  label="PO Number"
                  value={form.poNumber}
                  onChange={(value) => handleFieldChange('poNumber', value)}
                />
                <FormField
                  label="Member Name"
                  value={form.memberName}
                  onChange={(value) => handleFieldChange('memberName', value)}
                />
                <FormField
                  label="Username"
                  value={form.username}
                  onChange={(value) => handleFieldChange('username', value)}
                />
                <FormToggle
                  label="New Member?"
                  checked={form.newMember}
                  onChange={(value) => handleFieldChange('newMember', value)}
                />
                <FormSelect
                  label="Member Type"
                  value={form.memberType}
                  onChange={(value) => handleFieldChange('memberType', value)}
                  options={memberTypeOptions}
                />
                <FormSelect
                  label="Package Type"
                  value={form.packageType}
                  onChange={(value) => handleFieldChange('packageType', value)}
                  options={packageTypeOptions}
                />
                <FormSelect
                  label="To Blister?"
                  value={form.toBlister}
                  onChange={(value) => handleFieldChange('toBlister', value)}
                  options={yesNoOptions}
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold erp-section-title">Pricing &amp; Quantity</h3>
              <div className="space-y-4 mt-4">
                <FormField
                  label="Quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(value) => handleFieldChange('quantity', value)}
                  min={0}
                />
                <FormField
                  label="Blister Count"
                  type="number"
                  value={form.blisterCount}
                  onChange={(value) => handleFieldChange('blisterCount', value)}
                  min={0}
                />
                <FormField
                  label="Original Price"
                  value={form.originalPrice}
                  onChange={() => undefined}
                  disabled
                />
                <FormSelect
                  label="Discount"
                  value={form.discount}
                  onChange={(value) => handleFieldChange('discount', value)}
                  options={discountOptions}
                />
                <FormField
                  label="Price After Discount"
                  value={priceAfterDiscount.toFixed(2)}
                  onChange={() => undefined}
                  disabled
                />
                <FormField
                  label="One-Time Discount"
                  type="number"
                  value={form.oneTimeDiscount}
                  onChange={(value) => handleFieldChange('oneTimeDiscount', value)}
                  min={0}
                  step="0.01"
                />

                <div className="erp-surface-soft p-4">
                  <p className="text-sm mb-1 erp-title-primary">Total Sales</p>
                  <p className="font-semibold erp-title-primary" style={{ fontSize: 30, lineHeight: '36px' }}>
                    {currencyFormatter.format(totalSales)}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold erp-section-title">Payment &amp; Inventory</h2>

              <div className="space-y-4 mt-4">
                <h3 className="text-base font-semibold erp-title-primary">Payment Mode</h3>
                <FormSelect
                  label="Mode of Payment"
                  value={form.modeOfPayment}
                  onChange={(value) => handleFieldChange('modeOfPayment', value)}
                  options={paymentModeOptions}
                />
                <FormSelect
                  label="Payment Mode Type"
                  value={form.paymentModeType}
                  onChange={(value) => handleFieldChange('paymentModeType', value)}
                  options={paymentTypeOptions}
                />
                <FormField
                  label="Reference Number"
                  value={form.referenceNumber}
                  onChange={(value) => handleFieldChange('referenceNumber', value)}
                />

                <div className="relative pt-6">
                  <div style={{ borderTop: '1px solid #E5E7EB' }} />
                  <span
                    className="text-sm px-2"
                    style={{
                      background: '#FFFFFF',
                      color: '#6B7280',
                      position: 'absolute',
                      top: '14px',
                      left: '12px'
                    }}
                  >
                    Additional Payment
                  </span>
                </div>

                <FormSelect
                  label="Mode of Payment (2)"
                  value={form.modeOfPayment2}
                  onChange={(value) => handleFieldChange('modeOfPayment2', value)}
                  options={paymentModeOptions}
                />
                <FormSelect
                  label="Payment Mode Type (2)"
                  value={form.paymentModeType2}
                  onChange={(value) => handleFieldChange('paymentModeType2', value)}
                  options={paymentTypeOptions}
                />
                <FormField
                  label="Reference Number (2)"
                  value={form.referenceNumber2}
                  onChange={(value) => handleFieldChange('referenceNumber2', value)}
                />
                <FormField
                  label="Amount (2)"
                  type="number"
                  value={form.amount2}
                  onChange={(value) => handleFieldChange('amount2', value)}
                  min={0}
                  step="0.01"
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold erp-section-title">Inventory Movement</h3>
              <div className="space-y-4 mt-4">
                <FormField
                  label="Released (Bottle)"
                  type="number"
                  value={form.releasedBottle}
                  onChange={(value) => handleFieldChange('releasedBottle', value)}
                  min={0}
                />
                <FormField
                  label="Released (Blister)"
                  type="number"
                  value={form.releasedBlister}
                  onChange={(value) => handleFieldChange('releasedBlister', value)}
                  min={0}
                />
                <FormField
                  label="To Follow (Bottle)"
                  type="number"
                  value={form.toFollowBottle}
                  onChange={(value) => handleFieldChange('toFollowBottle', value)}
                  min={0}
                />
                <FormField
                  label="To Follow (Blister)"
                  type="number"
                  value={form.toFollowBlister}
                  onChange={(value) => handleFieldChange('toFollowBlister', value)}
                  min={0}
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold erp-section-title">Remarks</h3>
              <div className="mt-4">
                <textarea
                  className="erp-textarea"
                  value={form.remarks}
                  onChange={(event) => handleFieldChange('remarks', event.target.value)}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-6 mt-8" style={{ borderTop: '1px solid #E5E7EB' }}>
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
