"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { TYPES_STRUCTURE } from "@/lib/constants";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [typeStructure, setTypeStructure] = useState("");
  const [nomStructure, setNomStructure] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !prenom || !nom || !typeStructure || !nomStructure) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom },
      },
    });
    if (authError) {
      setLoading(false);
      if (authError.message.includes("already registered")) {
        toast.error("Cet email est déjà utilisé.");
      } else {
        toast.error("Erreur lors de l'inscription. Réessayez.");
      }
      return;
    }
    if (authData.user) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          typeStructure,
          nomStructure,
        }),
      });
      if (!res.ok) {
        setLoading(false);
        toast.error("Compte créé mais erreur lors de la création de la structure.");
        return;
      }
    }
    setLoading(false);
    toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-petitsafe-fond flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-petitsafe-primary">PetitSafe</h1>
          <p className="mt-2 text-sm text-gray-500">Créer votre compte</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Marie"
                className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de structure
            </label>
            <select
              id="type"
              value={typeStructure}
              onChange={(e) => setTypeStructure(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors bg-white"
            >
              <option value="">Sélectionnez...</option>
              {Object.entries(TYPES_STRUCTURE).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nomStructure" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la structure
            </label>
            <input
              id="nomStructure"
              type="text"
              value={nomStructure}
              onChange={(e) => setNomStructure(e.target.value)}
              placeholder="Les Petits Explorateurs"
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 active:bg-petitsafe-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-petitsafe-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
