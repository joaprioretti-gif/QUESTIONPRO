"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  AreaChart,
  BadgeDollarSign,
  BarChart3,
  BellRing,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Download,
  FileClock,
  Gift,
  History,
  House,
  Link2,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Upload,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  demoAppointments,
  demoCustomers,
  demoLedger,
  demoOrders,
  demoProducts,
  demoSalons,
  demoServices,
  formatMoney,
  serviceReportData,
  weeklyReportData,
  type Appointment,
  type LedgerEntry,
  type Order,
  type Product,
  type Role,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const roleLabels: Record<Role, string> = {
  question: "Administrador Question",
  salon: "Lola Estudio",
  driver: "Repartidor",
  influencer: "Mica Beauty",
  customer: "Cliente final",
};

const menus: Record<Role, NavItem[]> = {
  question: [
    { id: "summary", label: "Resumen", icon: AreaChart },
    { id: "assisted", label: "Venta asistida", icon: ShoppingCart },
    { id: "deliveries", label: "Pedidos y entregas", icon: Truck },
    { id: "stock", label: "Stock", icon: Boxes },
    { id: "salons", label: "Peluquerías", icon: Store },
    { id: "question-reports", label: "Reportes", icon: BarChart3 },
    { id: "settings", label: "Configuración", icon: Settings2 },
  ],
  salon: [
    { id: "salon-home", label: "Inicio", icon: House },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "salon-reports", label: "Reportes", icon: BarChart3 },
    { id: "question-module", label: "Question", icon: Sparkles },
  ],
  driver: [{ id: "driver-route", label: "Entregas de hoy", icon: Route }],
  influencer: [
    { id: "influencer-home", label: "Resumen", icon: AreaChart },
    { id: "influencer-sales", label: "Ventas", icon: ShoppingBag },
    {
      id: "influencer-commission",
      label: "Comisiones",
      icon: CircleDollarSign,
    },
  ],
  customer: [
    { id: "public-booking", label: "Reservar turno", icon: CalendarDays },
    { id: "public-shop", label: "Comprar productos", icon: ShoppingBag },
    { id: "public-history", label: "Mis compras", icon: History },
  ],
};

const defaultSection: Record<Role, string> = {
  question: "summary",
  salon: "salon-home",
  driver: "driver-route",
  influencer: "influencer-home",
  customer: "public-booking",
};

const sectionTitles: Record<
  string,
  { eyebrow: string; title: string; description: string }
> = {
  summary: {
    eyebrow: "Operación en vivo",
    title: "Todo el negocio, en una mirada",
    description:
      "Ventas, entregas, stock y cobranzas de Question Professional.",
  },
  assisted: {
    eyebrow: "Venta presencial",
    title: "Cargar una venta asistida",
    description:
      "Para registrar pedidos aunque la peluquería no utilice la plataforma.",
  },
  deliveries: {
    eyebrow: "Logística",
    title: "Pedidos pendientes de entrega",
    description:
      "Separados por destino para preparar las rutas sin omitir ninguna venta.",
  },
  stock: {
    eyebrow: "Inventario",
    title: "Stock simple y confiable",
    description:
      "Stock físico, reservado y realmente disponible por cada variante.",
  },
  salons: {
    eyebrow: "Cartera profesional",
    title: "Todas las peluquerías",
    description:
      "Con o sin acceso digital, todas tienen historial y estado de cuenta.",
  },
  "question-reports": {
    eyebrow: "Inteligencia comercial",
    title: "Reportes de Question",
    description: "Entendé qué se vende, quién recompra y dónde está el dinero.",
  },
  settings: {
    eyebrow: "Reglas del negocio",
    title: "Configuración",
    description: "Precios, envíos, medios de pago e integraciones.",
  },
  "salon-home": {
    eyebrow: "Viernes 28 de agosto",
    title: "Buen día, Laura",
    description: "Tu agenda, tus clientes y Question, en el mismo lugar.",
  },
  agenda: {
    eyebrow: "Agenda del salón",
    title: "Turnos de hoy",
    description: "Organizá al equipo y evitá superposiciones.",
  },
  clients: {
    eyebrow: "Clientes",
    title: "Tu comunidad",
    description: "Historial de visitas, compras y permisos de contacto.",
  },
  "salon-reports": {
    eyebrow: "Actividad principal",
    title: "Cómo está trabajando el salón",
    description: "Turnos, horas, servicios y rendimiento del equipo.",
  },
  "question-module": {
    eyebrow: "Módulo Question",
    title: "Productos y cuenta corriente",
    description: "Comprá para el salón y seguí cada movimiento comercial.",
  },
  "driver-route": {
    eyebrow: "Ruta de hoy",
    title: "5 entregas por completar",
    description: "Confirmá cobros y entregas desde el celular.",
  },
  "influencer-home": {
    eyebrow: "Canal Mica Beauty",
    title: "Tu tienda recomendada",
    description: "Ventas y comisiones generadas con tu enlace exclusivo.",
  },
  "influencer-sales": {
    eyebrow: "Influencer",
    title: "Ventas atribuidas",
    description: "Cada compra queda asociada al enlace que la originó.",
  },
  "influencer-commission": {
    eyebrow: "Liquidación manual",
    title: "Comisiones",
    description: "Importes pendientes y pagos informados por Question.",
  },
  "public-booking": {
    eyebrow: "Lola Estudio",
    title: "Reservá tu próximo turno",
    description:
      "Elegí servicio, profesional y horario sin crear una contraseña.",
  },
  "public-shop": {
    eyebrow: "Recomendado por Lola",
    title: "Cuidado profesional en tu casa",
    description: "Question prepara tu pedido y Lola recibe la comisión.",
  },
  "public-history": {
    eyebrow: "Acceso por teléfono",
    title: "Tus compras y turnos",
    description: "Recibí un código por WhatsApp para acceder sin contraseña.",
  },
};

function postAction(payload: Record<string, unknown>) {
  return fetch("/api/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    received: "Recibido",
    confirmed: "Confirmado",
    preparing: "En preparación",
    ready: "Listo",
    in_transit: "En camino",
    delivered: "Entregado",
    paid: "Pagado",
    pending: "Pendiente",
    charged_to_salon: "A cuenta del salón",
    completed: "Completado",
    cancelled: "Cancelado",
    no_show: "Ausente",
  };
  const tone = ["delivered", "paid", "completed"].includes(status)
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : ["ready", "confirmed"].includes(status)
      ? "bg-lime-50 text-lime-800 border-lime-200"
      : ["cancelled", "no_show"].includes(status)
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-800 border-amber-200";
  return (
    <Badge variant="outline" className={cn("font-medium", tone)}>
      {labels[status] ?? status}
    </Badge>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-0 shadow-sm",
        accent ? "bg-[#c8e44f]" : "bg-white",
      )}
    >
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm font-medium text-black/55">{label}</span>
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full",
              accent ? "bg-black text-white" : "bg-[#f1f1eb] text-black",
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div className="text-3xl font-semibold tracking-[-0.04em] text-black">
          {value}
        </div>
        <p className="mt-2 text-xs leading-5 text-black/50">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = React.useState(false);
  if (!product.imageUrl || failed) {
    return (
      <div className="grid h-full min-h-24 place-items-center bg-[#eff0e7] text-2xl font-semibold text-black/20">
        Q
      </div>
    );
  }
  return (
    // Las imágenes provienen del catálogo dinámico de WooCommerce; sus hosts
    // no se conocen de antemano y por eso se renderizan sin optimizador.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.imageUrl}
      alt={product.name}
      className="h-full w-full object-contain p-3"
      onError={() => setFailed(true)}
    />
  );
}

export function QuestionProApp() {
  const [role, setRole] = React.useState<Role>("question");
  const [section, setSection] = React.useState(defaultSection.question);
  const [products, setProducts] = React.useState<Product[]>(demoProducts);
  const [orders, setOrders] = React.useState<Order[]>(demoOrders);
  const [appointments, setAppointments] =
    React.useState<Appointment[]>(demoAppointments);
  const [ledger, setLedger] = React.useState<LedgerEntry[]>(demoLedger);

  React.useEffect(() => {
    let active = true;
    fetch("/api/bootstrap")
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Sin base remota")),
      )
      .then(
        (data: {
          products?: Product[];
          orders?: Order[];
          appointments?: Appointment[];
          ledger?: LedgerEntry[];
        }) => {
          if (!active) return;
          if (data.products?.length) setProducts(data.products);
          if (data.orders?.length) setOrders(data.orders);
          if (data.appointments?.length) setAppointments(data.appointments);
          if (data.ledger?.length) setLedger(data.ledger);
        },
      )
      .catch(() => {
        // La vista demo es el respaldo local cuando Supabase todavía no está conectado.
      });
    return () => {
      active = false;
    };
  }, []);

  const changeRole = (next: Role) => {
    setRole(next);
    setSection(defaultSection[next]);
  };
  const title = sectionTitles[section] ?? sectionTitles.summary;

  return (
    <SidebarProvider>
      <Sidebar
        className="border-0 bg-[#11120f] text-white"
        collapsible="offcanvas"
      >
        <SidebarHeader className="px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-[#c8e44f] font-black text-black">
              Q
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">
                Question Pro
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                La Plata
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/35">
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menus[role].map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={section === item.id}
                      onClick={() => setSection(item.id)}
                      className="h-10 text-white/65 hover:bg-white/8 hover:text-white data-[active=true]:bg-[#c8e44f] data-[active=true]:font-medium data-[active=true]:text-black"
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-white/10">
                <UserRound className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {roleLabels[role]}
                </div>
                <div className="text-xs text-white/40">Modo demostración</div>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-[#f3f3ed]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-[#f3f3ed]/90 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden items-center gap-2 text-xs text-black/45 sm:flex">
              <span>Question Pro</span>
              <ChevronRight className="size-3" />
              <span className="text-black/75">{title.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-black/10 bg-white"
            >
              <BellRing className="size-4" />
            </Button>
            <Select
              value={role}
              onValueChange={(value) => changeRole(value as Role)}
            >
              <SelectTrigger className="w-[170px] rounded-full border-black/10 bg-white text-xs sm:w-[210px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="question">Administrador Question</SelectItem>
                <SelectItem value="salon">Peluquería</SelectItem>
                <SelectItem value="driver">Repartidor</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="customer">Cliente final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-4 md:p-7 lg:p-9">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#69782b]">
                {title.eyebrow}
              </div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-[#181914] md:text-4xl">
                {title.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                {title.description}
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-amber-200 bg-amber-50 px-3 py-1 text-amber-800"
            >
              Datos y precios de demostración
            </Badge>
          </div>

          <ViewRouter
            section={section}
            role={role}
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            appointments={appointments}
            setAppointments={setAppointments}
            ledger={ledger}
            setLedger={setLedger}
            navigate={setSection}
          />
        </main>
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}

function ViewRouter(props: {
  section: string;
  role: Role;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  ledger: LedgerEntry[];
  setLedger: React.Dispatch<React.SetStateAction<LedgerEntry[]>>;
  navigate: (section: string) => void;
}) {
  const common = {
    products: props.products,
    orders: props.orders,
    appointments: props.appointments,
  };
  switch (props.section) {
    case "summary":
      return <QuestionDashboard {...common} navigate={props.navigate} />;
    case "assisted":
      return (
        <AssistedSale
          products={props.products}
          orders={props.orders}
          setOrders={props.setOrders}
          setProducts={props.setProducts}
        />
      );
    case "deliveries":
      return <Deliveries orders={props.orders} setOrders={props.setOrders} />;
    case "stock":
      return (
        <StockView products={props.products} setProducts={props.setProducts} />
      );
    case "salons":
      return <SalonsView ledger={props.ledger} setLedger={props.setLedger} />;
    case "question-reports":
      return <QuestionReports orders={props.orders} />;
    case "settings":
      return <SettingsView />;
    case "salon-home":
      return (
        <SalonHome
          appointments={props.appointments}
          orders={props.orders}
          navigate={props.navigate}
        />
      );
    case "agenda":
      return (
        <AgendaView
          appointments={props.appointments}
          setAppointments={props.setAppointments}
        />
      );
    case "clients":
      return <ClientsView />;
    case "salon-reports":
      return <SalonReports />;
    case "question-module":
      return (
        <QuestionModule
          products={props.products}
          orders={props.orders}
          ledger={props.ledger}
        />
      );
    case "driver-route":
      return <DriverView orders={props.orders} setOrders={props.setOrders} />;
    case "influencer-home":
    case "influencer-sales":
    case "influencer-commission":
      return <InfluencerView orders={props.orders} active={props.section} />;
    case "public-booking":
      return <PublicBooking setAppointments={props.setAppointments} />;
    case "public-shop":
      return (
        <PublicShop
          products={props.products}
          orders={props.orders}
          setOrders={props.setOrders}
        />
      );
    case "public-history":
      return <PublicHistory />;
    default:
      return <QuestionDashboard {...common} navigate={props.navigate} />;
  }
}

function QuestionDashboard({
  products,
  orders,
  navigate,
}: {
  products: Product[];
  orders: Order[];
  navigate: (section: string) => void;
}) {
  const pending = orders.filter((order) => order.status !== "delivered");
  const lowStock = products.filter(
    (product) => product.physicalStock - product.reservedStock <= 7,
  );
  const todaySales = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ventas registradas"
          value={formatMoney(todaySales)}
          detail="5 operaciones entre B2B y B2C"
          icon={BadgeDollarSign}
          accent
        />
        <MetricCard
          label="Entregas pendientes"
          value={String(pending.length)}
          detail="2 a domicilio · 2 a peluquerías"
          icon={Truck}
        />
        <MetricCard
          label="Saldo a cobrar"
          value="$ 32,8 M"
          detail="6 peluquerías con deuda"
          icon={WalletCards}
        />
        <MetricCard
          label="Alertas de stock"
          value={String(lowStock.length)}
          detail="Variantes con disponible ≤ 7"
          icon={Boxes}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Próximas entregas</CardTitle>
              <CardDescription>La cola operativa de hoy.</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("deliveries")}
            >
              Ver todas <ChevronRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-black/5">
              {pending.slice(0, 4).map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate("deliveries")}
                  className="flex w-full items-center gap-4 py-4 text-left hover:bg-black/[0.015]"
                >
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      order.deliveryMode === "home"
                        ? "bg-[#fee1da] text-[#bb4b36]"
                        : "bg-[#edf4cc] text-[#657523]",
                    )}
                  >
                    {order.deliveryMode === "home" ? (
                      <House className="size-4" />
                    ) : (
                      <Store className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{order.customerName}</span>
                      <span className="text-xs text-black/35">{order.id}</span>
                    </div>
                    <p className="truncate text-xs text-black/50">
                      {order.salonName ?? order.influencerName} ·{" "}
                      {order.products}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-semibold">
                      {formatMoney(order.total)}
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[#1d1f19] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Acciones rápidas</CardTitle>
            <CardDescription className="text-white/45">
              Lo que más usa Question durante el recorrido.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [
                "Cargar venta asistida",
                "Registrar productos y cobro",
                ShoppingCart,
                "assisted",
              ],
              [
                "Ingresar stock",
                "Importar una compra por Excel",
                Upload,
                "stock",
              ],
              [
                "Registrar un pago",
                "Actualizar cuenta corriente",
                CreditCard,
                "salons",
              ],
            ].map(([label, detail, Icon, destination]) => (
              <button
                key={String(label)}
                onClick={() => navigate(String(destination))}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/10"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-[#c8e44f] text-black">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    {label as string}
                  </span>
                  <span className="text-xs text-white/40">
                    {detail as string}
                  </span>
                </span>
                <ChevronRight className="size-4 text-white/30" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Ventas de los últimos 7 días
            </CardTitle>
            <CardDescription>B2B y ventas al cliente final.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                b2b: { label: "Profesional", color: "#181914" },
                b2c: { label: "Cliente final", color: "#c8e44f" },
              }}
            >
              <BarChart
                data={[
                  { d: "Vie", b2b: 8.4, b2c: 2.1 },
                  { d: "Sáb", b2b: 3.2, b2c: 3.8 },
                  { d: "Lun", b2b: 12.1, b2c: 2.8 },
                  { d: "Mar", b2b: 9.5, b2c: 4.1 },
                  { d: "Mié", b2b: 14.2, b2c: 3.2 },
                  { d: "Jue", b2b: 11.8, b2c: 5.3 },
                  { d: "Hoy", b2b: 18.3, b2c: 6.9 },
                ]}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="d" axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="b2b"
                  fill="var(--color-b2b)"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="b2c"
                  fill="var(--color-b2c)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Stock crítico</CardTitle>
            <CardDescription>Disponible después de reservas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {lowStock.slice(0, 4).map((product) => {
              const available = product.physicalStock - product.reservedStock;
              return (
                <div key={product.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="truncate">
                      {product.name} {product.variant}
                    </span>
                    <b>{available}</b>
                  </div>
                  <Progress
                    value={Math.min(100, available * 8)}
                    className="h-1.5"
                  />
                </div>
              );
            })}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("stock")}
            >
              Abrir inventario
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssistedSale({
  products,
  orders,
  setOrders,
  setProducts,
}: {
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [salonId, setSalonId] = React.useState("salon-griselda");
  const [query, setQuery] = React.useState("");
  const [cart, setCart] = React.useState<Record<string, number>>({
    "q-101-1": 2,
  });
  const [paid, setPaid] = React.useState("0");
  const [immediate, setImmediate] = React.useState(true);
  const salon = demoSalons.find((item) => item.id === salonId)!;
  const selected = products.filter((product) => cart[product.id]);
  const total = selected.reduce(
    (sum, product) => sum + product.professionalPrice * cart[product.id],
    0,
  );
  const filtered = products.filter((product) =>
    `${product.name} ${product.variant}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const add = (productId: string) =>
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  const save = async () => {
    if (!selected.length) return toast.error("Agregá al menos un producto");
    const order: Order = {
      id: `QP-${1843 + orders.length}`,
      type: "b2b",
      source: "assisted",
      salonId: salon.id,
      salonName: salon.name,
      customerName: salon.owner,
      products: selected
        .map(
          (product) =>
            `${product.name} ${product.variant} × ${cart[product.id]}`,
        )
        .join(" · "),
      itemCount: Object.values(cart).reduce((sum, qty) => sum + qty, 0),
      deliveryMode: "salon",
      deliveryAddress: salon.address,
      status: immediate ? "delivered" : "confirmed",
      paymentMethod: "current_account",
      paymentStatus:
        Number(paid) * 100 >= total
          ? "paid"
          : immediate
            ? "charged_to_salon"
            : "pending",
      total,
      commission: 0,
      createdAt: new Date().toISOString(),
    };
    setOrders((current) => [order, ...current]);
    if (immediate)
      setProducts((current) =>
        current.map((product) =>
          cart[product.id]
            ? {
                ...product,
                physicalStock: Math.max(
                  0,
                  product.physicalStock - cart[product.id],
                ),
              }
            : product,
        ),
      );
    void postAction({
      action: "create_assisted_sale",
      salonId,
      recipientName: salon.owner,
      deliveryAddress: salon.address,
      deliveryTiming: immediate ? "immediate" : "later",
      amountPaid: Number(paid) * 100,
      items: selected.map((product) => ({
        productId: product.id,
        quantity: cart[product.id],
        unitPrice: product.professionalPrice,
      })),
    });
    setCart({});
    toast.success("Venta registrada y cuenta corriente actualizada");
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
      <div className="space-y-5">
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Peluquería</Label>
              <Select value={salonId} onValueChange={setSalonId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {demoSalons.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                      {!item.hasAccess ? " · sin acceso" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-[#f3f3ed] px-4 py-3 text-sm">
              <div className="font-medium">{salon.owner}</div>
              <div className="text-black/45">
                {salon.address} · Saldo {formatMoney(salon.balance)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-black/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar producto, tono o presentación"
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {filtered.slice(0, 10).map((product) => (
              <button
                key={product.id}
                onClick={() => add(product.id)}
                className="flex items-center gap-3 rounded-xl border border-black/7 p-3 text-left transition hover:border-black/20 hover:bg-[#fafaf6]"
              >
                <div className="h-16 w-14 overflow-hidden rounded-lg bg-[#f2f2ed]">
                  <EmptyProductImage product={product} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {product.name}
                  </div>
                  <div className="truncate text-xs text-black/45">
                    {product.variant} · Disponible{" "}
                    {product.physicalStock - product.reservedStock}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {formatMoney(product.professionalPrice)}
                  </div>
                </div>
                <Plus className="size-4" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="h-fit border-0 bg-[#1d1f19] text-white shadow-sm xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>Detalle de la venta</CardTitle>
          <CardDescription className="text-white/45">
            Precio profesional único.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            {selected.length ? (
              selected.map((product) => (
                <div key={product.id} className="flex gap-3 text-sm">
                  <span className="flex-1">
                    <b className="font-medium">{product.name}</b>
                    <span className="block text-xs text-white/40">
                      {product.variant}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7 border-white/15 bg-transparent text-white hover:bg-white/10"
                      onClick={() =>
                        setCart((current) => ({
                          ...current,
                          [product.id]: Math.max(0, current[product.id] - 1),
                        }))
                      }
                    >
                      −
                    </Button>
                    <b>{cart[product.id]}</b>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7 border-white/15 bg-transparent text-white hover:bg-white/10"
                      onClick={() => add(product.id)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-white/40">
                Agregá productos desde el catálogo.
              </p>
            )}
          </div>
          <Separator className="bg-white/10" />
          <div className="flex items-end justify-between">
            <span className="text-sm text-white/45">Total</span>
            <b className="text-3xl tracking-tight">{formatMoney(total)}</b>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div>
              <div className="text-sm font-medium">Entrega inmediata</div>
              <div className="text-xs text-white/40">
                Descuenta stock y debita la cuenta
              </div>
            </div>
            <Switch checked={immediate} onCheckedChange={setImmediate} />
          </div>
          <div className="space-y-2">
            <Label>Monto recibido ahora</Label>
            <Input
              value={paid}
              onChange={(event) => setPaid(event.target.value)}
              type="number"
              className="border-white/15 bg-white/5 text-white"
            />
          </div>
          <Button
            onClick={save}
            className="w-full bg-[#c8e44f] text-black hover:bg-[#b7d33d]"
          >
            Confirmar venta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Deliveries({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const update = (order: Order, status: Order["status"]) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status,
              paymentStatus:
                status === "delivered" && item.paymentMethod === "cash"
                  ? item.deliveryMode === "salon"
                    ? "charged_to_salon"
                    : "paid"
                  : item.paymentStatus,
            }
          : item,
      ),
    );
    void postAction({
      action: "update_order_status",
      orderId: order.id,
      status,
    });
    toast.success(
      status === "delivered"
        ? "Entrega confirmada y stock actualizado"
        : "Estado actualizado",
    );
  };
  const groups = [
    {
      id: "salon",
      label: "Entregar en peluquerías",
      items: orders.filter(
        (order) =>
          order.deliveryMode === "salon" && order.status !== "delivered",
      ),
    },
    {
      id: "home",
      label: "Entregar a clientes",
      items: orders.filter(
        (order) =>
          order.deliveryMode === "home" && order.status !== "delivered",
      ),
    },
    {
      id: "done",
      label: "Entregados",
      items: orders.filter((order) => order.status === "delivered"),
    },
  ];
  return (
    <Tabs defaultValue="salon">
      <TabsList className="mb-5 h-auto flex-wrap bg-white p-1">
        {groups.map((group) => (
          <TabsTrigger key={group.id} value={group.id}>
            {group.label}{" "}
            <Badge variant="secondary" className="ml-2">
              {group.items.length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {groups.map((group) => (
        <TabsContent key={group.id} value={group.id}>
          <Card className="border-0 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Productos
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                      <span className="block text-xs font-normal text-black/35">
                        {order.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <b className="font-medium">{order.customerName}</b>
                      <span className="block max-w-48 truncate text-xs text-black/40">
                        {order.deliveryAddress}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-72 truncate lg:table-cell">
                      {order.products}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(order.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status !== "delivered" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            update(
                              order,
                              order.status === "in_transit"
                                ? "delivered"
                                : "in_transit",
                            )
                          }
                          className="bg-black text-white"
                        >
                          {order.status === "in_transit"
                            ? "Confirmar entrega"
                            : "Enviar"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StockView({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [query, setQuery] = React.useState("");
  const [preview, setPreview] = React.useState<
    Array<{ productId: string; product: string; quantity: number }>
  >([]);
  const [open, setOpen] = React.useState(false);
  const filtered = products.filter((product) =>
    `${product.name} ${product.variant} ${product.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const readFile = async (file: File) => {
    const workbook = XLSX.read(await file.arrayBuffer());
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows =
      XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
    const parsed = rows
      .map((row) => {
        const key = String(
          row.producto ??
            row.Producto ??
            row.sku ??
            row.SKU ??
            row.id ??
            row.ID ??
            "",
        ).toLowerCase();
        const product = products.find(
          (item) =>
            item.id.toLowerCase() === key ||
            item.sku.toLowerCase() === key ||
            `${item.name} ${item.variant}`.toLowerCase().includes(key),
        );
        return product
          ? {
              productId: product.id,
              product: `${product.name} ${product.variant}`,
              quantity: Number(
                row.cantidad ?? row.Cantidad ?? row.stock ?? row.Stock ?? 0,
              ),
            }
          : null;
      })
      .filter(
        (
          row,
        ): row is { productId: string; product: string; quantity: number } =>
          Boolean(row && row.quantity > 0),
      );
    setPreview(parsed);
    if (!parsed.length)
      toast.error(
        "No encontramos filas válidas. Usá columnas Producto/SKU e Cantidad.",
      );
  };
  const importRows = () => {
    setProducts((current) =>
      current.map((product) => {
        const row = preview.find((item) => item.productId === product.id);
        return row
          ? { ...product, physicalStock: product.physicalStock + row.quantity }
          : product;
      }),
    );
    void postAction({
      action: "import_stock",
      rows: preview.map((row) => ({
        productId: row.productId,
        quantity: row.quantity,
      })),
    });
    toast.success(`${preview.length} variantes actualizadas`);
    setOpen(false);
    setPreview([]);
  };
  const exportTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet(
      products.map((product) => ({
        ID: product.id,
        SKU: product.sku,
        Producto: `${product.name} ${product.variant}`,
        Cantidad: 0,
      })),
    );
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Ingreso stock");
    XLSX.writeFile(book, "plantilla-ingreso-stock-question.xlsx");
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Unidades físicas"
          value={String(
            products.reduce((sum, item) => sum + item.physicalStock, 0),
          )}
          detail="Stock contado en depósito"
          icon={PackageOpen}
        />
        <MetricCard
          label="Unidades reservadas"
          value={String(
            products.reduce((sum, item) => sum + item.reservedStock, 0),
          )}
          detail="Pedidos confirmados sin entregar"
          icon={FileClock}
        />
        <MetricCard
          label="Stock disponible"
          value={String(
            products.reduce(
              (sum, item) => sum + item.physicalStock - item.reservedStock,
              0,
            ),
          )}
          detail="Lo que realmente podés vender"
          icon={PackageCheck}
          accent
        />
      </div>
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-black/35" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto o variante"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTemplate}>
              <Download className="size-4" /> Plantilla
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white">
                  <Upload className="size-4" /> Ingresar por Excel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar compra de mercadería</DialogTitle>
                  <DialogDescription>
                    El archivo debe incluir Producto o SKU y Cantidad. El
                    ingreso se suma al stock físico.
                  </DialogDescription>
                </DialogHeader>
                <Label
                  htmlFor="stock-file"
                  className="grid cursor-pointer place-items-center gap-2 rounded-xl border border-dashed border-black/20 p-8 text-center"
                >
                  <Upload className="size-6" />
                  <span>Elegir Excel o CSV</span>
                  <Input
                    id="stock-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    onChange={(event) =>
                      event.target.files?.[0] &&
                      void readFile(event.target.files[0])
                    }
                  />
                </Label>
                {preview.length > 0 && (
                  <div className="max-h-56 overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.map((row) => (
                          <TableRow key={row.productId}>
                            <TableCell>{row.product}</TableCell>
                            <TableCell>+{row.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button disabled={!preview.length} onClick={importRows}>
                    Confirmar ingreso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto / variante</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Físico</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const available = product.physicalStock - product.reservedStock;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-12 overflow-hidden rounded-lg bg-[#f1f1eb]">
                          <EmptyProductImage product={product} />
                        </div>
                        <div>
                          <b className="font-medium">{product.name}</b>
                          <span className="block text-xs text-black/45">
                            {product.variant} · {product.sku}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.physicalStock}</TableCell>
                    <TableCell>{product.reservedStock}</TableCell>
                    <TableCell className="font-semibold">{available}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          available <= 7
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }
                      >
                        {available <= 0
                          ? "Agotado"
                          : available <= 7
                            ? "Stock bajo"
                            : "Disponible"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SalonsView({
  ledger,
  setLedger,
}: {
  ledger: LedgerEntry[];
  setLedger: React.Dispatch<React.SetStateAction<LedgerEntry[]>>;
}) {
  const [selected, setSelected] = React.useState(demoSalons[0]);
  const [amount, setAmount] = React.useState("");
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const salonLedger = selected.id === "salon-lola" ? ledger : [];
  const register = () => {
    const cents = Number(amount) * 100;
    if (!cents) return;
    const entry: LedgerEntry = {
      id: `mov-${Date.now()}`,
      salonId: selected.id,
      date: new Date().toLocaleDateString("es-AR"),
      description: "Pago recibido",
      debit: 0,
      credit: cents,
      balance: selected.balance - cents,
      type: "payment",
    };
    if (selected.id === "salon-lola")
      setLedger((current) => [entry, ...current]);
    void postAction({
      action: "register_payment",
      salonId: selected.id,
      amount: cents,
    });
    toast.success("Pago registrado");
    setPaymentOpen(false);
    setAmount("");
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.45fr]">
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-black/35" />
            <Input placeholder="Buscar peluquería" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {demoSalons.map((salon) => (
            <button
              key={salon.id}
              onClick={() => setSelected(salon)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-3 text-left",
                selected.id === salon.id
                  ? "bg-[#eef4d3]"
                  : "hover:bg-black/[0.025]",
              )}
            >
              <div className="grid size-10 place-items-center rounded-full bg-black text-sm text-white">
                {salon.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{salon.name}</div>
                <div className="text-xs text-black/40">
                  {salon.hasAccess ? "Usa la app" : "Gestión interna"}
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  salon.balance < 0 && "text-emerald-700",
                )}
              >
                {formatMoney(salon.balance)}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {selected.name}
                  </h2>
                  <Badge variant="outline">
                    {selected.hasAccess ? "Con acceso" : "Sin acceso"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-black/45">
                  {selected.owner} · {selected.phone} · {selected.address}
                </p>
              </div>
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <CreditCard className="size-4" /> Registrar pago
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar pago de {selected.name}</DialogTitle>
                    <DialogDescription>
                      El crédito reduce automáticamente su deuda. Podrás
                      editarlo después si hubo un error.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label>Importe recibido</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={register}>Guardar pago</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f4f4ee] p-4">
                <div className="text-xs text-black/45">Saldo actual</div>
                <div className="mt-1 text-xl font-semibold">
                  {formatMoney(selected.balance)}
                </div>
              </div>
              <div className="rounded-xl bg-[#f4f4ee] p-4">
                <div className="text-xs text-black/45">Última compra</div>
                <div className="mt-1 text-xl font-semibold">
                  {selected.lastPurchase}
                </div>
              </div>
              <div className="rounded-xl bg-[#f4f4ee] p-4">
                <div className="text-xs text-black/45">Canal</div>
                <div className="mt-1 text-xl font-semibold">
                  {selected.hasAccess ? "Digital" : "Asistido"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cuenta corriente</CardTitle>
              <CardDescription>
                Edición directa habilitada con historial recuperable.
              </CardDescription>
            </div>
            <History className="size-5 text-black/35" />
          </CardHeader>
          <CardContent>
            {salonLedger.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Movimiento</TableHead>
                    <TableHead>Débito</TableHead>
                    <TableHead>Crédito</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salonLedger.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        {entry.debit ? formatMoney(entry.debit) : "—"}
                      </TableCell>
                      <TableCell>
                        {entry.credit ? formatMoney(entry.credit) : "—"}
                      </TableCell>
                      <TableCell>
                        <EditLedgerButton entry={entry} setLedger={setLedger} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-black/45">
                Todavía no hay movimientos cargados en esta demostración.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EditLedgerButton({
  entry,
  setLedger,
}: {
  entry: LedgerEntry;
  setLedger: React.Dispatch<React.SetStateAction<LedgerEntry[]>>;
}) {
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState(entry.description);
  const [debit, setDebit] = React.useState(String(entry.debit / 100));
  const [credit, setCredit] = React.useState(String(entry.credit / 100));

  const save = () => {
    const nextDebit = Math.max(0, Number(debit) * 100);
    const nextCredit = Math.max(0, Number(credit) * 100);
    setLedger((current) =>
      current.map((item) =>
        item.id === entry.id
          ? { ...item, description, debit: nextDebit, credit: nextCredit }
          : item,
      ),
    );
    void postAction({
      action: "edit_ledger",
      entryId: entry.id,
      description,
      debit: nextDebit,
      credit: nextCredit,
    });
    setOpen(false);
    toast.success("Movimiento corregido; la versión anterior quedó guardada");
  };

  const remove = () => {
    setLedger((current) => current.filter((item) => item.id !== entry.id));
    void postAction({ action: "delete_ledger", entryId: entry.id });
    setOpen(false);
    toast.success("Movimiento eliminado; puede recuperarse desde el historial");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Corregir movimiento</DialogTitle>
          <DialogDescription>
            El saldo se recalcula con el nuevo importe. La versión anterior
            queda registrada para poder recuperarla si fue un cambio accidental.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Débito</Label>
              <Input
                type="number"
                value={debit}
                onChange={(event) => setDebit(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Crédito</Label>
              <Input
                type="number"
                value={credit}
                onChange={(event) => setCredit(event.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="destructive" onClick={remove}>
            <Trash2 className="size-4" /> Eliminar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar corrección</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuestionReports({ orders }: { orders: Order[] }) {
  const b2c = orders.filter((order) => order.type === "b2c");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Facturación del período"
          value="$ 68,4 M"
          detail="+18% contra período anterior"
          icon={BadgeDollarSign}
          accent
        />
        <MetricCard
          label="Pedidos profesionales"
          value="42"
          detail="Ticket promedio $1,26 M"
          icon={ShoppingCart}
        />
        <MetricCard
          label="Ventas cliente final"
          value={String(b2c.length)}
          detail="74% originadas por peluquerías"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Comisiones acreditadas"
          value={formatMoney(b2c.reduce((s, o) => s + o.commission, 0))}
          detail="Peluquerías e influencers"
          icon={Gift}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Ventas por canal</CardTitle>
            <CardDescription>Millones de pesos por semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[300px] w-full"
              config={{
                profesional: { label: "Profesional", color: "#181914" },
                final: { label: "Cliente final", color: "#c8e44f" },
              }}
            >
              <BarChart
                data={[
                  { w: "Sem 1", profesional: 39, final: 8 },
                  { w: "Sem 2", profesional: 44, final: 11 },
                  { w: "Sem 3", profesional: 41, final: 14 },
                  { w: "Sem 4", profesional: 53, final: 17 },
                ]}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="w" axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="profesional"
                  fill="var(--color-profesional)"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="final"
                  fill="var(--color-final)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Peluquerías a reactivar</CardTitle>
            <CardDescription>
              Sin compras en los últimos 30 días.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoSalons.slice(0, 4).map((salon, index) => (
              <div
                key={salon.id}
                className="flex items-center gap-3 rounded-xl border border-black/6 p-3"
              >
                <div className="grid size-9 place-items-center rounded-full bg-[#f1f1eb] font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{salon.name}</div>
                  <div className="text-xs text-black/40">
                    Última compra {salon.lastPurchase}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Contactar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsView() {
  const [freeShipping, setFreeShipping] = React.useState("45000");
  const [flatFee, setFlatFee] = React.useState("4500");
  const sync = async () => {
    const loading = toast.loading("Sincronizando QuestionColor.com.ar…");
    try {
      const response = await fetch("/api/catalog/sync", { method: "POST" });
      const data = (await response.json()) as {
        variants?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error);
      toast.success(`${data.variants ?? 0} variantes sincronizadas`, {
        id: loading,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo sincronizar",
        { id: loading },
      );
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Ventas al cliente final</CardTitle>
          <CardDescription>
            Reglas de entrega en La Plata y alrededores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Mínimo para envío gratis</Label>
            <Input
              value={freeShipping}
              onChange={(e) => setFreeShipping(e.target.value)}
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label>Tarifa fija debajo del mínimo</Label>
            <Input
              value={flatFee}
              onChange={(e) => setFlatFee(e.target.value)}
              type="number"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#f3f3ed] p-4">
            <div>
              <div className="text-sm font-medium">
                Retiro gratuito en peluquería
              </div>
              <div className="text-xs text-black/45">
                Solo para ventas atribuidas a ese salón
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Button onClick={() => toast.success("Configuración guardada")}>
            Guardar reglas
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Catálogo oficial</CardTitle>
            <CardDescription>
              Importa productos y expande tonos/presentaciones como variantes
              individuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={sync}>
              <RefreshCw className="size-4" /> Sincronizar QuestionColor
            </Button>
            <p className="mt-3 text-xs leading-5 text-black/45">
              La sincronización conserva el precio profesional y el stock que
              hayas cargado.
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Integraciones</CardTitle>
            <CardDescription>
              Se activan al configurar credenciales en el servidor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <IntegrationRow
              icon={CreditCard}
              name="Mercado Pago"
              detail="Checkout y confirmación por webhook"
            />
            <IntegrationRow
              icon={MessageCircle}
              name="WhatsApp Business"
              detail="Recordatorios 24 h antes de cada turno"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IntegrationRow({
  icon: Icon,
  name,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/7 p-3">
      <span className="grid size-10 place-items-center rounded-lg bg-[#edf4cc]">
        <Icon className="size-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-black/40">{detail}</div>
      </div>
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-50 text-amber-800"
      >
        Configurar
      </Badge>
    </div>
  );
}

function SalonHome({
  appointments,
  orders,
  navigate,
}: {
  appointments: Appointment[];
  orders: Order[];
  navigate: (section: string) => void;
}) {
  const salonOrders = orders.filter((order) => order.salonId === "salon-lola");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Turnos de hoy"
          value={String(
            appointments.filter((a) => a.startsAt.startsWith("2026-08-28"))
              .length,
          )}
          detail="10 h 30 min de trabajo"
          icon={CalendarDays}
          accent
        />
        <MetricCard
          label="Próximo turno"
          value="09:00"
          detail="Julieta · Color completo"
          icon={Clock3}
        />
        <MetricCard
          label="Ocupación"
          value="78%"
          detail="6 espacios libres esta semana"
          icon={BarChart3}
        />
        <MetricCard
          label="Comisión del mes"
          value="$ 84.700"
          detail="Crédito automático en tu cuenta"
          icon={Gift}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Agenda de hoy</CardTitle>
              <CardDescription>Viernes 28 de agosto</CardDescription>
            </div>
            <Button size="sm" onClick={() => navigate("agenda")}>
              <Plus className="size-4" /> Nuevo turno
            </Button>
          </CardHeader>
          <CardContent>
            <AppointmentList appointments={appointments.slice(0, 4)} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border-0 bg-[#1d1f19] text-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-[#c8e44f]" /> Tu módulo
                Question
              </CardTitle>
              <CardDescription className="text-white/45">
                Compras y cuenta corriente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Saldo actual</span>
                <b>{formatMoney(8200000)}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">
                  Pedido en preparación
                </span>
                <b>
                  {salonOrders.filter((o) => o.status !== "delivered").length}
                </b>
              </div>
              <Button
                onClick={() => navigate("question-module")}
                className="w-full bg-[#c8e44f] text-black hover:bg-[#b7d33d]"
              >
                Abrir Question
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e2f0fb]">
                <Link2 className="size-5" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">Tu enlace de reservas</div>
                <div className="text-xs text-black/40">
                  question.pro/lola-estudio
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    "https://question.pro/lola-estudio",
                  );
                  toast.success("Enlace copiado");
                }}
              >
                Copiar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AppointmentList({
  appointments,
  onUpdate,
}: {
  appointments: Appointment[];
  onUpdate?: (id: string, status: Appointment["status"]) => void;
}) {
  return (
    <div className="divide-y divide-black/5">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex items-center gap-4 py-4">
          <div className="w-14 text-sm font-semibold">
            {new Date(appointment.startsAt).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Argentina/Buenos_Aires",
            })}
          </div>
          <div
            className="h-10 w-1 rounded-full"
            style={{
              background:
                appointment.professionalName === "Laura"
                  ? "#b7d33d"
                  : appointment.professionalName === "Valentina"
                    ? "#fc7d65"
                    : "#7e9fe8",
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{appointment.customerName}</div>
            <div className="text-xs text-black/45">
              {appointment.serviceName} · {appointment.professionalName} ·{" "}
              {appointment.durationMinutes} min
            </div>
          </div>
          <StatusBadge status={appointment.status} />
          {onUpdate && appointment.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(appointment.id, "completed")}
            >
              <Check className="size-4" /> Completar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function AgendaView({
  appointments,
  setAppointments,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}) {
  const [open, setOpen] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [serviceId, setServiceId] = React.useState("srv-corte");
  const update = (id: string, status: Appointment["status"]) => {
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    void postAction({
      action: "update_appointment_status",
      appointmentId: id,
      status,
    });
    toast.success("Turno actualizado");
  };
  const create = async () => {
    const service = demoServices.find((item) => item.id === serviceId)!;
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      salonId: "salon-lola",
      customerId: `c-${Date.now()}`,
      customerName: customerName || "Nueva clienta",
      professionalId: "pro-laura",
      professionalName: "Laura",
      serviceId,
      serviceName: service.name,
      startsAt: "2026-08-29T16:00:00-03:00",
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: "confirmed",
      reminderStatus: "pending",
    };
    const response = await postAction({
      action: "create_appointment",
      appointmentId: appointment.id,
      salonId: appointment.salonId,
      customerId: appointment.customerId,
      customerName: appointment.customerName,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      startsAt: appointment.startsAt,
      durationMinutes: appointment.durationMinutes,
      price: appointment.price,
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      toast.error(result.error ?? "No se pudo crear el turno");
      return;
    }
    setAppointments((current) => [...current, appointment]);
    toast.success("Turno creado sin superposición");
    setOpen(false);
  };
  const sendReminders = async () => {
    const response = await fetch("/api/integrations/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "5492215554051",
        customerName: "Julieta",
        salonName: "Lola Estudio",
        appointmentDate: "mañana a las 11:00",
        manageUrl: "https://question.pro/t/apt-5",
      }),
    });
    const result = (await response.json()) as { demo?: boolean };
    toast.success(
      result.demo
        ? "Vista previa generada; faltan credenciales para enviar"
        : "Recordatorio enviado",
    );
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Viernes 28</CardTitle>
            <CardDescription>
              3 profesionales · 4 turnos confirmados
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Crear turno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo turno</DialogTitle>
                <DialogDescription>
                  El sistema solo ofrecerá horarios compatibles con la duración.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre y apellido"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servicio</Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {demoServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} · {service.durationMinutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="date" defaultValue="2026-08-29" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" defaultValue="16:00" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={create}>Confirmar turno</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={appointments.filter((appointment) =>
              appointment.startsAt.startsWith("2026-08-28"),
            )}
            onUpdate={update}
          />
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="border-0 bg-[#c8e44f] shadow-sm">
          <CardContent className="p-5">
            <MessageCircle className="mb-5 size-7" />
            <h3 className="text-lg font-semibold">Recordatorios automáticos</h3>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Mañana hay 1 turno. El cliente podrá confirmar, reprogramar o
              cancelar por WhatsApp.
            </p>
            <Button
              onClick={sendReminders}
              className="mt-5 w-full bg-black text-white"
            >
              Probar recordatorio
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Equipo hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { n: "Laura", c: "#b7d33d", h: "6 h" },
              { n: "Valentina", c: "#fc7d65", h: "4 h 30" },
              { n: "Lucía", c: "#7e9fe8", h: "3 h 45" },
            ].map((p) => (
              <div key={p.n} className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ background: p.c }}
                />
                <span className="flex-1 text-sm">{p.n}</span>
                <b className="text-sm">{p.h}</b>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientsView() {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Clientes registrados automáticamente</CardTitle>
          <CardDescription>
            La identidad se consolida por teléfono; el acceso al historial
            utiliza un código.
          </CardDescription>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-black/35" />
          <Input placeholder="Buscar cliente" className="pl-9" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Visitas</TableHead>
              <TableHead>Gastado</TableHead>
              <TableHead>Promociones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <b className="font-medium">{customer.name}</b>
                  <span className="block text-xs text-black/40">
                    {customer.email || "Sin email"}
                  </span>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.visits}</TableCell>
                <TableCell>{formatMoney(customer.spent)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      customer.marketingConsent
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : ""
                    }
                  >
                    {customer.marketingConsent ? "Aceptó" : "No aceptó"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SalonReports() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Turnos realizados"
          value="135"
          detail="+12% contra julio"
          icon={ClipboardCheck}
          accent
        />
        <MetricCard
          label="Horas trabajadas"
          value="92 h"
          detail="Entre 3 profesionales"
          icon={Clock3}
        />
        <MetricCard
          label="Ocupación"
          value="76%"
          detail="24% de capacidad disponible"
          icon={BarChart3}
        />
        <MetricCard
          label="Cancelaciones"
          value="8"
          detail="5,6% de los turnos"
          icon={CalendarDays}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Actividad semanal</CardTitle>
            <CardDescription>Turnos atendidos por día.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[300px] w-full"
              config={{ turnos: { label: "Turnos", color: "#181914" } }}
            >
              <BarChart data={weeklyReportData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="turnos"
                  fill="var(--color-turnos)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Servicios más realizados</CardTitle>
            <CardDescription>Ranking del período seleccionado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceReportData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#f1f1eb] text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm">{item.name}</span>
                <b>{item.value}</b>
                <div className="w-24">
                  <Progress value={(item.value / 46) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuestionModule({
  products,
  orders,
  ledger,
}: {
  products: Product[];
  orders: Order[];
  ledger: LedgerEntry[];
}) {
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [query, setQuery] = React.useState("");
  const visible = products.filter((p) =>
    `${p.name} ${p.variant}`.toLowerCase().includes(query.toLowerCase()),
  );
  const total = products.reduce(
    (sum, p) => sum + (cart[p.id] ?? 0) * p.professionalPrice,
    0,
  );
  const sendOrder = async () => {
    const selected = products.filter((product) => cart[product.id]);
    const response = await postAction({
      action: "create_assisted_sale",
      source: "salon_app",
      salonId: "salon-lola",
      recipientName: "Laura Méndez",
      deliveryAddress: "Diagonal 74 1120, La Plata",
      deliveryTiming: "later",
      notes: selected
        .map(
          (product) =>
            `${product.name} ${product.variant} × ${cart[product.id]}`,
        )
        .join(" · "),
      items: selected.map((product) => ({
        productId: product.id,
        quantity: cart[product.id],
        unitPrice: product.professionalPrice,
      })),
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      toast.error(result.error ?? "No se pudo enviar el pedido");
      return;
    }
    setCart({});
    toast.success("Pedido guardado y enviado a Question");
  };
  return (
    <Tabs defaultValue="catalog">
      <TabsList className="mb-5 h-auto flex-wrap bg-white p-1">
        <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        <TabsTrigger value="orders">Mis pedidos</TabsTrigger>
        <TabsTrigger value="account">Estado de cuenta</TabsTrigger>
      </TabsList>
      <TabsContent value="catalog">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-black/35" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por producto, tono o presentación"
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-black/7"
                >
                  <div className="h-36 bg-[#f2f2ed]">
                    <EmptyProductImage product={product} />
                  </div>
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2 text-[10px]">
                      {product.category}
                    </Badge>
                    <div className="line-clamp-1 text-sm font-medium">
                      {product.name}
                    </div>
                    <div className="text-xs text-black/45">
                      {product.variant}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <b>{formatMoney(product.professionalPrice)}</b>
                      <Button
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          setCart((c) => ({
                            ...c,
                            [product.id]: (c[product.id] ?? 0) + 1,
                          }))
                        }
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="h-fit border-0 bg-[#1d1f19] text-white shadow-sm xl:sticky xl:top-24">
            <CardHeader>
              <CardTitle>Tu pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.values(cart).some(Boolean) ? (
                <div className="space-y-3">
                  {products
                    .filter((p) => cart[p.id])
                    .map((p) => (
                      <div key={p.id} className="flex gap-2 text-sm">
                        <span className="flex-1">
                          {p.name} {p.variant}
                        </span>
                        <b>× {cart[p.id]}</b>
                      </div>
                    ))}
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <b>{formatMoney(total)}</b>
                  </div>
                  <Button
                    className="w-full bg-[#c8e44f] text-black"
                    onClick={() => void sendOrder()}
                  >
                    Enviar pedido
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-white/40">
                  Todavía no agregaste productos.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="orders">
        <Card className="border-0 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders
                .filter((o) => o.salonId === "salon-lola" || o.type === "b2b")
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.products}</TableCell>
                    <TableCell>{formatMoney(order.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
      <TabsContent value="account">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-0 bg-[#c8e44f] shadow-sm">
            <CardContent className="p-6">
              <div className="text-sm text-black/55">Saldo actual</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight">
                {formatMoney(8200000)}
              </div>
              <p className="mt-4 text-sm text-black/55">
                Las comisiones reducen automáticamente esta deuda. Si queda
                saldo a favor, podés solicitar el pago.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Movimiento</TableHead>
                  <TableHead>Débito</TableHead>
                  <TableHead>Crédito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      {entry.debit ? formatMoney(entry.debit) : "—"}
                    </TableCell>
                    <TableCell>
                      {entry.credit ? formatMoney(entry.credit) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function DriverView({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const pending = orders.filter((o) => o.status !== "delivered");
  const complete = (order: Order) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: "delivered",
              paymentStatus:
                item.paymentMethod === "cash"
                  ? item.deliveryMode === "salon"
                    ? "charged_to_salon"
                    : "paid"
                  : item.paymentStatus,
            }
          : item,
      ),
    );
    void postAction({
      action: "update_order_status",
      orderId: order.id,
      status: "delivered",
    });
    toast.success(
      order.deliveryMode === "salon" && order.paymentMethod === "cash"
        ? "Entrega confirmada; importe sumado a la cuenta del salón"
        : "Entrega y cobro confirmados",
    );
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {pending.map((order, index) => (
        <Card key={order.id} className="border-0 bg-white shadow-sm">
          <CardHeader className="flex-row items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-lg font-semibold text-white">
              {index + 1}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{order.customerName}</CardTitle>
              <CardDescription>{order.deliveryAddress}</CardDescription>
            </div>
            <StatusBadge status={order.paymentStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-[#f3f3ed] p-4">
              <div className="text-sm">{order.products}</div>
              <div className="mt-3 flex justify-between">
                <span className="text-sm text-black/45">
                  A cobrar / acreditar
                </span>
                <b>{formatMoney(order.total)}</b>
              </div>
            </div>
            {order.deliveryMode === "salon" &&
              order.paymentMethod === "cash" && (
                <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  Al dejarlo en el salón, el pedido se suma a su cuenta
                  corriente aunque el cliente todavía no lo haya retirado.
                </p>
              )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Route className="size-4" /> Ver mapa
              </Button>
              <Button
                className="flex-1 bg-[#c8e44f] text-black hover:bg-[#b7d33d]"
                onClick={() => complete(order)}
              >
                <PackageCheck className="size-4" /> Entregado
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InfluencerView({
  orders,
  active,
}: {
  orders: Order[];
  active: string;
}) {
  const sales = orders.filter((order) => order.influencerId === "inf-mica");
  const commission = sales.reduce((sum, order) => sum + order.commission, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Ventas atribuidas"
          value={String(sales.length)}
          detail="Desde tu enlace exclusivo"
          icon={ShoppingBag}
          accent
        />
        <MetricCard
          label="Importe vendido"
          value={formatMoney(sales.reduce((s, o) => s + o.total, 0))}
          detail="Productos de uso domiciliario"
          icon={BadgeDollarSign}
        />
        <MetricCard
          label="Comisión pendiente"
          value={formatMoney(commission)}
          detail="Pago manual por Question"
          icon={CircleDollarSign}
        />
      </div>
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>
              {active === "influencer-commission"
                ? "Movimientos de comisión"
                : "Ventas recientes"}
            </CardTitle>
            <CardDescription>
              Comisión configurable por influencer y producto.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(
                "https://question.pro/r/mica-beauty",
              );
              toast.success("Enlace copiado");
            }}
          >
            <Link2 className="size-4" /> Copiar enlace
          </Button>
        </CardHeader>
        <CardContent>
          {sales.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.products}</TableCell>
                    <TableCell>{formatMoney(sale.total)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatMoney(sale.commission)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sale.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center text-sm text-black/45">
              Todavía no hay ventas atribuidas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PublicBrand() {
  return (
    <div className="mb-7 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-full bg-[#fc7d65] font-serif text-xl font-bold text-white">
          L
        </div>
        <div>
          <div className="font-semibold">Lola Estudio</div>
          <div className="text-xs text-black/45">
            Diagonal 74 1120 · La Plata
          </div>
        </div>
      </div>
      <Badge variant="outline" className="hidden sm:flex">
        Por Question Professional
      </Badge>
    </div>
  );
}

function PublicBooking({
  setAppointments,
}: {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}) {
  const [step, setStep] = React.useState(1);
  const [serviceId, setServiceId] = React.useState("srv-corte");
  const [time, setTime] = React.useState("11:30");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [marketingConsent, setMarketingConsent] = React.useState(false);
  const confirm = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Completá tu nombre y WhatsApp");
      return;
    }
    const service = demoServices.find((item) => item.id === serviceId)!;
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      salonId: "salon-lola",
      customerId: `c-${Date.now()}`,
      customerName: name,
      professionalId: "pro-laura",
      professionalName: "Laura",
      serviceId,
      serviceName: service.name,
      startsAt: `2026-08-29T${time}:00-03:00`,
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: "confirmed",
      reminderStatus: "pending",
    };
    const response = await postAction({
      action: "create_appointment",
      appointmentId: appointment.id,
      salonId: appointment.salonId,
      customerId: appointment.customerId,
      customerName: name,
      customerPhone: phone,
      marketingConsent,
      professionalId: appointment.professionalId,
      serviceId,
      startsAt: appointment.startsAt,
      durationMinutes: appointment.durationMinutes,
      price: appointment.price,
    });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      toast.error(result.error ?? "No se pudo confirmar el turno");
      return;
    }
    setAppointments((current) => [...current, appointment]);
    setStep(4);
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PublicBrand />
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-5 md:p-8">
          <div className="mb-8 flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-xs font-semibold",
                    step >= n
                      ? "bg-black text-white"
                      : "bg-[#eeeef0] text-black/35",
                  )}
                >
                  {step > n ? <Check className="size-4" /> : n}
                </div>
                {n < 3 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      step > n ? "bg-black" : "bg-black/10",
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold">¿Qué servicio querés?</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {demoServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setServiceId(service.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left",
                      serviceId === service.id
                        ? "border-black bg-[#eef4d3]"
                        : "border-black/8",
                    )}
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="mt-1 text-xs text-black/45">
                      {service.durationMinutes} min · desde{" "}
                      {formatMoney(service.price)}
                    </div>
                  </button>
                ))}
              </div>
              <Button className="mt-6 w-full" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold">Elegí un horario</h2>
              <p className="mt-1 text-sm text-black/45">
                Sábado 29 de agosto · Cualquier profesional
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {[
                  "09:00",
                  "10:15",
                  "11:30",
                  "14:00",
                  "15:15",
                  "16:30",
                  "17:45",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setTime(item)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm",
                      time === item
                        ? "border-black bg-black text-white"
                        : "border-black/10",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Volver
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continuar
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold">Tus datos</h2>
              <p className="mt-1 text-sm text-black/45">
                No necesitás crear una contraseña.
              </p>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre y apellido</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="221 555-0000"
                  />
                </div>
                <label className="flex gap-3 rounded-xl bg-[#f3f3ed] p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) =>
                      setMarketingConsent(event.target.checked)
                    }
                  />{" "}
                  Quiero recibir promociones de Lola Estudio y Question.
                </label>
              </div>
              <Button
                className="mt-6 w-full bg-[#c8e44f] text-black"
                onClick={confirm}
              >
                Confirmar turno
              </Button>
            </div>
          )}
          {step === 4 && (
            <div className="py-8 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#c8e44f]">
                <Check className="size-7" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">
                ¡Turno confirmado!
              </h2>
              <p className="mt-2 text-sm text-black/45">
                Te esperamos el sábado a las {time}. Un día antes vas a recibir
                el recordatorio por WhatsApp.
              </p>
              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#f3f3ed] p-4 text-left text-sm">
                Desde el mensaje podrás <b>confirmar, reprogramar o cancelar</b>
                .
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PublicShop({
  products,
  orders,
  setOrders,
}: {
  products: Product[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}) {
  const home = products.filter((product) => product.b2cEnabled);
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const [open, setOpen] = React.useState(false);
  const [delivery, setDelivery] = React.useState("salon");
  const [payment, setPayment] = React.useState("mercadopago");
  const total = home.reduce((s, p) => s + (cart[p.id] ?? 0) * p.publicPrice, 0);
  const shipping = delivery === "home" && total < 4500000 ? 450000 : 0;
  const buy = async () => {
    const selected = home.filter((p) => cart[p.id]);
    if (!selected.length) return;
    const orderId = `QP-${1845 + orders.length}`;
    const commission = selected.reduce(
      (sum, p) =>
        sum + (p.publicPrice - p.professionalPrice) * (cart[p.id] ?? 0),
      0,
    );
    const persistence = await postAction({
      action: "create_b2c_order",
      orderId,
      source: "salon_link",
      salonId: "salon-lola",
      customerName: "Cliente nuevo",
      deliveryMode: delivery,
      deliveryAddress:
        delivery === "salon" ? "Lola Estudio" : "Domicilio del cliente",
      paymentMethod: payment,
      shippingFee: shipping,
      notes: selected.map((p) => `${p.name} × ${cart[p.id]}`).join(" · "),
      items: selected.map((p) => ({
        productId: p.id,
        quantity: cart[p.id],
        unitPrice: p.publicPrice,
        commission: p.publicPrice - p.professionalPrice,
      })),
    });
    if (!persistence.ok) {
      const result = (await persistence.json()) as { error?: string };
      toast.error(result.error ?? "No se pudo guardar el pedido");
      return;
    }
    const persisted = (await persistence.json()) as { demoPaid?: boolean };
    const order: Order = {
      id: orderId,
      type: "b2c",
      source: "salon_link",
      salonId: "salon-lola",
      salonName: "Lola Estudio",
      customerName: "Cliente nuevo",
      products: selected.map((p) => `${p.name} × ${cart[p.id]}`).join(" · "),
      itemCount: Object.values(cart).reduce((s, q) => s + q, 0),
      deliveryMode: delivery as "salon" | "home",
      deliveryAddress:
        delivery === "salon" ? "Lola Estudio" : "Domicilio del cliente",
      status: "confirmed",
      paymentMethod: payment as "mercadopago" | "cash",
      paymentStatus:
        payment === "mercadopago" && persisted.demoPaid !== false
          ? "paid"
          : "pending",
      total: total + shipping,
      commission,
      createdAt: new Date().toISOString(),
    };
    setOrders((c) => [order, ...c]);
    if (payment === "mercadopago") {
      const paymentResponse = await fetch("/api/integrations/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: selected.map((p) => ({
            id: p.id,
            title: `${p.name} ${p.variant}`,
            quantity: cart[p.id],
            unitPrice: p.publicPrice,
          })),
        }),
      });
      const paymentResult = (await paymentResponse.json()) as {
        demo?: boolean;
        checkoutUrl?: string;
      };
      if (!paymentResult.demo && paymentResult.checkoutUrl) {
        window.location.assign(paymentResult.checkoutUrl);
        return;
      }
    }
    toast.success(
      payment === "mercadopago"
        ? "Pago de prueba aprobado y comisión acreditada a Lola"
        : "Pedido guardado; el cobro se confirma en la entrega",
    );
    setOpen(false);
    setCart({});
  };
  return (
    <div className="mx-auto max-w-6xl">
      <PublicBrand />
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-black/45">
          Solo productos marcados para uso domiciliario.
        </p>
        <Button onClick={() => setOpen(true)}>
          <ShoppingCart className="size-4" /> Carrito (
          {Object.values(cart).reduce((s, q) => s + q, 0)})
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {home.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden border-0 bg-white shadow-sm"
          >
            <div className="h-48 bg-[#f0f0e9]">
              <EmptyProductImage product={product} />
            </div>
            <CardContent className="p-5">
              <div className="text-sm font-medium">{product.name}</div>
              <div className="text-xs text-black/45">{product.variant}</div>
              <div className="mt-4 flex items-center justify-between">
                <b className="text-lg">{formatMoney(product.publicPrice)}</b>
                <Button
                  size="sm"
                  onClick={() =>
                    setCart((c) => ({
                      ...c,
                      [product.id]: (c[product.id] ?? 0) + 1,
                    }))
                  }
                >
                  <Plus className="size-4" /> Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar compra</DialogTitle>
            <DialogDescription>
              La compra está asociada a Lola Estudio. Question prepara y entrega
              el pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {home
              .filter((p) => cart[p.id])
              .map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span>
                    {p.name} {p.variant} × {cart[p.id]}
                  </span>
                  <b>{formatMoney(p.publicPrice * cart[p.id])}</b>
                </div>
              ))}
            <Separator />
            <div className="space-y-2">
              <Label>Entrega</Label>
              <Select value={delivery} onValueChange={setDelivery}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Retiro en Lola · gratis</SelectItem>
                  <SelectItem value="home">Envío a domicilio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pago</Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercadopago">
                    Mercado Pago dentro de la web
                  </SelectItem>
                  <SelectItem value="cash">Efectivo en la entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <b>{formatMoney(shipping)}</b>
              </div>
            )}
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <b>{formatMoney(total + shipping)}</b>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!total}
              className="w-full bg-[#c8e44f] text-black"
              onClick={() => void buy()}
            >
              Confirmar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PublicHistory() {
  return (
    <div className="mx-auto max-w-md">
      <PublicBrand />
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-7 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef4d3]">
            <MessageCircle className="size-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">
            Ingresá con tu WhatsApp
          </h2>
          <p className="mt-2 text-sm leading-6 text-black/45">
            Así conservamos tus turnos, compras, promociones y participación en
            sorteos sin pedirte una contraseña.
          </p>
          <Input className="mt-6" placeholder="221 555-0000" />
          <Button
            className="mt-3 w-full"
            onClick={() => toast.success("Código enviado en modo demostración")}
          >
            Enviar código
          </Button>
          <p className="mt-4 text-xs text-black/35">
            Question y tu peluquería solo podrán enviarte promociones si diste
            tu consentimiento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
