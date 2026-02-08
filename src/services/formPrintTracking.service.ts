import { supabase } from "../lib/supabaseClient";

export type FormType = "ER" | "SC" | "PI";

export type PrintSubmission = {
  id: string;
  reference_no: string;
};

type UpsertParams = {
  submissionId?: string | null;
  formType: FormType;
  payload: Record<string, unknown>;
};

export async function upsertSubmissionForPrint({ submissionId, formType, payload }: UpsertParams) {
  if (submissionId) {
    const { data, error } = await supabase
      .from("form_submissions")
      .update({ payload })
      .eq("id", submissionId)
      .select("id, reference_no")
      .single();

    if (error || !data) {
      return { data: null as PrintSubmission | null, error: error?.message || "Failed to update submission." };
    }

    return { data: { id: data.id, reference_no: data.reference_no }, error: null as string | null };
  }

  const { data: referenceNo, error: rpcError } = await supabase.rpc("get_next_reference_no", {
    form_type: formType,
  });

  if (rpcError || !referenceNo) {
    return {
      data: null as PrintSubmission | null,
      error: rpcError?.message || "Failed to generate reference number.",
    };
  }

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({ form_type: formType, reference_no: referenceNo, payload })
    .select("id, reference_no")
    .single();

  if (error || !data) {
    return { data: null as PrintSubmission | null, error: error?.message || "Failed to create submission." };
  }

  return { data: { id: data.id, reference_no: data.reference_no }, error: null as string | null };
}

type LogParams = {
  submissionId: string;
  formType: FormType;
  referenceNo: string;
};

export async function logPrint({ submissionId, formType, referenceNo }: LogParams) {
  const { error } = await supabase.from("print_logs").insert({
    submission_id: submissionId,
    form_type: formType,
    reference_no: referenceNo,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null as string | null };
}
