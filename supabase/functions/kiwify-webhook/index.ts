// Kiwify webhook handler — activate/renew subscription based on payment events
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("KIWIFY_WEBHOOK_SECRET");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Map Kiwify order status -> internal event_type
function mapEvent(status: string): { event: string; activate: boolean } {
  const s = (status || "").toLowerCase();
  if (s.includes("approved") || s.includes("paid")) return { event: "purchase", activate: true };
  if (s.includes("renew")) return { event: "renewal", activate: true };
  if (s.includes("refund") || s.includes("chargeback")) return { event: "refund", activate: false };
  if (s.includes("cancel")) return { event: "cancellation", activate: false };
  return { event: s || "unknown", activate: false };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Optional shared-secret check (Kiwify lets you append ?secret=... to the webhook URL)
  if (WEBHOOK_SECRET) {
    const url = new URL(req.url);
    const provided = url.searchParams.get("secret") || req.headers.get("x-kiwify-signature");
    if (provided !== WEBHOOK_SECRET) {
      return json({ error: "Invalid webhook secret" }, 401);
    }
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Kiwify payload normalization (defensive — payload shape varies by event)
  const orderStatus = payload.order_status || payload.status || payload.webhook_event_type || "";
  const customerEmail =
    payload.Customer?.email || payload.customer?.email || payload.buyer?.email || payload.email;
  const productId =
    payload.Product?.product_id || payload.product?.id || payload.product_id || payload.product?.product_id;
  const orderId = payload.order_id || payload.order_ref || payload.id;
  const amountCents = Math.round(((payload.Commissions?.charge_amount ?? payload.amount ?? 0) as number) * 100);

  if (!customerEmail) return json({ error: "Missing customer email" }, 400);

  const { event, activate } = mapEvent(orderStatus);

  // Find tenant via user email
  const { data: userRow, error: uErr } = await admin
    .from("users")
    .select("tenant_id")
    .eq("email", customerEmail)
    .maybeSingle();

  if (uErr) return json({ error: uErr.message }, 500);
  if (!userRow?.tenant_id) {
    // Log unmatched webhook for later reconciliation
    await admin.from("subscription_events").insert({
      event_type: event,
      source: "kiwify",
      amount_cents: amountCents,
      payload: { ...payload, _note: "no tenant matched", _email: customerEmail },
    });
    return json({ ok: true, matched: false, message: "No tenant matched email" });
  }

  const tenantId = userRow.tenant_id;

  // Resolve plan from product mapping
  let planRow: any = null;
  if (productId) {
    const { data } = await admin
      .from("plans")
      .select("id, name, max_channels, max_users")
      .eq("kiwify_product_id", String(productId))
      .maybeSingle();
    planRow = data;
  }

  // Find existing subscription
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, current_period_end")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let subscriptionId = existing?.id ?? null;

  if (activate) {
    // Extend 30 days from later of (now, current_period_end)
    const base = existing?.current_period_end && new Date(existing.current_period_end) > new Date()
      ? new Date(existing.current_period_end)
      : new Date();
    const newEnd = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

    const update: Record<string, unknown> = {
      status: "active",
      blocked_at: null,
      is_trial: false,
      current_period_end: newEnd.toISOString(),
      expires_at: newEnd.toISOString(),
      last_payment_at: new Date().toISOString(),
      kiwify_order_id: orderId ? String(orderId) : null,
      kiwify_customer_email: customerEmail,
      ...(planRow && {
        plan_id: planRow.id,
        plan_name: planRow.name,
        max_whatsapp_instances: planRow.max_channels ?? 9999,
      }),
    };

    if (subscriptionId) {
      await admin.from("subscriptions").update(update).eq("id", subscriptionId);
    } else {
      const { data: created } = await admin
        .from("subscriptions")
        .insert({ tenant_id: tenantId, plan_name: planRow?.name ?? "Pro", ...update })
        .select("id")
        .single();
      subscriptionId = created?.id ?? null;
    }
  } else if (subscriptionId) {
    await admin
      .from("subscriptions")
      .update({ status: "cancelled", blocked_at: new Date().toISOString() })
      .eq("id", subscriptionId);
  }

  await admin.from("subscription_events").insert({
    subscription_id: subscriptionId,
    tenant_id: tenantId,
    event_type: event,
    source: "kiwify",
    amount_cents: amountCents || null,
    payload,
  });

  return json({ ok: true, matched: true, event, activated: activate });
});
