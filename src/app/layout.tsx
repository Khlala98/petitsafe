import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PetitSafe — Gestion HACCP & Traçabilité Petite Enfance",
    template: "%s | PetitSafe",
  },
  description:
    "PetitSafe : le SaaS de gestion HACCP, PMS et traçabilité alimentaire pour les crèches, micro-crèches, MAM et assistantes maternelles en France.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "PetitSafe — Gestion HACCP & Traçabilité Petite Enfance",
    description:
      "Conformité HACCP, traçabilité alimentaire, biberonnerie ANSES, suivi enfants — tout en un.",
    siteName: "PetitSafe",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetitSafe",
    description: "Le SaaS HACCP pour la petite enfance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-petitsafe-fond antialiased">
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
