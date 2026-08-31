import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  throwIfSupabaseError,
} from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({ configured: false, mode: "demo" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [
      productResult,
      salonResult,
      customerResult,
      professionalResult,
      serviceResult,
      appointmentResult,
      orderResult,
      itemResult,
      influencerResult,
      ledgerResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("category")
        .order("name"),
      supabase.from("salons").select("*").eq("active", true).order("name"),
      supabase.from("customers").select("*").order("name"),
      supabase
        .from("professionals")
        .select("*")
        .eq("active", true)
        .order("name"),
      supabase.from("services").select("*").eq("active", true).order("name"),
      supabase.from("appointments").select("*").order("starts_at"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("order_items").select("*"),
      supabase.from("influencers").select("*").eq("active", true),
      supabase
        .from("ledger_entries")
        .select("*")
        .order("occurred_at", { ascending: false }),
    ]);

    for (const result of [
      productResult,
      salonResult,
      customerResult,
      professionalResult,
      serviceResult,
      appointmentResult,
      orderResult,
      itemResult,
      influencerResult,
      ledgerResult,
    ]) {
      throwIfSupabaseError(result.error, "No se pudieron leer los datos");
    }

    const productRows = productResult.data ?? [];
    const salonRows = salonResult.data ?? [];
    const customerRows = customerResult.data ?? [];
    const professionalRows = professionalResult.data ?? [];
    const serviceRows = serviceResult.data ?? [];
    const appointmentRows = appointmentResult.data ?? [];
    const orderRows = orderResult.data ?? [];
    const itemRows = itemResult.data ?? [];
    const influencerRows = influencerResult.data ?? [];
    const ledgerRows = ledgerResult.data ?? [];

    const salonNames = new Map(
      salonRows.map((salon) => [salon.id, salon.name]),
    );
    const customerNames = new Map(
      customerRows.map((customer) => [customer.id, customer.name]),
    );
    const professionalNames = new Map(
      professionalRows.map((professional) => [
        professional.id,
        professional.name,
      ]),
    );
    const serviceNames = new Map(
      serviceRows.map((service) => [service.id, service.name]),
    );
    const influencerNames = new Map(
      influencerRows.map((influencer) => [influencer.id, influencer.name]),
    );

    return Response.json({
      configured: true,
      products: productRows.map((product) => ({
        id: product.id,
        sourceProductId: product.source_product_id ?? undefined,
        name: product.name,
        variant: product.variant,
        sku: product.sku,
        category: product.category,
        imageUrl: product.image_url,
        description: product.description,
        professionalPrice: Number(product.professional_price),
        publicPrice: Number(product.public_price),
        b2cEnabled: product.b2c_enabled,
        physicalStock: product.physical_stock,
        reservedStock: product.reserved_stock,
        active: product.active,
      })),
      salons: salonRows.map((salon) => ({
        id: salon.id,
        name: salon.name,
        owner: salon.owner,
        phone: salon.phone,
        address: salon.address,
        slug: salon.slug,
        hasAccess: salon.has_access,
        whatsappConnected: salon.whatsapp_connected,
      })),
      customers: customerRows,
      appointments: appointmentRows.map((appointment) => ({
        id: appointment.id,
        salonId: appointment.salon_id,
        customerId: appointment.customer_id,
        customerName: customerNames.get(appointment.customer_id) ?? "Cliente",
        professionalId: appointment.professional_id,
        professionalName:
          professionalNames.get(appointment.professional_id) ?? "Profesional",
        serviceId: appointment.service_id,
        serviceName: serviceNames.get(appointment.service_id) ?? "Servicio",
        startsAt: appointment.starts_at,
        durationMinutes: appointment.duration_minutes,
        price: Number(appointment.price),
        status: appointment.status,
        reminderStatus: appointment.reminder_status,
      })),
      orders: orderRows.map((order) => {
        const items = itemRows.filter((item) => item.order_id === order.id);
        return {
          id: order.id,
          type: order.type,
          source: order.source,
          salonId: order.salon_id ?? undefined,
          salonName: order.salon_id
            ? salonNames.get(order.salon_id)
            : undefined,
          influencerId: order.influencer_id ?? undefined,
          influencerName: order.influencer_id
            ? influencerNames.get(order.influencer_id)
            : undefined,
          customerName: order.recipient_name,
          products: order.notes || `${items.length} productos`,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0) || 1,
          deliveryMode: order.delivery_mode,
          deliveryAddress: order.delivery_address,
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          total: Number(order.total),
          commission: Number(order.commission),
          createdAt: order.created_at,
        };
      }),
      ledger: ledgerRows.map((entry) => ({
        id: entry.id,
        salonId: entry.salon_id,
        date: new Date(entry.occurred_at).toLocaleDateString("es-AR"),
        description: entry.description,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        balance: 0,
        type: entry.type,
      })),
    });
  } catch (error) {
    return Response.json(
      {
        configured: true,
        error:
          error instanceof Error ? error.message : "No se pudo leer Supabase",
      },
      { status: 500 },
    );
  }
}
