import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  throwIfSupabaseError,
} from "@/lib/supabase/admin";

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token || !isSupabaseConfigured()) {
    return Response.json({ received: true, demo: true });
  }

  try {
    const url = new URL(request.url);
    const payload = (await request.json().catch(() => ({}))) as {
      type?: string;
      data?: { id?: string };
    };
    const paymentId =
      payload.data?.id ?? url.searchParams.get("data.id") ?? undefined;
    if (!paymentId || (payload.type && payload.type !== "payment")) {
      return Response.json({ received: true });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!paymentResponse.ok) {
      return Response.json({ received: true }, { status: 202 });
    }
    const payment = (await paymentResponse.json()) as {
      id?: number;
      status?: string;
      external_reference?: string;
    };
    if (!payment.external_reference) return Response.json({ received: true });

    const supabase = getSupabaseAdmin();
    const orderResult = await supabase
      .from("orders")
      .select("*")
      .eq("id", payment.external_reference)
      .single();
    throwIfSupabaseError(orderResult.error, "Pedido inexistente");

    const paymentStatus = payment.status === "approved" ? "paid" : "pending";
    const update = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_provider_id: payment.id ? String(payment.id) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.external_reference);
    throwIfSupabaseError(update.error, "No se pudo confirmar el pago");

    const order = orderResult.data;
    if (paymentStatus === "paid" && order.salon_id && order.commission > 0) {
      const existing = await supabase
        .from("ledger_entries")
        .select("id")
        .eq("reference_id", order.id)
        .eq("type", "commission")
        .limit(1);
      throwIfSupabaseError(existing.error, "No se pudo revisar la comisión");
      if (!existing.data?.length) {
        const ledger = await supabase.from("ledger_entries").insert({
          id: id("ledger"),
          salon_id: order.salon_id,
          reference_id: order.id,
          type: "commission",
          description: `Comisión venta ${order.id}`,
          debit: 0,
          credit: order.commission,
          occurred_at: new Date().toISOString(),
        });
        throwIfSupabaseError(ledger.error, "No se pudo acreditar la comisión");
      }
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ received: true }, { status: 202 });
  }
}
