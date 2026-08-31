type CheckoutItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      orderId?: string;
      payerEmail?: string;
      items?: CheckoutItem[];
    };
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const appUrl = process.env.APP_BASE_URL ?? new URL(request.url).origin;

    if (!payload.orderId || !payload.items?.length) {
      return Response.json({ error: "El pedido no contiene productos" }, { status: 400 });
    }

    if (!token) {
      return Response.json({
        demo: true,
        preferenceId: `demo-${payload.orderId}`,
        checkoutUrl: `${appUrl}/?payment=demo-approved&order=${payload.orderId}`,
        message: "Modo demostración: configurá MERCADOPAGO_ACCESS_TOKEN para cobrar realmente.",
      });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": payload.orderId,
      },
      body: JSON.stringify({
        external_reference: payload.orderId,
        payer: payload.payerEmail ? { email: payload.payerEmail } : undefined,
        items: payload.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice / 100,
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${appUrl}/?payment=approved&order=${payload.orderId}`,
          pending: `${appUrl}/?payment=pending&order=${payload.orderId}`,
          failure: `${appUrl}/?payment=failed&order=${payload.orderId}`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/integrations/mercadopago/webhook`,
      }),
    });
    const result = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return Response.json({ error: "Mercado Pago rechazó la preferencia", detail: result }, { status: 502 });
    }

    return Response.json({
      preferenceId: result.id,
      checkoutUrl: result.init_point,
      sandboxCheckoutUrl: result.sandbox_init_point,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo iniciar el pago" },
      { status: 500 },
    );
  }
}
