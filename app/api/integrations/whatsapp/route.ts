export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      to?: string;
      customerName?: string;
      salonName?: string;
      appointmentDate?: string;
      manageUrl?: string;
    };
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME ?? "recordatorio_turno";

    if (!payload.to) return Response.json({ error: "Falta el teléfono del cliente" }, { status: 400 });
    if (!token || !phoneNumberId) {
      return Response.json({
        demo: true,
        sent: false,
        preview: `Hola ${payload.customerName ?? ""}. Te recordamos tu turno en ${payload.salonName ?? "la peluquería"} para ${payload.appointmentDate ?? "mañana"}.`,
        message: "Modo demostración: configurá las credenciales de WhatsApp Business para enviar.",
      });
    }

    const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: payload.to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: { code: "es_AR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: payload.customerName ?? "Cliente" },
                { type: "text", text: payload.salonName ?? "tu peluquería" },
                { type: "text", text: payload.appointmentDate ?? "mañana" },
                { type: "text", text: payload.manageUrl ?? "" },
              ],
            },
          ],
        },
      }),
    });
    const result = await response.json();
    if (!response.ok) return Response.json({ error: "WhatsApp no aceptó el mensaje", detail: result }, { status: 502 });
    return Response.json({ sent: true, result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el recordatorio" },
      { status: 500 },
    );
  }
}
