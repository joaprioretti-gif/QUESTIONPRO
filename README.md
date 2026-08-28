# Question Pro · Vercel + Supabase

MVP full-stack para Question Professional La Plata. Combina la gestión diaria de las peluquerías con el catálogo, los pedidos, el stock, las entregas y las cuentas corrientes de Question.

Esta edición está preparada específicamente para:

- Código privado en GitHub.
- Aplicación Next.js publicada en Vercel.
- Base de datos PostgreSQL, autenticación futura y almacenamiento en Supabase.

## Perfiles incluidos

- Administrador Question.
- Peluquería.
- Repartidor.
- Influencer.
- Cliente final.

Durante el piloto se puede cambiar de perfil desde el selector superior. Esto permite probar todos los recorridos sin crear usuarios todavía.

## Funcionalidades operativas

- Venta asistida a peluquerías tradicionales.
- Pedidos profesionales desde la aplicación.
- Estado de cuenta con compras, pagos, comisiones y ajustes.
- Edición y eliminación de errores con historial de auditoría.
- Stock físico, reservado y disponible por variante.
- Ingreso de compras mediante Excel o CSV.
- Catálogo oficial con cada tono y presentación por separado.
- Sincronización con `questioncolor.com.ar`.
- Panel de pedidos pendientes por tipo de entrega.
- Confirmación de entrega y cobro desde el panel del repartidor.
- Agenda, profesionales, servicios y clientes.
- Prevención de superposición de turnos en el servidor.
- Reportes del salón y de Question.
- Venta B2C atribuida a una peluquería o influencer.
- Comisión de peluquería calculada como precio público menos precio profesional.
- Mercado Pago y WhatsApp en modo demostración hasta cargar credenciales.
- PWA instalable desde el navegador del celular.

## Estructura principal

```text
app/                    Pantallas y rutas del servidor
components/             Interfaz y componentes visuales
lib/demo-data.ts        Respaldo demostrativo sin base conectada
lib/supabase/admin.ts   Conexión segura del servidor con Supabase
public/                 Ícono y service worker de la PWA
supabase/schema.sql     Tablas, seguridad y datos de prueba
GUIA_INSTALACION.md     Paso a paso para Joaquín
```

## Instalación rápida

La guía completa, sin conocimientos técnicos previos, está en [`GUIA_INSTALACION.md`](./GUIA_INSTALACION.md).

Resumen:

1. Subir el contenido del proyecto a un repositorio privado de GitHub.
2. Importar el repositorio desde Vercel.
3. Instalar Supabase desde el Marketplace de Vercel y vincularlo al proyecto.
4. Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase.
5. Volver a desplegar la aplicación en Vercel.

## Desarrollo local

Requiere Node.js 22.13 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sin variables de Supabase, la aplicación abre con información ficticia guardada solamente en el navegador. Con Supabase conectado, las ventas, turnos, pagos, pedidos y movimientos de stock persisten al actualizar la página.

## Variables de entorno

Supabase instalado desde el Marketplace de Vercel agrega automáticamente las variables necesarias. Para una instalación manual:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

Integraciones opcionales:

```env
APP_BASE_URL=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_TEMPLATE_NAME=recordatorio_turno
```

Nunca subas `.env.local`, claves secretas ni contraseñas a GitHub.

## Base de datos y seguridad

`supabase/schema.sql`:

- Crea todas las tablas e índices.
- Habilita Row Level Security en todas las tablas.
- No concede acceso directo al navegador.
- Carga datos ficticios para probar los recorridos.

Las operaciones pasan por rutas del servidor de Vercel, que utilizan `SUPABASE_SECRET_KEY`. La clave nunca se envía al navegador.

Esta versión conserva un selector libre de perfiles para facilitar la validación. No cargues datos personales o comerciales reales hasta incorporar Supabase Auth y permisos definitivos por rol.

## Comportamiento de las integraciones

### Mercado Pago

Sin credenciales:

- Simula un pago aprobado.
- Guarda el pedido en Supabase.
- Acredita la comisión de prueba a la peluquería.

Con credenciales:

- Crea una preferencia real.
- Redirige al checkout.
- El webhook confirma el pago.
- La comisión se acredita cuando Mercado Pago informa la aprobación.

Antes de producción se debe agregar y validar la firma secreta del webhook.

### WhatsApp

Sin credenciales devuelve una vista previa del recordatorio. Con las credenciales de Meta envía la plantilla configurada. La conexión individual del número de cada peluquería debe completarse antes del lanzamiento público.

## Catálogo

En `Administrador Question → Configuración` está la acción `Sincronizar QuestionColor`.

La sincronización:

- Consulta la API pública del sitio oficial.
- Expande tonos y presentaciones como productos individuales.
- Conserva el stock y el precio profesional ya cargados.
- Actualiza nombres, categorías, imágenes y precio público.
- Asigna un precio profesional demostrativo únicamente a variantes nuevas.

Antes de vender se debe importar la lista profesional real y verificar qué productos son de uso domiciliario.

## Validación

```bash
npm run lint
npm run build
```

GitHub Actions ejecuta ambas verificaciones con cada actualización enviada a la rama `main`.

## Alcance del piloto

El piloto permite probar funcionamiento y persistencia real. Antes de abrirlo a clientes hay que completar:

- Supabase Auth y permisos por rol.
- Usuarios administradores reales.
- Precios, stock y saldos iniciales correctos.
- Mercado Pago productivo y firma del webhook.
- WhatsApp Business y plantillas aprobadas.
- Protección contra abuso y límites de solicitudes.
- Políticas de privacidad, términos y devoluciones.
- Revisión contable e impositiva de ventas y comisiones.
