"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Veuillez entrer votre email."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) { toast.error("Erreur lors de l'envoi. Réessayez."); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-petitsafe-fond flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-petitsafe-primary">PetitSafe</h1>
          <p className="mt-2 text-sm text-gray-500">Réinitialiser votre mot de passe</p>
        </div>
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
            <p className="text-green-800 font-medium">Email envoyé !</p>
            <p className="text-sm text-green-700">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-petitsafe-primary hover:underline mt-4">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com"
                className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none" autoComplete="email" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={20} className="animate-spin" />} Envoyer le lien
            </button>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-petitsafe-primary">
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
