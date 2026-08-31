import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  throwIfSupabaseError,
} from "@/lib/supabase/admin";

type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  commission?: number;
};

const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

async function adjustStock(
  productId: string,
  physicalDelta: number,
  reservedDelta: number,
) {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("products")
    .select("physical_stock,reserved_stock")
    .eq("id", productId)
    .single();
  throwIfSupabaseError(result.error, "No se encontró el producto");
  const physical = Math.max(
    0,
    Number(result.data?.physical_stock ?? 0) + physicalDelta,
  );
  const reserved = Math.max(
    0,
    Number(result.data?.reserved_stock ?? 0) + reservedDelta,
  );
  const update = await supabase
    .from("products")
    .update({
      physical_stock: physical,
      reserved_stock: reserved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
  throwIfSupabaseError(update.error, "No se pudo actualizar el stock");
}

async function hasLedgerEntry(referenceId: string, type: string) {
  const result = await getSupabaseAdmin()
    .from("ledger_entries")
    .select("id")
    .eq("reference_id", referenceId)
    .eq("type", type)
    .limit(1);
  throwIfSupabaseError(result.error, "No se pudo revisar la cuenta corriente");
  return Boolean(result.data?.length);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "");

    if (!isSupabaseConfigured()) {
      return Response.json({ ok: true, demo: true, action });
    }

    const supabase = getSupabaseAdmin();

    if (action === "create_assisted_sale") {
      const items = (payload.items ?? []) as SaleItem[];
      const salonId = String(payload.salonId ?? "");
      if (!salonId || items.length === 0) {
        return Response.json(
          { error: "La peluquería y los productos son obligatorios" },
          { status: 400 },
        );
      }

      const orderId = `QP-${String(Date.now()).slice(-6)}`;
      const total = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      const delivered = payload.deliveryTiming === "immediate";
      const amountPaid = Number(payload.amountPaid ?? 0);
      const now = new Date().toISOString();

      const orderInsert = await supabase.from("orders").insert({
        id: orderId,
        type: "b2b",
        source: String(payload.source ?? "assisted"),
        salon_id: salonId,
        recipient_name: String(payload.recipientName ?? "Venta asistida"),
        delivery_mode: "salon",
        delivery_address: String(payload.deliveryAddress ?? ""),
        status: delivered ? "delivered" : "confirmed",
        payment_method: "current_account",
        payment_status:
          amountPaid >= total
            ? "paid"
            : delivered
              ? "charged_to_salon"
              : "pending",
        subtotal: total,
        shipping_fee: 0,
        total,
        commission: 0,
        delivery_date: delivered ? now : null,
        notes: String(payload.notes ?? ""),
      });
      throwIfSupabaseError(orderInsert.error, "No se pudo crear la venta");

      const itemInsert = await supabase.from("order_items").insert(
        items.map((item) => ({
          id: id("item"),
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          commission: 0,
        })),
      );
      throwIfSupabaseError(
        itemInsert.error,
        "No se pudieron guardar los productos",
      );

      for (const item of items) {
        await adjustStock(
          item.productId,
          delivered ? -item.quantity : 0,
          delivered ? 0 : item.quantity,
        );
        const stockInsert = await supabase.from("stock_movements").insert({
          id: id("stock"),
          product_id: item.productId,
          type: delivered ? "sale_delivery" : "order_reservation",
          quantity: delivered ? -item.quantity : item.quantity,
          reference_id: orderId,
          notes: delivered
            ? "Venta asistida entregada"
            : "Reserva por pedido confirmado",
        });
        throwIfSupabaseError(
          stockInsert.error,
          "No se pudo guardar el movimiento de stock",
        );
      }

      if (delivered) {
        const entries = [
          {
            id: id("ledger"),
            salon_id: salonId,
            reference_id: orderId,
            type: "invoice",
            description: `Pedido profesional ${orderId}`,
            debit: total,
            credit: 0,
            occurred_at: now,
          },
        ];
        if (amountPaid > 0) {
          entries.push({
            id: id("ledger"),
            salon_id: salonId,
            reference_id: orderId,
            type: "payment",
            description: `Pago recibido por ${orderId}`,
            debit: 0,
            credit: amountPaid,
            occurred_at: now,
          });
        }
        const ledgerInsert = await supabase
          .from("ledger_entries")
          .insert(entries);
        throwIfSupabaseError(
          ledgerInsert.error,
          "No se pudo actualizar la cuenta corriente",
        );
      }

      return Response.json({ ok: true, orderId, total });
    }

    if (action === "create_b2c_order") {
      const items = (payload.items ?? []) as SaleItem[];
      if (!items.length) {
        return Response.json(
          { error: "El pedido no contiene productos" },
          { status: 400 },
        );
      }
      const orderId = String(
        payload.orderId ?? `QP-${String(Date.now()).slice(-6)}`,
      );
      const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      const commission = items.reduce(
        (sum, item) => sum + Number(item.commission ?? 0) * item.quantity,
        0,
      );
      const shippingFee = Number(payload.shippingFee ?? 0);
      const paymentMethod = String(payload.paymentMethod ?? "mercadopago");
      const demoPaid =
        paymentMethod === "mercadopago" &&
        !process.env.MERCADOPAGO_ACCESS_TOKEN;
      const orderInsert = await supabase.from("orders").insert({
        id: orderId,
        type: "b2c",
        source: String(payload.source ?? "salon_link"),
        salon_id: payload.salonId ? String(payload.salonId) : null,
        influencer_id: payload.influencerId
          ? String(payload.influencerId)
          : null,
        recipient_name: String(payload.customerName ?? "Cliente final"),
        delivery_mode: String(payload.deliveryMode ?? "home"),
        delivery_address: String(payload.deliveryAddress ?? ""),
        status: "confirmed",
        payment_method: paymentMethod,
        payment_status: demoPaid ? "paid" : "pending",
        subtotal,
        shipping_fee: shippingFee,
        total: subtotal + shippingFee,
        commission,
        notes: String(payload.notes ?? ""),
      });
      throwIfSupabaseError(
        orderInsert.error,
        "No se pudo crear el pedido final",
      );

      const itemInsert = await supabase.from("order_items").insert(
        items.map((item) => ({
          id: id("item"),
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          commission: Number(item.commission ?? 0),
        })),
      );
      throwIfSupabaseError(
        itemInsert.error,
        "No se pudieron guardar los productos",
      );

      for (const item of items) {
        await adjustStock(item.productId, 0, item.quantity);
        const movement = await supabase.from("stock_movements").insert({
          id: id("stock"),
          product_id: item.productId,
          type: "order_reservation",
          quantity: item.quantity,
          reference_id: orderId,
          notes: "Reserva por venta a cliente final",
        });
        throwIfSupabaseError(movement.error, "No se pudo reservar el stock");
      }

      if (demoPaid && payload.salonId && commission > 0) {
        const commissionInsert = await supabase.from("ledger_entries").insert({
          id: id("ledger"),
          salon_id: String(payload.salonId),
          reference_id: orderId,
          type: "commission",
          description: `Comisión venta ${orderId}`,
          debit: 0,
          credit: commission,
          occurred_at: new Date().toISOString(),
        });
        throwIfSupabaseError(
          commissionInsert.error,
          "No se pudo acreditar la comisión de prueba",
        );
      }

      return Response.json({
        ok: true,
        orderId,
        total: subtotal + shippingFee,
        commission,
        demoPaid,
      });
    }

    if (action === "register_payment") {
      const salonId = String(payload.salonId ?? "");
      const amount = Number(payload.amount ?? 0);
      if (!salonId || amount <= 0) {
        return Response.json({ error: "Importe inválido" }, { status: 400 });
      }
      const result = await supabase
        .from("ledger_entries")
        .insert({
          id: id("ledger"),
          salon_id: salonId,
          reference_id: String(payload.referenceId ?? "") || null,
          type: "payment",
          description: String(payload.description ?? "Pago recibido"),
          debit: 0,
          credit: amount,
          occurred_at: new Date().toISOString(),
        })
        .select()
        .single();
      throwIfSupabaseError(result.error, "No se pudo registrar el pago");
      return Response.json({ ok: true, entry: result.data });
    }

    if (action === "import_stock") {
      const rows = (payload.rows ?? []) as Array<{
        productId: string;
        quantity: number;
        notes?: string;
      }>;
      for (const row of rows) {
        if (!row.productId || Number(row.quantity) <= 0) continue;
        await adjustStock(row.productId, Number(row.quantity), 0);
        const movement = await supabase.from("stock_movements").insert({
          id: id("stock"),
          product_id: row.productId,
          type: "purchase_import",
          quantity: Number(row.quantity),
          notes: row.notes ?? "Ingreso importado desde planilla",
        });
        throwIfSupabaseError(movement.error, "No se pudo registrar el ingreso");
      }
      return Response.json({ ok: true, imported: rows.length });
    }

    if (action === "update_order_status") {
      const orderId = String(payload.orderId ?? "");
      const status = String(payload.status ?? "");
      const currentResult = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      throwIfSupabaseError(currentResult.error, "Pedido inexistente");
      const current = currentResult.data;
      const now = new Date().toISOString();

      const updateValues: Record<string, string> = { status, updated_at: now };
      if (status === "delivered") updateValues.delivery_date = now;

      if (status === "delivered" && current.payment_method === "cash") {
        updateValues.payment_status =
          current.delivery_mode === "salon" ? "charged_to_salon" : "paid";
      }
      const update = await supabase
        .from("orders")
        .update(updateValues)
        .eq("id", orderId);
      throwIfSupabaseError(update.error, "No se pudo actualizar el pedido");

      if (status === "delivered" && current.status !== "delivered") {
        const itemsResult = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);
        throwIfSupabaseError(
          itemsResult.error,
          "No se pudieron leer los productos",
        );
        for (const item of itemsResult.data ?? []) {
          await adjustStock(item.product_id, -item.quantity, -item.quantity);
          const movement = await supabase.from("stock_movements").insert({
            id: id("stock"),
            product_id: item.product_id,
            type: "delivery",
            quantity: -item.quantity,
            reference_id: orderId,
            notes: "Entrega confirmada",
          });
          throwIfSupabaseError(movement.error, "No se pudo descontar el stock");
        }

        if (current.type === "b2b" && current.salon_id) {
          if (!(await hasLedgerEntry(orderId, "invoice"))) {
            const ledgerInsert = await supabase.from("ledger_entries").insert({
              id: id("ledger"),
              salon_id: current.salon_id,
              reference_id: orderId,
              type: "invoice",
              description: `Pedido profesional ${orderId}`,
              debit: current.total,
              credit: 0,
              occurred_at: now,
            });
            throwIfSupabaseError(
              ledgerInsert.error,
              "No se pudo debitar el pedido",
            );
          }
        }

        if (current.type === "b2c" && current.salon_id) {
          const entries = [];
          if (
            current.payment_method === "cash" &&
            current.delivery_mode === "salon" &&
            !(await hasLedgerEntry(orderId, "b2c_cash_debit"))
          ) {
            entries.push({
              id: id("ledger"),
              salon_id: current.salon_id,
              reference_id: orderId,
              type: "b2c_cash_debit",
              description: `Venta final en efectivo ${orderId}`,
              debit: current.total,
              credit: 0,
              occurred_at: now,
            });
          }
          if (!(await hasLedgerEntry(orderId, "commission"))) {
            entries.push({
              id: id("ledger"),
              salon_id: current.salon_id,
              reference_id: orderId,
              type: "commission",
              description: `Comisión venta ${orderId}`,
              debit: 0,
              credit: current.commission,
              occurred_at: now,
            });
          }
          if (entries.length) {
            const ledgerInsert = await supabase
              .from("ledger_entries")
              .insert(entries);
            throwIfSupabaseError(
              ledgerInsert.error,
              "No se pudo acreditar la comisión",
            );
          }
        }
      }
      return Response.json({ ok: true });
    }

    if (action === "create_appointment") {
      const startsAt = String(payload.startsAt ?? "");
      const durationMinutes = Number(payload.durationMinutes ?? 0);
      const professionalId = String(payload.professionalId ?? "");
      if (!startsAt || !durationMinutes || !professionalId) {
        return Response.json(
          { error: "Faltan datos del turno" },
          { status: 400 },
        );
      }

      const dayStart = new Date(startsAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const existingResult = await supabase
        .from("appointments")
        .select("starts_at,duration_minutes,status")
        .eq("professional_id", professionalId)
        .gte("starts_at", dayStart.toISOString())
        .lt("starts_at", dayEnd.toISOString())
        .neq("status", "cancelled");
      throwIfSupabaseError(
        existingResult.error,
        "No se pudo comprobar la agenda",
      );

      const requestedStart = new Date(startsAt).getTime();
      const requestedEnd = requestedStart + durationMinutes * 60_000;
      const overlaps = (existingResult.data ?? []).some((appointment) => {
        const existingStart = new Date(appointment.starts_at).getTime();
        const existingEnd =
          existingStart + appointment.duration_minutes * 60_000;
        return requestedStart < existingEnd && requestedEnd > existingStart;
      });
      if (overlaps) {
        return Response.json(
          { error: "Ese horario se superpone con otro turno" },
          { status: 409 },
        );
      }

      const salonId = String(payload.salonId ?? "salon-lola");
      let customerId = String(payload.customerId ?? "");
      const customerPhone = String(payload.customerPhone ?? "").trim();

      if (customerPhone) {
        const existingCustomer = await supabase
          .from("customers")
          .select("id")
          .eq("salon_id", salonId)
          .eq("phone", customerPhone)
          .limit(1);
        throwIfSupabaseError(
          existingCustomer.error,
          "No se pudo identificar al cliente",
        );
        customerId = existingCustomer.data?.[0]?.id ?? customerId;
      }

      if (!customerId) customerId = id("customer");
      const customerResult = await supabase
        .from("customers")
        .select("id")
        .eq("id", customerId)
        .limit(1);
      throwIfSupabaseError(
        customerResult.error,
        "No se pudo revisar el cliente",
      );
      if (!customerResult.data?.length) {
        const customerInsert = await supabase.from("customers").insert({
          id: customerId,
          salon_id: salonId,
          name: String(payload.customerName ?? "Cliente"),
          phone: customerPhone,
          email: String(payload.customerEmail ?? ""),
          marketing_consent: Boolean(payload.marketingConsent),
        });
        throwIfSupabaseError(
          customerInsert.error,
          "No se pudo guardar el cliente",
        );
      }

      const appointmentId = String(payload.appointmentId ?? id("apt"));
      const insert = await supabase.from("appointments").insert({
        id: appointmentId,
        salon_id: salonId,
        customer_id: customerId,
        professional_id: professionalId,
        service_id: String(payload.serviceId ?? "srv-corte"),
        starts_at: startsAt,
        duration_minutes: durationMinutes,
        price: Number(payload.price ?? 0),
        status: "confirmed",
        reminder_status: "pending",
        notes: String(payload.notes ?? ""),
      });
      throwIfSupabaseError(insert.error, "No se pudo crear el turno");
      return Response.json({ ok: true, appointmentId });
    }

    if (action === "update_appointment_status") {
      const appointmentId = String(payload.appointmentId ?? "");
      const status = String(payload.status ?? "");
      const update = await supabase
        .from("appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", appointmentId);
      throwIfSupabaseError(update.error, "No se pudo actualizar el turno");
      return Response.json({ ok: true });
    }

    if (action === "edit_ledger") {
      const entryId = String(payload.entryId ?? "");
      const beforeResult = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("id", entryId)
        .single();
      throwIfSupabaseError(beforeResult.error, "Movimiento inexistente");
      const after = {
        description: String(
          payload.description ?? beforeResult.data.description,
        ),
        debit: Number(payload.debit ?? beforeResult.data.debit),
        credit: Number(payload.credit ?? beforeResult.data.credit),
        occurred_at: String(
          payload.occurredAt ?? beforeResult.data.occurred_at,
        ),
        updated_at: new Date().toISOString(),
      };
      const update = await supabase
        .from("ledger_entries")
        .update(after)
        .eq("id", entryId);
      throwIfSupabaseError(update.error, "No se pudo corregir el movimiento");
      const audit = await supabase.from("audit_logs").insert({
        id: id("audit"),
        entity_type: "ledger_entry",
        entity_id: entryId,
        action: "edit",
        before_json: beforeResult.data,
        after_json: { ...beforeResult.data, ...after },
      });
      throwIfSupabaseError(audit.error, "No se pudo guardar el historial");
      return Response.json({ ok: true });
    }

    if (action === "delete_ledger") {
      const entryId = String(payload.entryId ?? "");
      const beforeResult = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("id", entryId)
        .single();
      throwIfSupabaseError(beforeResult.error, "Movimiento inexistente");
      const audit = await supabase.from("audit_logs").insert({
        id: id("audit"),
        entity_type: "ledger_entry",
        entity_id: entryId,
        action: "delete",
        before_json: beforeResult.data,
      });
      throwIfSupabaseError(audit.error, "No se pudo guardar el historial");
      const remove = await supabase
        .from("ledger_entries")
        .delete()
        .eq("id", entryId);
      throwIfSupabaseError(remove.error, "No se pudo eliminar el movimiento");
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo completar la operación",
      },
      { status: 500 },
    );
  }
}
