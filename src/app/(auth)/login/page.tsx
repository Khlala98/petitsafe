"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Veuillez confirmer votre email avant de vous connecter.");
      } else {
        toast.error("Erreur de connexion. Réessayez.");
      }
      return;
    }
    const redirect =
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("redirect")) ||
      "/dashboard";
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-rzpanda-fond flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center flex flex-col items-center">
          <Image src="/rzpanda-icon.svg" alt="RZPan'Da" width={64} height={64} priority unoptimized />
          <h1 className="mt-3 text-3xl font-bold text-rzpanda-primary">{"RZPan'Da"}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Conformité HACCP &amp; Traçabilité pour la Petite Enfance
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none transition-colors"
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
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-300 focus:border-rzpanda-primary focus:ring-2 focus:ring-rzpanda-primary/20 outline-none transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-rzpanda-primary text-white font-medium hover:bg-rzpanda-primary/90 active:bg-rzpanda-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            Se connecter
          </button>
        </form>

        <div className="text-center space-y-2 text-sm">
          <Link href="/forgot-password" className="text-rzpanda-primary hover:underline block">
            Mot de passe oublié ?
          </Link>
          <p className="text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-rzpanda-primary hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
