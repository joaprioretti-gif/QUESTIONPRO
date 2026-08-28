export type Role = "question" | "salon" | "driver" | "influencer" | "customer";

export type Product = {
  id: string;
  sourceProductId?: number;
  name: string;
  variant: string;
  sku: string;
  category: string;
  imageUrl: string;
  description?: string;
  professionalPrice: number;
  publicPrice: number;
  b2cEnabled: boolean;
  physicalStock: number;
  reservedStock: number;
  active: boolean;
};

export type Salon = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  slug: string;
  hasAccess: boolean;
  whatsappConnected: boolean;
  balance: number;
  lastPurchase: string;
};

export type Customer = {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  email: string;
  marketingConsent: boolean;
  visits: number;
  spent: number;
};

export type Professional = {
  id: string;
  salonId: string;
  name: string;
  color: string;
};

export type Service = {
  id: string;
  salonId: string;
  name: string;
  durationMinutes: number;
  price: number;
};

export type Appointment = {
  id: string;
  salonId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
  price: number;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  reminderStatus: "pending" | "sent" | "confirmed";
};

export type Order = {
  id: string;
  type: "b2b" | "b2c";
  source: "assisted" | "salon_link" | "influencer_link" | "salon_app";
  salonId?: string;
  salonName?: string;
  influencerId?: string;
  influencerName?: string;
  customerName: string;
  products: string;
  itemCount: number;
  deliveryMode: "salon" | "home";
  deliveryAddress: string;
  status:
    | "received"
    | "confirmed"
    | "preparing"
    | "ready"
    | "in_transit"
    | "delivered";
  paymentMethod: "mercadopago" | "cash" | "current_account";
  paymentStatus: "pending" | "paid" | "charged_to_salon";
  total: number;
  commission: number;
  createdAt: string;
};

export type LedgerEntry = {
  id: string;
  salonId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: "invoice" | "payment" | "commission" | "adjustment";
};

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value / 100);

const officialImage = (file: string) =>
  `https://questioncolor.com.ar/wp-content/uploads/${file}`;

export const demoProducts: Product[] = [
  {
    id: "q-101-1",
    sourceProductId: 101,
    name: "Lumiplex Color",
    variant: "1 · Negro natural",
    sku: "N/A",
    category: "Coloración",
    imageUrl: officialImage("2023/09/Tintura-Lumiplex-Color.webp"),
    professionalPrice: 742000,
    publicPrice: 1030000,
    b2cEnabled: false,
    physicalStock: 24,
    reservedStock: 5,
    active: true,
  },
  {
    id: "q-101-3",
    sourceProductId: 101,
    name: "Lumiplex Color",
    variant: "3 · Castaño oscuro",
    sku: "N/A",
    category: "Coloración",
    imageUrl: officialImage("2023/09/Tintura-Lumiplex-Color.webp"),
    professionalPrice: 742000,
    publicPrice: 1030000,
    b2cEnabled: false,
    physicalStock: 9,
    reservedStock: 4,
    active: true,
  },
  {
    id: "q-101-4",
    sourceProductId: 101,
    name: "Lumiplex Color",
    variant: "4 · Castaño",
    sku: "N/A",
    category: "Coloración",
    imageUrl: officialImage("2023/09/Tintura-Lumiplex-Color.webp"),
    professionalPrice: 742000,
    publicPrice: 1030000,
    b2cEnabled: false,
    physicalStock: 18,
    reservedStock: 2,
    active: true,
  },
  {
    id: "q-201-330",
    name: "Shampoo Intelligent Repair",
    variant: "330 ml",
    sku: "N/A",
    category: "Cuidado domiciliario",
    imageUrl: officialImage("2021/12/shampoo-intelligent-repair.png"),
    professionalPrice: 895000,
    publicPrice: 1290000,
    b2cEnabled: true,
    physicalStock: 31,
    reservedStock: 7,
    active: true,
  },
  {
    id: "q-201-1500",
    name: "Shampoo Intelligent Repair",
    variant: "1.500 ml",
    sku: "N/A",
    category: "Tratamientos",
    imageUrl: officialImage("2021/12/shampoo-intelligent-repair.png"),
    professionalPrice: 2145000,
    publicPrice: 2990000,
    b2cEnabled: false,
    physicalStock: 11,
    reservedStock: 3,
    active: true,
  },
  {
    id: "q-202-330",
    name: "Acondicionador Intelligent Repair",
    variant: "330 ml",
    sku: "N/A",
    category: "Cuidado domiciliario",
    imageUrl: officialImage("2021/12/acondicionador-intelligent-repair.png"),
    professionalPrice: 940000,
    publicPrice: 1360000,
    b2cEnabled: true,
    physicalStock: 22,
    reservedStock: 4,
    active: true,
  },
  {
    id: "q-203",
    name: "Máscara Intelligent Repair",
    variant: "250 g",
    sku: "N/A",
    category: "Cuidado domiciliario",
    imageUrl: officialImage("2021/12/mascara-intelligent-repair.png"),
    professionalPrice: 1180000,
    publicPrice: 1690000,
    b2cEnabled: true,
    physicalStock: 15,
    reservedStock: 2,
    active: true,
  },
  {
    id: "q-301",
    name: "Óleo Lumiplex",
    variant: "60 ml",
    sku: "N/A",
    category: "Finalización",
    imageUrl: officialImage("2023/09/oleo-lumiplex.webp"),
    professionalPrice: 1060000,
    publicPrice: 1510000,
    b2cEnabled: true,
    physicalStock: 7,
    reservedStock: 3,
    active: true,
  },
  {
    id: "q-302",
    name: "Protector térmico Q Style",
    variant: "200 ml",
    sku: "N/A",
    category: "Finalización",
    imageUrl: officialImage("2021/12/protector-termico.png"),
    professionalPrice: 830000,
    publicPrice: 1190000,
    b2cEnabled: true,
    physicalStock: 28,
    reservedStock: 8,
    active: true,
  },
  {
    id: "q-401-20",
    name: "Oxidante en crema",
    variant: "20 vol · 1.000 ml",
    sku: "N/A",
    category: "Técnicos",
    imageUrl: officialImage("2021/12/oxidante-en-crema.png"),
    professionalPrice: 980000,
    publicPrice: 1380000,
    b2cEnabled: false,
    physicalStock: 13,
    reservedStock: 5,
    active: true,
  },
];

export const demoSalons: Salon[] = [
  {
    id: "salon-griselda",
    name: "Peluquería Griselda",
    owner: "Griselda",
    phone: "221 555-0134",
    address: "Calle 12 847, La Plata",
    slug: "griselda",
    hasAccess: false,
    whatsappConnected: false,
    balance: 18460000,
    lastPurchase: "27/08/2026",
  },
  {
    id: "salon-lola",
    name: "Lola Estudio",
    owner: "Laura Méndez",
    phone: "221 555-0192",
    address: "Diagonal 74 1120, La Plata",
    slug: "lola-estudio",
    hasAccess: true,
    whatsappConnected: true,
    balance: 8200000,
    lastPurchase: "26/08/2026",
  },
  {
    id: "salon-norte",
    name: "Norte Hair Lab",
    owner: "Martín Vidal",
    phone: "221 555-0181",
    address: "Camino Centenario 1860, City Bell",
    slug: "norte-hair",
    hasAccess: true,
    whatsappConnected: true,
    balance: -3560000,
    lastPurchase: "25/08/2026",
  },
  {
    id: "salon-aura",
    name: "Aura Color",
    owner: "Camila Ruiz",
    phone: "221 555-0129",
    address: "Calle 49 618, La Plata",
    slug: "aura-color",
    hasAccess: true,
    whatsappConnected: true,
    balance: 0,
    lastPurchase: "22/08/2026",
  },
  {
    id: "salon-mirta",
    name: "Peluquería Mirta",
    owner: "Mirta Gómez",
    phone: "221 555-0162",
    address: "Av. 7 2341, La Plata",
    slug: "mirta",
    hasAccess: false,
    whatsappConnected: false,
    balance: 6340000,
    lastPurchase: "14/08/2026",
  },
];

export const demoCustomers: Customer[] = [
  {
    id: "c-1",
    salonId: "salon-lola",
    name: "Julieta Ramos",
    phone: "221 555-4051",
    email: "julieta@example.com",
    marketingConsent: true,
    visits: 8,
    spent: 24700000,
  },
  {
    id: "c-2",
    salonId: "salon-lola",
    name: "Sofía Prieto",
    phone: "221 555-4038",
    email: "",
    marketingConsent: true,
    visits: 5,
    spent: 18200000,
  },
  {
    id: "c-3",
    salonId: "salon-lola",
    name: "Marina Acosta",
    phone: "221 555-4027",
    email: "marina@example.com",
    marketingConsent: false,
    visits: 3,
    spent: 9100000,
  },
  {
    id: "c-4",
    salonId: "salon-lola",
    name: "Elena Ortiz",
    phone: "221 555-4099",
    email: "",
    marketingConsent: true,
    visits: 11,
    spent: 31800000,
  },
];

export const demoProfessionals: Professional[] = [
  { id: "pro-laura", salonId: "salon-lola", name: "Laura", color: "#b7d33d" },
  {
    id: "pro-vale",
    salonId: "salon-lola",
    name: "Valentina",
    color: "#fc7d65",
  },
  { id: "pro-lucia", salonId: "salon-lola", name: "Lucía", color: "#7e9fe8" },
];

export const demoServices: Service[] = [
  {
    id: "srv-corte",
    salonId: "salon-lola",
    name: "Corte mujer",
    durationMinutes: 45,
    price: 1400000,
  },
  {
    id: "srv-color",
    salonId: "salon-lola",
    name: "Color completo",
    durationMinutes: 120,
    price: 3800000,
  },
  {
    id: "srv-balayage",
    salonId: "salon-lola",
    name: "Balayage",
    durationMinutes: 180,
    price: 6200000,
  },
  {
    id: "srv-brushing",
    salonId: "salon-lola",
    name: "Brushing",
    durationMinutes: 45,
    price: 1250000,
  },
  {
    id: "srv-tratamiento",
    salonId: "salon-lola",
    name: "Tratamiento reparador",
    durationMinutes: 60,
    price: 2100000,
  },
];

export const demoAppointments: Appointment[] = [
  {
    id: "apt-1",
    salonId: "salon-lola",
    customerId: "c-1",
    customerName: "Julieta Ramos",
    professionalId: "pro-laura",
    professionalName: "Laura",
    serviceId: "srv-color",
    serviceName: "Color completo",
    startsAt: "2026-08-28T09:00:00-03:00",
    durationMinutes: 120,
    price: 3800000,
    status: "confirmed",
    reminderStatus: "confirmed",
  },
  {
    id: "apt-2",
    salonId: "salon-lola",
    customerId: "c-2",
    customerName: "Sofía Prieto",
    professionalId: "pro-vale",
    professionalName: "Valentina",
    serviceId: "srv-corte",
    serviceName: "Corte mujer",
    startsAt: "2026-08-28T10:30:00-03:00",
    durationMinutes: 45,
    price: 1400000,
    status: "confirmed",
    reminderStatus: "sent",
  },
  {
    id: "apt-3",
    salonId: "salon-lola",
    customerId: "c-3",
    customerName: "Marina Acosta",
    professionalId: "pro-lucia",
    professionalName: "Lucía",
    serviceId: "srv-brushing",
    serviceName: "Brushing",
    startsAt: "2026-08-28T12:00:00-03:00",
    durationMinutes: 45,
    price: 1250000,
    status: "confirmed",
    reminderStatus: "confirmed",
  },
  {
    id: "apt-4",
    salonId: "salon-lola",
    customerId: "c-4",
    customerName: "Elena Ortiz",
    professionalId: "pro-laura",
    professionalName: "Laura",
    serviceId: "srv-balayage",
    serviceName: "Balayage",
    startsAt: "2026-08-28T14:00:00-03:00",
    durationMinutes: 180,
    price: 6200000,
    status: "confirmed",
    reminderStatus: "sent",
  },
  {
    id: "apt-5",
    salonId: "salon-lola",
    customerId: "c-1",
    customerName: "Julieta Ramos",
    professionalId: "pro-vale",
    professionalName: "Valentina",
    serviceId: "srv-tratamiento",
    serviceName: "Tratamiento reparador",
    startsAt: "2026-08-29T11:00:00-03:00",
    durationMinutes: 60,
    price: 2100000,
    status: "confirmed",
    reminderStatus: "pending",
  },
];

export const demoOrders: Order[] = [
  {
    id: "QP-1842",
    type: "b2b",
    source: "assisted",
    salonId: "salon-griselda",
    salonName: "Peluquería Griselda",
    customerName: "Griselda",
    products: "Lumiplex Color × 12 · Oxidante × 3",
    itemCount: 15,
    deliveryMode: "salon",
    deliveryAddress: "Calle 12 847, La Plata",
    status: "ready",
    paymentMethod: "current_account",
    paymentStatus: "pending",
    total: 11820000,
    commission: 0,
    createdAt: "2026-08-28T09:20:00-03:00",
  },
  {
    id: "QP-1841",
    type: "b2c",
    source: "salon_link",
    salonId: "salon-lola",
    salonName: "Lola Estudio",
    customerName: "Julieta Ramos",
    products: "Shampoo Intelligent Repair · Máscara Intelligent Repair",
    itemCount: 2,
    deliveryMode: "home",
    deliveryAddress: "Calle 46 731, La Plata",
    status: "preparing",
    paymentMethod: "mercadopago",
    paymentStatus: "paid",
    total: 2980000,
    commission: 875000,
    createdAt: "2026-08-28T08:54:00-03:00",
  },
  {
    id: "QP-1840",
    type: "b2c",
    source: "influencer_link",
    influencerId: "inf-mica",
    influencerName: "Mica Beauty",
    customerName: "Ana Belén López",
    products: "Protector térmico Q Style × 2",
    itemCount: 2,
    deliveryMode: "home",
    deliveryAddress: "Calle 15 122, City Bell",
    status: "confirmed",
    paymentMethod: "cash",
    paymentStatus: "pending",
    total: 2380000,
    commission: 286000,
    createdAt: "2026-08-27T18:31:00-03:00",
  },
  {
    id: "QP-1839",
    type: "b2c",
    source: "salon_link",
    salonId: "salon-norte",
    salonName: "Norte Hair Lab",
    customerName: "Micaela Díaz",
    products: "Óleo Lumiplex",
    itemCount: 1,
    deliveryMode: "salon",
    deliveryAddress: "Camino Centenario 1860, City Bell",
    status: "in_transit",
    paymentMethod: "cash",
    paymentStatus: "pending",
    total: 1510000,
    commission: 450000,
    createdAt: "2026-08-27T16:05:00-03:00",
  },
  {
    id: "QP-1838",
    type: "b2b",
    source: "salon_app",
    salonId: "salon-aura",
    salonName: "Aura Color",
    customerName: "Camila Ruiz",
    products: "Lumiplex Color × 24 · Shampoo 1.500 ml × 4",
    itemCount: 28,
    deliveryMode: "salon",
    deliveryAddress: "Calle 49 618, La Plata",
    status: "delivered",
    paymentMethod: "current_account",
    paymentStatus: "charged_to_salon",
    total: 26460000,
    commission: 0,
    createdAt: "2026-08-26T10:12:00-03:00",
  },
];

export const demoLedger: LedgerEntry[] = [
  {
    id: "mov-1",
    salonId: "salon-lola",
    date: "28/08/2026",
    description: "Comisión venta QP-1841",
    debit: 0,
    credit: 875000,
    balance: 8200000,
    type: "commission",
  },
  {
    id: "mov-2",
    salonId: "salon-lola",
    date: "26/08/2026",
    description: "Pago recibido",
    debit: 0,
    credit: 12000000,
    balance: 9075000,
    type: "payment",
  },
  {
    id: "mov-3",
    salonId: "salon-lola",
    date: "24/08/2026",
    description: "Pedido profesional QP-1826",
    debit: 21075000,
    credit: 0,
    balance: 21075000,
    type: "invoice",
  },
  {
    id: "mov-4",
    salonId: "salon-lola",
    date: "15/08/2026",
    description: "Ajuste de cuenta",
    debit: 0,
    credit: 3200000,
    balance: 0,
    type: "adjustment",
  },
];

export const serviceReportData = [
  { name: "Corte mujer", value: 46 },
  { name: "Color completo", value: 31 },
  { name: "Brushing", value: 27 },
  { name: "Tratamiento", value: 19 },
  { name: "Balayage", value: 12 },
];

export const weeklyReportData = [
  { day: "Lun", turnos: 14, horas: 11.5 },
  { day: "Mar", turnos: 18, horas: 14 },
  { day: "Mié", turnos: 15, horas: 12.5 },
  { day: "Jue", turnos: 21, horas: 16 },
  { day: "Vie", turnos: 24, horas: 18 },
  { day: "Sáb", turnos: 28, horas: 20 },
];

export const dashboardData = {
  products: demoProducts,
  salons: demoSalons,
  customers: demoCustomers,
  professionals: demoProfessionals,
  services: demoServices,
  appointments: demoAppointments,
  orders: demoOrders,
  ledger: demoLedger,
};
