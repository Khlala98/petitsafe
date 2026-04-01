import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PetitSafe — Registre HACCP numérique pour crèches et micro-crèches",
  description:
    "Conformité DDPP, traçabilité alimentaire, biberonnerie ANSES, plan de nettoyage. Le tout-en-un HACCP pour la petite enfance en France. Gratuit 14 jours.",
  openGraph: {
    title: "PetitSafe — Registre HACCP numérique pour crèches",
    description:
      "Votre registre HACCP numérique, en 30 secondes par saisie. Conformité DDPP garantie.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
