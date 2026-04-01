"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { demandeDemoSchema, type DemandeDemoForm } from "@/lib/schemas/demo";
import { creerDemandeDemo } from "@/app/actions/demo";
import { toast } from "sonner";
import {
  Thermometer, Sparkles, Package, Baby, Shield, Clock, CheckCircle2,
  ChevronRight, Menu, X, Star, ArrowRight, FileText, Users, Building2,
  MessageSquare, BarChart3, Lock, Zap, Heart, Phone,
} from "lucide-react";
import { TYPES_STRUCTURE } from "@/lib/constants";

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
              Fonctionnalités
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
              aria-label="Demander une démo gratuite"
            >
              Demander une démo
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
              Fonctionnalités
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
              Demander une démo
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
          Votre registre HACCP numérique,
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
          Conformité DDPP, traçabilité alimentaire et biberonnerie ANSES.
          <br className="hidden sm:inline" />
          Le tout-en-un crèche en option.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToDemo}
            className="bg-[#2E86C1] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#2574A9] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            aria-label="Demander une démo gratuite"
          >
            Demander une démo gratuite
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById("fonctionnalites")?.scrollIntoView({ behavior: "smooth" })}
            className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-[#2E86C1] hover:text-[#2E86C1] transition-colors flex items-center justify-center gap-2"
            aria-label="Découvrir les fonctionnalités"
          >
            Découvrir
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <CheckCircle2 size={16} />
          Gratuit 14 jours · 5 min de mise en place · Sans engagement
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
                  <p className="text-xs text-gray-400">Les Petits Explorateurs · Micro-crèche</p>
                </div>
                <span className="text-xs text-gray-400">Aujourd&apos;hui</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MockupKpi icon={<Thermometer size={16} className="text-[#2E86C1]" />} label="Températures" value="Tous conformes" color="bg-green-500" />
                <MockupKpi icon={<Sparkles size={16} className="text-[#27AE60]" />} label="Nettoyage" value="85% — 11/13" color="bg-green-500" />
                <MockupKpi icon={<Package size={16} className="text-[#F4A261]" />} label="Stock" value="1 alerte DLC" color="bg-orange-400" />
                <MockupKpi icon={<Baby size={16} className="text-purple-500" />} label="Biberons" value="3 préparés" color="bg-green-500" />
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
    "Crèche Les Petits Pas · Lyon",
    "Micro-crèche L'Île aux Enfants · Nantes",
    "MAM Les Coccinelles · Bordeaux",
    "Crèche Soleil Levant · Marseille",
    "Micro-crèche Bulle de Rêve · Toulouse",
    "AM Marie Dupont · Boulogne",
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

// ═══ SECTION 4 — PROBLÈME / SOLUTION ═══

function ProblemeSolution() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Fini le papier, bonjour la sérénité
        </h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Problème */}
          <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2">
              <X size={20} className="text-red-500" />
              Avant PetitSafe
            </h3>
            <ul className="space-y-4">
              {[
                "Classeurs qui débordent, relevés perdus",
                "Contrôle DDPP = stress et nuits blanches",
                "Pas de visibilité sur les DLC proches",
                "Timer biberon au feeling, sans traçabilité",
                "Aucun partage entre collègues en temps réel",
                "Impossible de prouver sa conformité rapidement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-red-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" />
              Avec PetitSafe
            </h3>
            <ul className="space-y-4">
              {[
                "Tout numérique, accessible sur tablette et mobile",
                "Registre HACCP toujours à jour, export DDPP en 1 clic",
                "Alertes DLC automatiques J-2",
                "Timer ANSES intégré, traçabilité lot par lot",
                "Mise à jour en temps réel sur toutes les tablettes",
                "Export PDF instantané pour tout contrôle",
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

// ═══ SECTION 5 — FONCTIONNALITÉS ═══

function Fonctionnalites() {
  const features = [
    {
      icon: <Thermometer size={24} className="text-[#2E86C1]" />,
      title: "Températures",
      desc: "Relevés frigo, congélateur et plats témoins. Alertes non-conformité instantanées. Historique exportable.",
    },
    {
      icon: <Package size={24} className="text-[#F4A261]" />,
      title: "Traçabilité alimentaire",
      desc: "Réception marchandises, numéros de lot, DLC, fournisseurs. Alertes DLC J-2 automatiques.",
    },
    {
      icon: <Sparkles size={24} className="text-[#27AE60]" />,
      title: "Plan de nettoyage",
      desc: "Tâches quotidiennes par zone. Validation en 1 tap. Pourcentage de progression en temps réel.",
    },
    {
      icon: <Baby size={24} className="text-purple-500" />,
      title: "Biberonnerie ANSES",
      desc: "Timer 1h réglementaire, traçabilité lait (lot, DLC, dosettes). Blocage PLV si allergie.",
    },
    {
      icon: <FileText size={24} className="text-[#2E86C1]" />,
      title: "Exports PDF",
      desc: "Rapports DDPP et PMI générés en 1 clic. Conformes aux exigences réglementaires françaises.",
    },
    {
      icon: <Users size={24} className="text-[#F4A261]" />,
      title: "Multi-structures",
      desc: "Gérez plusieurs crèches depuis un seul tableau de bord. Chaque structure a ses propres données.",
    },
    {
      icon: <MessageSquare size={24} className="text-[#27AE60]" />,
      title: "Transmissions",
      desc: "Notes d'équipe, transmissions enfant et générales. Visibles par toute l'équipe en temps réel.",
    },
    {
      icon: <Heart size={24} className="text-red-400" />,
      title: "Portail parents",
      desc: "Les parents consultent la journée de leur enfant : repas, siestes, changes. Lecture seule et sécurisée.",
    },
    {
      icon: <BarChart3 size={24} className="text-[#2E86C1]" />,
      title: "Dashboard temps réel",
      desc: "Vue d'ensemble instantanée : conformité températures, nettoyage, alertes DLC, biberons du jour.",
    },
  ];

  return (
    <section id="fonctionnalites" className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Tout ce qu&apos;il faut pour votre conformité
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Activez uniquement les modules dont vous avez besoin. HACCP seul ou expérience complète.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
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

// ═══ SECTION 6 — COMMENT ÇA MARCHE ═══

function CommentCaMarche() {
  const steps = [
    { step: "1", title: "Inscrivez-vous", desc: "Créez votre compte en 2 minutes. Choisissez vos modules." },
    { step: "2", title: "Configurez", desc: "Ajoutez vos enfants, équipements et zones de nettoyage." },
    { step: "3", title: "Saisissez", desc: "Relevés, biberons, repas — 30 secondes max par saisie." },
    { step: "4", title: "Exportez", desc: "PDF DDPP / PMI en 1 clic. Toujours prêt pour un contrôle." },
  ];

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Opérationnel en 5 minutes
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#2E86C1] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 7 — TYPES DE STRUCTURES ═══

function TypesStructures() {
  const types = [
    {
      icon: <Building2 size={28} />,
      title: "Crèche collective",
      desc: "20 à 60 enfants. Cuisine sur place. Équipe pluridisciplinaire. Tous les modules disponibles.",
      capacity: "20-60 enfants",
    },
    {
      icon: <Users size={28} />,
      title: "Micro-crèche",
      desc: "Jusqu'à 10 enfants. Liaison froide/chaude. HACCP complet + suivi quotidien.",
      capacity: "10 enfants max",
    },
    {
      icon: <Heart size={28} />,
      title: "MAM",
      desc: "2 à 4 assistantes maternelles. Domicile partagé. Modules adaptés à votre organisation.",
      capacity: "4-16 enfants",
    },
    {
      icon: <Shield size={28} />,
      title: "Assistante maternelle",
      desc: "1 à 4 enfants. Domicile. HACCP essentiel : températures, traçabilité, nettoyage, biberonnerie.",
      capacity: "1-4 enfants",
    },
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Adapté à votre structure
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          PetitSafe s&apos;adapte à chaque type d&apos;accueil, de l&apos;assistante maternelle à la crèche collective.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {types.map((t) => (
            <div key={t.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-[#2E86C1] flex items-center justify-center mx-auto mb-4">
                {t.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-[#2E86C1] font-semibold mb-3">{t.capacity}</p>
              <p className="text-sm text-gray-600">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 8 — TÉMOIGNAGES ═══

function Temoignages() {
  const temoignages = [
    {
      quote: "On est passé de 45 minutes de paperasse par jour à 5 minutes sur tablette. Le contrôle DDPP s'est super bien passé.",
      name: "Sophie L.",
      role: "Directrice, micro-crèche Les Petits Pas",
      stars: 5,
    },
    {
      quote: "Le timer biberon ANSES m'a sauvée plusieurs fois. Plus de biberons oubliés au chaud. Et les parents adorent le portail.",
      name: "Marie D.",
      role: "Assistante maternelle, Boulogne",
      stars: 5,
    },
    {
      quote: "Gérer 3 structures depuis un seul écran, c'est un game-changer. Les exports PDF sont impeccables pour la PMI.",
      name: "Aurélie M.",
      role: "Gestionnaire, réseau de micro-crèches",
      stars: 5,
    },
  ];

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Ce qu&apos;en disent les pros
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {temoignages.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-bold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 9 — CONFORMITÉ RÉGLEMENTAIRE ═══

function Conformite() {
  const reglements = [
    { label: "Règlement (CE) n°852/2004", desc: "Paquet Hygiène — HACCP obligatoire" },
    { label: "Plan de Maîtrise Sanitaire", desc: "PMS complet, numérisé et exportable" },
    { label: "Relevés de température", desc: "Quotidiens, horodatés, avec actions correctives" },
    { label: "Traçabilité alimentaire", desc: "Lot, fournisseur, DLC — conservation 3 ans" },
    { label: "Recommandations ANSES", desc: "Biberonnerie conforme (délai 1h, nettoyage)" },
    { label: "Contrôles DDPP", desc: "Registres exploitables, export PDF instantané" },
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            100% conforme à la réglementation française
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            PetitSafe intègre toutes les exigences réglementaires dans ses formulaires et exports.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reglements.map((r) => (
            <div key={r.label} className="bg-white rounded-xl p-5 border border-gray-100 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">{r.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
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
    <section id="tarifs" className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
          Un prix simple et transparent
        </h2>
        <p className="text-center text-gray-500 mb-12">14 jours gratuits. Sans engagement. Sans carte bancaire.</p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* HACCP Essentiel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">HACCP Essentiel</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Assistantes maternelles & MAM</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">9</span>
              <span className="text-gray-500 text-sm">&euro;/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {["Températures", "Traçabilité", "Nettoyage", "Biberonnerie ANSES", "Export PDF DDPP"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full border-2 border-[#2E86C1] text-[#2E86C1] py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              aria-label="Essayer HACCP Essentiel gratuitement"
            >
              Essayer gratuitement
            </button>
          </div>

          {/* Complet */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#2E86C1] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E86C1] text-white text-xs font-bold px-4 py-1 rounded-full">
              Populaire
            </div>
            <h3 className="text-lg font-bold text-gray-900">Complet</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Micro-crèches & crèches</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">29</span>
              <span className="text-gray-500 text-sm">&euro;/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {["Tout HACCP Essentiel", "Suivi repas, changes, siestes", "Transmissions", "Stocks & alertes", "Portail parents", "Dashboard multi-structures"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full bg-[#2E86C1] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2574A9] transition-colors"
              aria-label="Essayer le plan Complet gratuitement"
            >
              Essayer gratuitement
            </button>
          </div>

          {/* Réseau */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Réseau</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Gestionnaires multi-structures</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">Sur devis</span>
            </div>
            <ul className="space-y-3 mb-6">
              {["Tout Complet", "Dashboard consolidé", "3+ structures", "Support prioritaire", "Onboarding dédié"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full border-2 border-[#2E86C1] text-[#2E86C1] py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              aria-label="Nous contacter pour le plan Réseau"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 11 — SÉCURITÉ ═══

function Securite() {
  return (
    <section className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12">
          Vos données sont en sécurité
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2E86C1] flex items-center justify-center mx-auto mb-4">
              <Lock size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Chiffrement</h3>
            <p className="text-sm text-gray-600">Données chiffrées en transit et au repos. Hébergement européen.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2E86C1] flex items-center justify-center mx-auto mb-4">
              <Shield size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Isolation</h3>
            <p className="text-sm text-gray-600">Chaque structure a ses propres données. Aucun accès croisé possible.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2E86C1] flex items-center justify-center mx-auto mb-4">
              <Zap size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Sauvegardes</h3>
            <p className="text-sm text-gray-600">Sauvegardes automatiques quotidiennes. Données conservées 3 ans minimum.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 12 — FAQ ═══

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const items = [
    {
      q: "Est-ce que PetitSafe remplace mon classeur HACCP papier ?",
      a: "Oui. PetitSafe numérise intégralement votre registre HACCP : relevés de température, traçabilité alimentaire, plan de nettoyage, biberonnerie. Les données sont horodatées, exportables en PDF et conformes aux exigences de la DDPP.",
    },
    {
      q: "Combien de temps faut-il pour être opérationnel ?",
      a: "5 minutes. Créez votre compte, ajoutez vos enfants et vos équipements (frigo, congélateur), et commencez vos saisies. Les zones de nettoyage sont pré-remplies avec un plan type.",
    },
    {
      q: "Faut-il une connexion internet ?",
      a: "Oui, PetitSafe fonctionne en ligne sur tablette ou smartphone. La connexion permet la synchronisation en temps réel entre les appareils de votre structure.",
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "Vos données sont hébergées en Europe, chiffrées en transit et au repos. Chaque structure a un espace isolé. Les sauvegardes sont automatiques et quotidiennes.",
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment. Vos données restent accessibles en lecture pendant 30 jours après l'annulation.",
    },
    {
      q: "Les parents ont-ils accès à PetitSafe ?",
      a: "Oui, le portail parents (inclus dans le plan Complet) permet aux parents de consulter la journée de leur enfant en lecture seule : repas, siestes, changes. Ils ne voient que les données de leur enfant.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
                aria-label={item.q}
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{item.q}</span>
                <ChevronRight size={18} className={`text-gray-400 shrink-0 transition-transform ${openIdx === i ? "rotate-90" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══ SECTION 13 — FORMULAIRE DÉMO ═══

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
      toast.success("Demande envoyée ! Nous vous recontactons sous 24h.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <section id="demo" className="py-16 md:py-20 px-4 bg-[#F5F7FA]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Demandez votre démo gratuite
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
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
                  Téléphone
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
                  <option value="" disabled>Sélectionnez...</option>
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
                  <option value="" disabled>Sélectionnez...</option>
                  <option value="1">1</option>
                  <option value="2-5">2 à 5</option>
                  <option value="6-10">6 à 10</option>
                  <option value="10+">Plus de 10</option>
                </select>
                {errors.nombre_structures && <p className="text-xs text-red-500 mt-1">{errors.nombre_structures.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2E86C1] text-white py-4 rounded-xl text-base font-semibold hover:bg-[#2574A9] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              aria-label="Envoyer la demande de démo"
            >
              {isSubmitting ? "Envoi en cours..." : "Demander ma démo gratuite"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

            <p className="text-xs text-gray-400 text-center">
              En soumettant ce formulaire, vous acceptez d&apos;être recontacté par l&apos;équipe PetitSafe.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

// ═══ FOOTER ═══

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
              Le registre HACCP numérique pour la petite enfance en France.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => document.getElementById("fonctionnalites")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">Fonctionnalités</button></li>
              <li><button onClick={() => document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">Tarifs</button></li>
              <li><button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">FAQ</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Réglementation</h4>
            <ul className="space-y-2 text-sm">
              <li>HACCP & Paquet Hygiène</li>
              <li>Plan de Maîtrise Sanitaire</li>
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
          <p className="text-xs">&copy; {new Date().getFullYear()} PetitSafe. Tous droits réservés.</p>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-white cursor-pointer transition-colors">Mentions légales</span>
            <span className="hover:text-white cursor-pointer transition-colors">Politique de confidentialité</span>
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
      <CommentCaMarche />
      <TypesStructures />
      <Temoignages />
      <Conformite />
      <Tarifs />
      <Securite />
      <FAQ />
      <FormulaireDemoSection />
      <Footer />
    </main>
  );
}
