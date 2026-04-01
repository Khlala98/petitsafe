"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { demandeDemoSchema, type DemandeDemoForm } from "@/lib/schemas/demo";
import { creerDemandeDemo } from "@/app/actions/demo";
import { toast } from "sonner";
import {
  Thermometer, Sparkles, Package, Baby, Shield, Clock, CheckCircle2,
  ChevronRight, Menu, X, Star, ArrowRight, FileText, Users, Building2,
  MessageSquare, Phone, Heart, ChevronLeft, ClipboardCheck, AlertTriangle,
  Droplets, Timer, Milk, Ban, Utensils, BedDouble, Repeat,
} from "lucide-react";
import { TYPES_STRUCTURE } from "@/lib/constants";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

// ═══ SECTION 1 — NAVBAR ═══

function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-[#2E86C1]" />
            <span className="text-xl font-bold text-gray-900">
              Petit<span className="text-[#2E86C1]">Safe</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("fonctionnalites")} className="text-sm text-gray-600 hover:text-[#2E86C1] transition-colors">
              Fonctionnalites
            </button>
            <button onClick={() => scrollTo("tarifs")} className="text-sm text-gray-600 hover:text-[#2E86C1] transition-colors">
              Tarifs
            </button>
            <button onClick={() => scrollTo("faq")} className="text-sm text-gray-600 hover:text-[#2E86C1] transition-colors">
              FAQ
            </button>
            <a href="/login" className="text-sm text-gray-600 hover:text-[#2E86C1] transition-colors">
              Connexion
            </a>
            <button
              onClick={() => scrollTo("demo")}
              className="bg-[#2E86C1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2574A9] transition-colors"
              aria-label="Demander une demo gratuite"
            >
              Demander une demo
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <button onClick={() => scrollTo("fonctionnalites")} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Fonctionnalites
            </button>
            <button onClick={() => scrollTo("tarifs")} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Tarifs
            </button>
            <button onClick={() => scrollTo("faq")} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              FAQ
            </button>
            <a href="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Connexion
            </a>
            <button
              onClick={() => scrollTo("demo")}
              className="block w-full bg-[#2E86C1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold text-center"
            >
              Demander une demo
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ═══ SECTION 2 — HERO ═══

function Hero() {
  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Votre registre HACCP numerique,
          <br />
          en{" "}
          <span className="relative inline-block text-[#2E86C1]">
            30 secondes
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" aria-hidden="true">
              <path d="M1 5.5C40 2 80 7 100 4C120 1 160 6 199 3.5" stroke="#2E86C1" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="d" values="M1 5.5C40 2 80 7 100 4C120 1 160 6 199 3.5;M1 3.5C40 6 80 1 100 4C120 7 160 2 199 5.5;M1 5.5C40 2 80 7 100 4C120 1 160 6 199 3.5" dur="3s" repeatCount="indefinite" />
              </path>
            </svg>
          </span>
          {" "}par saisie.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Conformite DDPP, tracabilite alimentaire et biberonnerie ANSES.
          <br className="hidden sm:inline" />
          Le tout-en-un creche en option.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToDemo}
            className="bg-[#2E86C1] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#2574A9] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            aria-label="Demander une demo gratuite"
          >
            Demander une demo gratuite
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById("fonctionnalites")?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-[#2E86C1] hover:text-[#2E86C1] transition-colors flex items-center justify-center gap-2"
            aria-label="Decouvrir les fonctionnalites"
          >
            Decouvrir
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <CheckCircle2 size={16} />
          Gratuit 14 jours - 5 min de mise en place - Sans engagement
        </div>

        {/* Dashboard mockup */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-green-400" aria-hidden="true" />
              </div>
              <span className="text-xs text-gray-400 ml-2">app.petitsafe.fr/dashboard</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg font-bold text-gray-800">Bonjour Sophie</p>
                  <p className="text-xs text-gray-400">Les Petits Explorateurs - Micro-creche</p>
                </div>
                <span className="text-xs text-gray-400">Aujourd&apos;hui</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MockupKpi icon={<Thermometer size={16} className="text-[#2E86C1]" />} label="Temperatures" value="Tous conformes" color="bg-green-500" />
                <MockupKpi icon={<Sparkles size={16} className="text-[#27AE60]" />} label="Nettoyage" value="85% — 11/13" color="bg-green-500" />
                <MockupKpi icon={<Package size={16} className="text-[#F4A261]" />} label="Stock" value="1 alerte DLC" color="bg-orange-400" />
                <MockupKpi icon={<Baby size={16} className="text-purple-500" />} label="Biberons" value="3 prepares" color="bg-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockupKpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#FAFBFC] rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs font-medium text-gray-500">{label}</span></div>
      <div className="flex items-center gap-1.5">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
        <span className="text-xs font-semibold text-gray-700">{value}</span>
      </div>
    </div>
  );
}

// ═══ SECTION 3 — BANDEAU CONFIANCE ═══

function BandeauConfiance() {
  const creches = [
    "Creche Les Petits Pas - Lyon",
    "Micro-creche L'Ile aux Enfants - Nantes",
    "MAM Les Coccinelles - Bordeaux",
    "Creche Soleil Levant - Marseille",
    "Micro-creche Bulle de Reve - Toulouse",
    "AM Marie Dupont - Boulogne",
  ];

  return (
    <section className="py-8 bg-[#F5F7FA] overflow-hidden">
      <p className="text-center text-xs text-gray-400 mb-4 uppercase tracking-wider font-medium">Ils nous font confiance</p>
      <div className="relative">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...creches, ...creches].map((name, i) => (
            <span key={i} className="text-sm text-gray-500 font-medium">{name}</span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}

// ═══ SECTION 4 — PROBLEME / SOLUTION ═══

function ProblemeSolution() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Fini le papier, bonjour la serenite
        </h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2">
              <X size={20} className="text-red-500" />
              Avant PetitSafe
            </h3>
            <ul className="space-y-4">
              {[
                "Classeurs qui debordent, releves perdus",
                "Controle DDPP = stress et nuits blanches",
                "Pas de visibilite sur les DLC proches",
                "Timer biberon au feeling, sans tracabilite",
                "Aucun partage entre collegues en temps reel",
                "Impossible de prouver sa conformite rapidement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-red-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" />
              Avec PetitSafe
            </h3>
            <ul className="space-y-4">
              {[
                "Releves en 2 taps sur tablette, alertes automatiques temperature/DLC",
                "Export DDPP en 1 clic, toujours pret pour un controle",
                "Tracabilite lot-enfant complete, alertes DLC J-2",
                "Timer ANSES integre, tracabilite biberon lot par lot",
                "Nettoyage valide en temps reel sur toutes les tablettes",
                "Export PDF instantane, conformite prouvee en 30 secondes",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-green-800">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 5 — FONCTIONNALITES (3 ONGLETS) ═══

const TABS = [
  {
    id: "haccp",
    label: "HACCP & Tracabilite",
    features: [
      {
        icon: <Thermometer size={24} className="text-[#2E86C1]" />,
        title: "Releves temperature frigo & congelateur",
        desc: "Saisie en 2 taps. Alertes non-conformite instantanees. Historique complet exportable pour la DDPP.",
      },
      {
        icon: <Sparkles size={24} className="text-[#2E86C1]" />,
        title: "Temperature plats temoins",
        desc: "Releves avant et apres service. Verification automatique du seuil 63 C. Actions correctives tracees.",
      },
      {
        icon: <Package size={24} className="text-[#F4A261]" />,
        title: "Tracabilite lots / DLC / fournisseurs",
        desc: "Reception marchandises, numeros de lot, DLC, fournisseurs. Alertes DLC J-2 automatiques.",
      },
      {
        icon: <ClipboardCheck size={24} className="text-[#27AE60]" />,
        title: "Plan de nettoyage & validations",
        desc: "Taches quotidiennes par zone. Validation en 1 tap. Progression en temps reel sur toutes les tablettes.",
      },
      {
        icon: <FileText size={24} className="text-[#2E86C1]" />,
        title: "Export PDF pret pour controle DDPP",
        desc: "Rapports DDPP et PMI generes en 1 clic. Conformes aux exigences reglementaires francaises.",
      },
    ],
  },
  {
    id: "biberonnerie",
    label: "Biberonnerie ANSES",
    features: [
      {
        icon: <Timer size={24} className="text-[#E53E3E]" />,
        title: "Timer ANSES 1h integre",
        desc: "Compte a rebours automatique des la preparation. Alerte orange a 45 min, rouge a 60 min. Conforme ANSES 2005.",
      },
      {
        icon: <Milk size={24} className="text-[#2E86C1]" />,
        title: "Tracabilite lait (lot, DLC, boite ouverte)",
        desc: "Numero de lot, DLC, date d'ouverture de la boite. Tout est trace pour chaque biberon prepare.",
      },
      {
        icon: <AlertTriangle size={24} className="text-[#F39C12]" />,
        title: "Alertes boite ouverte > 30 jours",
        desc: "Alerte automatique quand une boite de lait depasse 30 jours d'ouverture. Impossible de l'oublier.",
      },
      {
        icon: <Ban size={24} className="text-[#E53E3E]" />,
        title: "Blocage automatique PLV si allergie",
        desc: "Si un enfant a une allergie aux proteines de lait de vache, le formulaire bloque la selection de lait standard.",
      },
      {
        icon: <Baby size={24} className="text-purple-500" />,
        title: "Dosettes & types de lait",
        desc: "1er age, 2eme age, maternel, croissance, special HA/AR. Quantites predefinies pour une saisie rapide.",
      },
    ],
  },
  {
    id: "suivi",
    label: "Suivi Enfants",
    features: [
      {
        icon: <Utensils size={24} className="text-[#F4A261]" />,
        title: "Repas avec quantites visuelles",
        desc: "Entree, plat, dessert avec quantites (rien, peu, moitie, bien, tout). Badge allergie toujours visible.",
      },
      {
        icon: <Droplets size={24} className="text-[#2E86C1]" />,
        title: "Changes en 2 taps",
        desc: "Pipi, selles, mixte — en 2 taps. Horodate automatiquement. Visible sur le suivi du jour.",
      },
      {
        icon: <BedDouble size={24} className="text-purple-500" />,
        title: "Siestes avec duree",
        desc: "Heure de debut, heure de fin, qualite (agitee, normale, profonde). Duree calculee automatiquement.",
      },
      {
        icon: <MessageSquare size={24} className="text-[#27AE60]" />,
        title: "Transmissions parents",
        desc: "Notes d'equipe, transmissions enfant et generales. Visibles par toute l'equipe en temps reel.",
      },
      {
        icon: <Heart size={24} className="text-red-400" />,
        title: "Portail parents lecture seule",
        desc: "Les parents consultent la journee de leur enfant : repas, siestes, changes. Securise et en lecture seule.",
      },
    ],
  },
] as const;

function Fonctionnalites() {
  const [activeTab, setActiveTab] = useState("haccp");
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <section id="fonctionnalites" className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Tout ce qu&apos;il faut pour votre conformite
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
          Activez uniquement les modules dont vous avez besoin. HACCP seul ou experience complete.
        </p>

        {/* Onglets */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#2E86C1] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#2E86C1] hover:text-[#2E86C1]"
              }`}
              aria-label={`Onglet ${tab.label}`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cartes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTab.features.map((f) => (
            <FadeInCard key={f.title}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </FadeInCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 6 — CHIFFRES CLES ═══

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count}{suffix}
    </span>
  );
}

function ChiffresCles() {
  const chiffres = [
    { target: 45, suffix: " min", label: "gagnees par jour" },
    { target: 0, suffix: "", label: "classeur papier" },
    { target: 100, suffix: "%", label: "tracabilite" },
    { target: 30, suffix: " sec", label: "par saisie" },
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-[#2E86C1]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {chiffres.map((c) => (
            <div key={c.label}>
              <AnimatedCounter target={c.target} suffix={c.suffix} />
              <p className="mt-2 text-sm text-blue-100 font-medium">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 7 — TEMOIGNAGES (CARROUSEL 5) ═══

function Temoignages() {
  const temoignages = [
    {
      quote: "On ne cherche plus nos classeurs avant les controles DDPP. Tout est pret en 1 clic. L'inspectrice etait impressionnee.",
      name: "Sophie L.",
      role: "Directrice, micro-creche Les Petits Pas, Lyon",
    },
    {
      quote: "Le timer biberon ANSES m'a sauvee plusieurs fois. Plus de biberons oublies au chaud. Et les parents adorent consulter le portail.",
      name: "Marie D.",
      role: "Assistante maternelle, Boulogne-Billancourt",
    },
    {
      quote: "Gerer 3 structures depuis un seul ecran, c'est un game-changer. Les exports PDF sont impeccables pour la PMI.",
      name: "Aurelie M.",
      role: "Gestionnaire, reseau de micro-creches, Bordeaux",
    },
    {
      quote: "Mes collegues ont pris l'outil en main en 10 minutes. Les releves de temperature ne sont plus une corvee, c'est devenu naturel.",
      name: "Camille R.",
      role: "Referente technique, creche collective, Nantes",
    },
    {
      quote: "On est passes de 45 minutes de paperasse par jour a 5 minutes sur tablette. Le plan de nettoyage en temps reel, c'est top.",
      name: "Isabelle P.",
      role: "Directrice, MAM Les Coccinelles, Toulouse",
    },
  ];

  const [current, setCurrent] = useState(0);
  const total = temoignages.length;

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Ce qu&apos;en disent les pros
        </h2>

        <div className="relative">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center min-h-[220px] flex flex-col justify-center">
            <div className="flex justify-center gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" aria-hidden="true" />
              ))}
            </div>
            <p className="text-base text-gray-700 leading-relaxed mb-6 italic">
              &ldquo;{temoignages[current].quote}&rdquo;
            </p>
            <div>
              <p className="text-sm font-bold text-gray-900">{temoignages[current].name}</p>
              <p className="text-xs text-gray-500">{temoignages[current].role}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#2E86C1] transition-colors"
              aria-label="Temoignage precedent"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex gap-2">
              {temoignages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? "bg-[#2E86C1]" : "bg-gray-300"
                  }`}
                  aria-label={`Temoignage ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#2E86C1] transition-colors"
              aria-label="Temoignage suivant"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 8 — NOTRE HISTOIRE ═══

function NotreHistoire() {
  const lines = [
    "Tout a commence dans une micro-creche, un matin de controle DDPP.",
    "La directrice cherchait ses classeurs. Les releves de temperature manquaient.",
    "Le plan de nettoyage etait incomplet. L'inspectrice attendait.",
    "Ce jour-la, on s'est dit : il doit y avoir une meilleure facon de faire.",
    "On a parle a des dizaines de directrices, d'auxiliaires, d'assistantes maternelles.",
    "Toutes disaient la meme chose : trop de papier, pas assez de temps avec les enfants.",
    "PetitSafe est ne de cette realite du terrain.",
    "Un outil concu PAR des pros de la petite enfance, POUR des pros de la petite enfance.",
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">
          Notre histoire
        </h2>
        <div className="space-y-4">
          {lines.map((line, i) => (
            <ScrollRevealLine key={i} delay={i * 100}>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">{line}</p>
            </ScrollRevealLine>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScrollRevealLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ═══ SECTION 9 — AUTO-DIAGNOSTIC ═══

function AutoDiagnostic() {
  const diagnostics = [
    {
      icon: <ClipboardCheck size={28} />,
      title: "Diagnostic HACCP",
      desc: "Evaluez votre conformite HACCP en 10 questions. Recevez un score et des recommandations personnalisees.",
      color: "bg-blue-50 text-[#2E86C1]",
    },
    {
      icon: <Building2 size={28} />,
      title: "Diagnostic Batimentaire",
      desc: "Verifiez que vos locaux repondent aux exigences PMI : surfaces, stockage, temperatures, ventilation.",
      color: "bg-green-50 text-[#27AE60]",
    },
    {
      icon: <Star size={28} />,
      title: "Diagnostic Qualite d'accueil",
      desc: "Evaluez vos pratiques d'accueil : ratio pro/enfants, activites, transmissions, implication des parents.",
      color: "bg-orange-50 text-[#F4A261]",
    },
  ];

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Auto-diagnostic gratuit
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Evaluez votre structure en 5 minutes. Gratuit, sans inscription.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {diagnostics.map((d) => (
            <div key={d.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-xl ${d.color} flex items-center justify-center mx-auto mb-4`}>
                {d.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{d.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{d.desc}</p>
              <button
                className="text-sm font-semibold text-[#2E86C1] hover:underline flex items-center justify-center gap-1 mx-auto"
                aria-label={`Demarrer le ${d.title}`}
              >
                Demarrer
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 10 — TARIFS ═══

function Tarifs() {
  return (
    <section id="tarifs" className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Un prix simple et transparent
        </h2>
        <p className="text-center text-gray-500 mb-12">14 jours gratuits. Sans engagement. Sans carte bancaire.</p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* HACCP Essentiel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">HACCP Essentiel</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Pour les structures deja equipees d&apos;un logiciel de gestion</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">39</span>
              <span className="text-gray-500 text-sm">&euro;/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Releves temperature automatises",
                "Tracabilite alimentaire (lots, DLC, fournisseurs)",
                "Plan de nettoyage & validations",
                "Biberonnerie conforme ANSES",
                "Export PDF pret pour controle DDPP",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mb-4 italic">Se combine avec votre outil existant</p>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full border-2 border-[#2E86C1] text-[#2E86C1] py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              aria-label="Essayer HACCP Essentiel gratuitement"
            >
              Essayer gratuitement
            </button>
          </div>

          {/* PetitSafe Complet */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#2E86C1] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E86C1] text-white text-xs font-bold px-4 py-1 rounded-full">
              Populaire
            </div>
            <h3 className="text-lg font-bold text-gray-900">PetitSafe Complet</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">La solution tout-en-un pour votre structure</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">69</span>
              <span className="text-gray-500 text-sm">&euro;/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Tout HACCP Essentiel +",
                "Suivi quotidien enfants (repas, changes, siestes)",
                "Transmissions parents",
                "Portail parents en lecture seule",
                "Gestion des stocks",
                "Protocoles internes",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full bg-[#2E86C1] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2574A9] transition-colors"
              aria-label="Essayer PetitSafe Complet gratuitement"
            >
              Essayer gratuitement
            </button>
          </div>

          {/* Multi-structures */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Multi-structures</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Pour les gestionnaires de reseaux</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">Sur devis</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Tout PetitSafe Complet",
                "Dashboard consolide multi-sites",
                "Supervision centralisee",
                "Tarif degressif par structure",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full border-2 border-[#2E86C1] text-[#2E86C1] py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              aria-label="Nous contacter pour le plan Multi-structures"
            >
              Nous contacter
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Tous les plans incluent : essai gratuit 14 jours, sans engagement, support par email
        </p>
      </div>
    </section>
  );
}

// ═══ SECTION 11 — FAQ (SHADCN ACCORDION) ═══

function FAQ() {
  const items = [
    {
      q: "Est-ce que PetitSafe remplace mon classeur HACCP papier ?",
      a: "Oui. PetitSafe numerise integralement votre registre HACCP : releves de temperature, tracabilite alimentaire, plan de nettoyage, biberonnerie. Les donnees sont horodatees, exportables en PDF et conformes aux exigences de la DDPP.",
    },
    {
      q: "Combien de temps faut-il pour etre operationnel ?",
      a: "5 minutes. Creez votre compte, ajoutez vos enfants et vos equipements (frigo, congelateur), et commencez vos saisies. Les zones de nettoyage sont pre-remplies avec un plan type.",
    },
    {
      q: "Faut-il une connexion internet ?",
      a: "Oui, PetitSafe fonctionne en ligne sur tablette ou smartphone. La connexion permet la synchronisation en temps reel entre les appareils de votre structure.",
    },
    {
      q: "Mes donnees sont-elles securisees ?",
      a: "Vos donnees sont hebergees en Europe, chiffrees en transit et au repos. Chaque structure a un espace isole. Les sauvegardes sont automatiques et quotidiennes.",
    },
    {
      q: "Puis-je annuler a tout moment ?",
      a: "Oui, sans engagement. Vous pouvez annuler votre abonnement a tout moment. Vos donnees restent accessibles en lecture pendant 30 jours apres l'annulation.",
    },
    {
      q: "Les parents ont-ils acces a PetitSafe ?",
      a: "Oui, le portail parents (inclus dans le plan Complet) permet aux parents de consulter la journee de leur enfant en lecture seule : repas, siestes, changes. Ils ne voient que les donnees de leur enfant.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Questions frequentes
        </h2>
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-gray-100 bg-white rounded-xl mb-3 px-5 border">
              <AccordionTrigger className="text-sm font-semibold text-gray-900 hover:text-[#2E86C1]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ═══ SECTION 12 — FORMULAIRE DEMO ═══

function FormulaireDemoSection() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<DemandeDemoForm>({
    resolver: zodResolver(demandeDemoSchema),
  });
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: DemandeDemoForm) => {
    const result = await creerDemandeDemo(data);
    if (result.success) {
      setSent(true);
      reset();
      toast.success("Demande envoyee ! Nous vous recontactons sous 24h.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <section id="demo" className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Demandez votre demo gratuite
          </h2>
          <p className="text-gray-500">
            14 jours gratuits, sans engagement, sans carte bancaire. On vous accompagne.
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyee !</h3>
            <p className="text-gray-600 text-sm">Nous vous recontactons sous 24h pour configurer votre espace.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-5"
          >
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                id="nom"
                {...register("nom")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                placeholder="Marie Dupont"
              />
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  placeholder="marie@creche.fr"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone
                </label>
                <input
                  id="telephone"
                  type="tel"
                  {...register("telephone")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
                {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="type_structure" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de structure
                </label>
                <select
                  id="type_structure"
                  {...register("type_structure")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Selectionnez...</option>
                  {Object.entries(TYPES_STRUCTURE).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.type_structure && <p className="text-xs text-red-500 mt-1">{errors.type_structure.message}</p>}
              </div>
              <div>
                <label htmlFor="nombre_structures" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de structures
                </label>
                <select
                  id="nombre_structures"
                  {...register("nombre_structures")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white"
                  defaultValue=""
                >
                  <option value="" disabled>Selectionnez...</option>
                  <option value="1">1</option>
                  <option value="2-5">2 a 5</option>
                  <option value="6-10">6 a 10</option>
                  <option value="10+">Plus de 10</option>
                </select>
                {errors.nombre_structures && <p className="text-xs text-red-500 mt-1">{errors.nombre_structures.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2E86C1] text-white py-4 rounded-xl text-base font-semibold hover:bg-[#2574A9] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              aria-label="Envoyer la demande de demo"
            >
              {isSubmitting ? "Envoi en cours..." : "Demander ma demo gratuite"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <p className="text-xs text-gray-400 text-center">
              En soumettant ce formulaire, vous acceptez d&apos;etre recontacte par l&apos;equipe PetitSafe.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

// ═══ SECTION 13 — FOOTER ═══

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-[#2E86C1]" />
              <span className="text-lg font-bold text-white">
                Petit<span className="text-[#2E86C1]">Safe</span>
              </span>
            </div>
            <p className="text-sm">
              Le registre HACCP numerique pour la petite enfance en France.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => document.getElementById("fonctionnalites")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">Fonctionnalites</button></li>
              <li><button onClick={() => document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">Tarifs</button></li>
              <li><button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">FAQ</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Reglementation</h4>
            <ul className="space-y-2 text-sm">
              <li>HACCP & Paquet Hygiene</li>
              <li>Plan de Maitrise Sanitaire</li>
              <li>Recommandations ANSES</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare size={14} />
                <span>contact@petitsafe.fr</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} PetitSafe. Tous droits reserves.</p>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-white cursor-pointer transition-colors">Mentions legales</span>
            <span className="hover:text-white cursor-pointer transition-colors">Politique de confidentialite</span>
            <span className="hover:text-white cursor-pointer transition-colors">CGU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══ FADE-IN ANIMATION COMPONENT ═══

function FadeInCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {children}
    </div>
  );
}

// ═══ LANDING PAGE ═══

export default function LandingPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <Hero />
      <BandeauConfiance />
      <ProblemeSolution />
      <Fonctionnalites />
      <ChiffresCles />
      <Temoignages />
      <NotreHistoire />
      <AutoDiagnostic />
      <Tarifs />
      <FAQ />
      <FormulaireDemoSection />
      <Footer />
    </main>
  );
}
