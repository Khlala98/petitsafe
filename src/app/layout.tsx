import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RZPan'Da — Gestion HACCP & Traçabilité Petite Enfance",
    template: "%s | RZPan'Da",
  },
  description:
    "RZPan'Da : le SaaS de gestion HACCP, PMS et traçabilité alimentaire pour les crèches, micro-crèches, MAM et assistantes maternelles en France.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "RZPan'Da — Gestion HACCP & Traçabilité Petite Enfance",
    description:
      "Conformité HACCP, traçabilité alimentaire, biberonnerie ANSES, suivi enfants — tout en un.",
    siteName: "RZPan'Da",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "RZPan'Da",
    description: "Le SaaS HACCP pour la petite enfance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/rzpanda-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-rzpanda-fond antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
