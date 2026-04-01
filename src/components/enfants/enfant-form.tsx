"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { creerEnfant, modifierEnfant } from "@/app/actions/enfants";
import { GROUPES_ENFANTS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";

interface Allergie { allergene: string; severite: "LEGERE" | "MODEREE" | "SEVERE"; protocole?: string }
interface Contact { nom: string; lien: string; telephone: string; est_autorise_recuperer: boolean; ordre_priorite: number }

interface EnfantFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string; prenom: string; nom: string; date_naissance: string; sexe?: string | null; groupe?: string | null;
    allergies: Allergie[]; contacts: Contact[];
  };
}

export function EnfantForm({ mode, initial }: EnfantFormProps) {
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;
  const [loading, setLoading] = useState(false);

  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [dateNaissance, setDateNaissance] = useState(initial?.date_naissance ? initial.date_naissance.split("T")[0] : "");
  const [sexe, setSexe] = useState(initial?.sexe ?? "");
  const [groupe, setGroupe] = useState(initial?.groupe ?? "");
  const [allergies, setAllergies] = useState<Allergie[]>(initial?.allergies ?? []);
  const [contacts, setContacts] = useState<Contact[]>(initial?.contacts ?? []);

  const addAllergie = () => setAllergies([...allergies, { allergene: "", severite: "MODEREE" }]);
  const removeAllergie = (i: number) => setAllergies(allergies.filter((_, idx) => idx !== i));
  const updateAllergie = (i: number, field: string, value: string) => {
    const copy = [...allergies];
    (copy[i] as Record<string, string>)[field] = value;
    setAllergies(copy);
  };

  const addContact = () => setContacts([...contacts, { nom: "", lien: "", telephone: "", est_autorise_recuperer: true, ordre_priorite: contacts.length + 1 }]);
  const removeContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: string, value: string | boolean | number) => {
    const copy = [...contacts];
    (copy[i] as Record<string, string | boolean | number>)[field] = value;
    setContacts(copy);
  };

  const handleSubmit = async () => {
    if (!prenom || !nom || !dateNaissance) { toast.error("Prénom, nom et date de naissance sont requis."); return; }
    setLoading(true);

    const data = {
      prenom, nom, date_naissance: dateNaissance,
      sexe: sexe === "FILLE" || sexe === "GARCON" ? sexe as "FILLE" | "GARCON" : null,
      groupe: groupe || null, photo_url: null,
      allergies: allergies.filter((a) => a.allergene),
      contacts: contacts.filter((c) => c.nom && c.telephone),
    };

    const result = mode === "create"
      ? await creerEnfant(structureId, data)
      : await modifierEnfant(initial!.id, structureId, data);

    setLoading(false);
    if (result.success) {
      toast.success(mode === "create" ? "Enfant ajouté !" : "Enfant modifié !");
      router.push(`/dashboard/${structureId}/enfants`);
    } else {
      toast.error(result.error);
    }
  };

  const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-petitsafe-primary">
        <ArrowLeft size={16} /> Retour
      </button>

      <h1 className="text-2xl font-bold text-gray-800">{mode === "create" ? "Ajouter un enfant" : "Modifier l'enfant"}</h1>

      {/* Infos de base */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-gray-700">Informations</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Emma" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Martin" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
            <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <select value={sexe} onChange={(e) => setSexe(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">—</option>
              <option value="FILLE">Fille</option>
              <option value="GARCON">Garçon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
            <select value={groupe} onChange={(e) => setGroupe(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">—</option>
              {GROUPES_ENFANTS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Allergies</h2>
          <button onClick={addAllergie} className="text-sm text-petitsafe-primary hover:underline flex items-center gap-1"><Plus size={14} /> Ajouter</button>
        </div>
        {allergies.length === 0 && <p className="text-sm text-gray-400">Aucune allergie.</p>}
        {allergies.map((a, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1">
              <input type="text" value={a.allergene} onChange={(e) => updateAllergie(i, "allergene", e.target.value)} placeholder="Ex: Protéines de lait de vache" className={inputClass} />
            </div>
            <select value={a.severite} onChange={(e) => updateAllergie(i, "severite", e.target.value)} className="h-12 px-3 rounded-xl border border-gray-300 text-sm bg-white">
              <option value="LEGERE">Légère</option>
              <option value="MODEREE">Modérée</option>
              <option value="SEVERE">Sévère</option>
            </select>
            <button onClick={() => removeAllergie(i)} className="h-12 w-12 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 flex items-center justify-center shrink-0" aria-label="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Contacts urgence */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Contacts d&apos;urgence</h2>
          <button onClick={addContact} className="text-sm text-petitsafe-primary hover:underline flex items-center gap-1"><Plus size={14} /> Ajouter</button>
        </div>
        {contacts.length === 0 && <p className="text-sm text-gray-400">Aucun contact.</p>}
        {contacts.map((c, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-50 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={c.nom} onChange={(e) => updateContact(i, "nom", e.target.value)} placeholder="Nom" className={inputClass} />
              <input type="text" value={c.lien} onChange={(e) => updateContact(i, "lien", e.target.value)} placeholder="Lien (Mère, Père...)" className={inputClass} />
              <input type="tel" value={c.telephone} onChange={(e) => updateContact(i, "telephone", e.target.value)} placeholder="06 XX XX XX XX" className={inputClass} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={c.est_autorise_recuperer} onChange={(e) => updateContact(i, "est_autorise_recuperer", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-petitsafe-primary" />
                Autorisé à récupérer l&apos;enfant
              </label>
              <button onClick={() => removeContact(i)} className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><Trash2 size={14} /> Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full h-12 rounded-xl bg-petitsafe-primary text-white font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
        {loading && <Loader2 size={20} className="animate-spin" />}
        {mode === "create" ? "Ajouter l'enfant" : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
