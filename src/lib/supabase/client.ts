import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Lazy singleton pour Realtime et usage client-side. On évite l'évaluation
// au chargement du module : si les variables d'environnement publiques ne
// sont pas présentes (mauvaise config Vercel), une exception ici casserait
// l'hydratation de toutes les pages qui importent ce module.
let _client: SupabaseClient | null = null;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) _client = createClient();
    // @ts-expect-error - dynamic forwarding
    const value = _client[prop];
    return typeof value === "function" ? value.bind(_client) : value;
  },
});
