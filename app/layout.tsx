import type { Metadata } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Question Pro · Peluquerías y distribución",
  description:
    "Agenda para peluquerías, catálogo Question, pedidos, stock, entregas y cuentas corrientes.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
