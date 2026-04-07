import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.rzpanda.fr";

export const metadata: Metadata = {
  title: "RZPan'Da — Registre HACCP numerique pour creches et micro-creches",
  description:
    "Conformite DDPP, tracabilite alimentaire, biberonnerie ANSES, plan de nettoyage. Le tout-en-un HACCP pour la petite enfance en France. Gratuit 14 jours.",
  openGraph: {
    title: "RZPan'Da — Registre HACCP numerique pour creches",
    description:
      "Votre registre HACCP numerique, en 30 secondes par saisie. Conformite DDPP garantie.",
    type: "website",
    locale: "fr_FR",
    url: BASE_URL,
    siteName: "RZPan'Da",
  },
  twitter: {
    card: "summary_large_image",
    title: "RZPan'Da — HACCP numerique petite enfance",
    description:
      "Registre HACCP, tracabilite alimentaire, biberonnerie ANSES. 30 secondes par saisie.",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "RZPan'Da",
      url: BASE_URL,
      description:
        "SaaS de gestion HACCP, PMS et tracabilite alimentaire pour les creches, micro-creches, MAM et assistantes maternelles en France.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+33-1-23-45-67-89",
        contactType: "customer service",
        availableLanguage: "French",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "RZPan'Da",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Registre HACCP numerique pour la petite enfance. Releves de temperature, tracabilite alimentaire, biberonnerie ANSES, plan de nettoyage, exports DDPP.",
      offers: [
        {
          "@type": "Offer",
          name: "HACCP Essentiel",
          price: "39",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "39",
            priceCurrency: "EUR",
            unitText: "MONTH",
          },
        },
        {
          "@type": "Offer",
          name: "RZPan'Da Complet",
          price: "69",
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "69",
            priceCurrency: "EUR",
            unitText: "MONTH",
          },
        },
      ],
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
