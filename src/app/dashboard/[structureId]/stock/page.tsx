"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReceptions, creerReception, marquerProduit, getFournisseurs, getStocks, creerStock, ajusterStock } from "@/app/actions/stock";
import { getAlerteDLC } from "@/lib/business-logic";
import { SEUILS_TEMPERATURE } from "@/lib/constants";
import { PastilleStatut } from "@/components/shared/pastille-statut";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Plus, AlertTriangle, Minus } from "lucide-react";

interface Reception { id: string; nom_produit: string; fournisseur: string; numero_lot: string; dlc: string; temperature_reception?: number | null; conforme: boolean; statut: string; motif_non_conformite?: string | null }
interface Stock { id: string; categorie: string; produit_nom: string; quantite: number; unite: string; seuil_alerte: number }

const CATEGORIES = [{ v: "COUCHES", l: "Couches" }, { v: "ENTRETIEN", l: "Entretien" }, { v: "LAIT", l: "Lait" }, { v: "COMPOTES", l: "Compotes" }, { v: "AUTRE", l: "Autre" }];

export default function StockPage() {
  const params = useParams();
  const structureId = params.structureId as string;
  const { user } = useAuth();
  const proId = user?.id ?? "";
  const proNom = user?.user_metadata?.prenom ?? "";

  const [tab, setTab] = useState<"receptions" | "alimentaire" | "consommables">("receptions");
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [fournisseurs, setFournisseurs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form réception
  const [showForm, setShowForm] = useState(false);
  const [fNom, setFNom] = useState(""); const [fFourn, setFFourn] = useState(""); const [fLot, setFLot] = useState("");
  const [fDlc, setFDlc] = useState(""); const [fTemp, setFTemp] = useState<number | "">("");
  const [fEmballage, setFEmballage] = useState(true); const [fConforme, setFConforme] = useState(true); const [fMotif, setFMotif] = useState("");

  // Form stock
  const [showStockForm, setShowStockForm] = useState(false);
  const [sNom, setSNom] = useState(""); const [sCat, setSCat] = useState("COUCHES"); const [sQte, setSQte] = useState<number>(0);
  const [sUnite, setSUnite] = useState("paquets"); const [sSeuil, setSSeuil] = useState<number>(5);

  const fetchData = async () => {
    const [recRes, stockRes, fournRes] = await Promise.all([
      getReceptions(structureId), getStocks(structureId), getFournisseurs(structureId),
    ]);
    if (recRes.success && recRes.data) setReceptions(recRes.data.map((r) => ({ ...r, dlc: r.dlc.toISOString() })));
    if (stockRes.success && stockRes.data) setStocks(stockRes.data);
    if (fournRes.success && fournRes.data) setFournisseurs(fournRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [structureId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReception = async () => {
    if (!fNom || !fFourn || !fLot || !fDlc) { toast.error("Remplissez les champs obligatoires."); return; }
    if (!fConforme && !fMotif) { toast.error("Motif de non-conformité obligatoire."); return; }
    const result = await creerReception({
      structure_id: structureId, nom_produit: fNom, fournisseur: fFourn, numero_lot: fLot,
      dlc: fDlc, temperature_reception: fTemp !== "" ? Number(fTemp) : undefined,
      emballage_conforme: fEmballage, conforme: fConforme,
      motif_non_conformite: fMotif || undefined, professionnel_id: proId,
    });
    if (result.success) { toast.success("Réception enregistrée !"); setShowForm(false); setFNom(""); setFFourn(""); setFLot(""); setFDlc(""); setFTemp(""); setFMotif(""); fetchData(); }
    else toast.error(result.error);
  };

  const handleAddStock = async () => {
    if (!sNom) { toast.error("Nom du produit requis."); return; }
    const result = await creerStock({ structure_id: structureId, categorie: sCat, produit_nom: sNom, quantite: sQte, unite: sUnite, seuil_alerte: sSeuil, maj_par: proNom });
    if (result.success) { toast.success("Produit ajouté !"); setShowStockForm(false); setSNom(""); fetchData(); }
    else toast.error(result.error);
  };

  const handleAjuster = async (stockId: string, delta: number) => {
    const result = await ajusterStock(stockId, delta, proNom);
    if (result.success) fetchData();
    else toast.error(result.error);
  };

  const handleMarquer = async (id: string, statut: "UTILISE" | "JETE") => {
    const result = await marquerProduit(id, statut, statut === "JETE" ? "DLC dépassée" : undefined);
    if (result.success) { toast.success("Produit mis à jour !"); fetchData(); }
    else toast.error(result.error);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-petitsafe-primary" /></div>;

  const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-petitsafe-primary focus:ring-2 focus:ring-petitsafe-primary/20 outline-none text-sm";
  const now = new Date();
  const enStock = receptions.filter((r) => r.statut === "EN_STOCK");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Réceptions &amp; Stock</h1>

      <div className="flex gap-1 border-b border-gray-200">
        {[{ k: "receptions", l: "Réceptions" }, { k: "alimentaire", l: "Stock alimentaire" }, { k: "consommables", l: "Consommables" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === t.k ? "border-petitsafe-primary text-petitsafe-primary" : "border-transparent text-gray-500"}`}>{t.l}</button>
        ))}
      </div>

      {/* ═══ RÉCEPTIONS ═══ */}
      {tab === "receptions" && (
        <div className="space-y-4">
          <button onClick={() => setShowForm(true)} className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Nouvelle réception</button>

          {showForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Nouvelle réception</h3>
              <input type="text" value={fNom} onChange={(e) => setFNom(e.target.value)} placeholder="Nom du produit" className={inputClass} />
              <div className="relative">
                <input type="text" value={fFourn} onChange={(e) => setFFourn(e.target.value)} placeholder="Fournisseur" className={inputClass} list="fournisseurs-list" />
                <datalist id="fournisseurs-list">{fournisseurs.map((f) => <option key={f} value={f} />)}</datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={fLot} onChange={(e) => setFLot(e.target.value)} placeholder="Numéro de lot" className={inputClass} />
                <input type="date" value={fDlc} onChange={(e) => setFDlc(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">T° réception (°C)</label>
                  <input type="number" step="0.1" value={fTemp} onChange={(e) => setFTemp(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={fEmballage} onChange={(e) => setFEmballage(e.target.checked)} className="h-4 w-4 rounded" /> Emballage intact
                  </label>
                </div>
              </div>
              {fTemp !== "" && Number(fTemp) > SEUILS_TEMPERATURE.frigo_max && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50"><AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" /><p className="text-xs text-orange-700">Température réception &gt; {SEUILS_TEMPERATURE.frigo_max}°C. Produit potentiellement non conforme.</p></div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fConforme} onChange={(e) => setFConforme(e.target.checked)} className="h-4 w-4 rounded" /> Produit conforme
              </label>
              {!fConforme && (
                <input type="text" value={fMotif} onChange={(e) => setFMotif(e.target.value)} placeholder="Motif de non-conformité (obligatoire)" className={`${inputClass} border-red-300`} />
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>
                <button onClick={handleReception} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Enregistrer</button>
              </div>
            </div>
          )}

          {receptions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100"><p className="text-gray-400">Aucune réception enregistrée</p></div>
          ) : (
            <div className="space-y-2">
              {receptions.slice(0, 20).map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <PastilleStatut status={r.conforme ? "conforme" : "alerte"} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{r.nom_produit}</p>
                    <p className="text-xs text-gray-500">{r.fournisseur} · Lot {r.numero_lot} · DLC {new Date(r.dlc).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.statut === "EN_STOCK" ? "bg-blue-100 text-blue-700" : r.statut === "UTILISE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.statut === "EN_STOCK" ? "En stock" : r.statut === "UTILISE" ? "Utilisé" : "Jeté"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ STOCK ALIMENTAIRE ═══ */}
      {tab === "alimentaire" && (
        <div className="space-y-3">
          {enStock.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100"><p className="text-gray-400">Aucun produit en stock</p></div>
          ) : (
            enStock.sort((a, b) => new Date(a.dlc).getTime() - new Date(b.dlc).getTime()).map((r) => {
              const alerte = getAlerteDLC(new Date(r.dlc), now);
              const badgeClass = alerte === "critique" ? "bg-red-600 text-white" : alerte === "alerte" ? "bg-red-100 text-red-700" : alerte === "warning" ? "bg-orange-100 text-orange-700" : "";
              const badgeText = alerte === "critique" ? "DLC DÉPASSÉE — À JETER" : alerte === "alerte" ? "DLC AUJOURD'HUI" : alerte === "warning" ? "DLC J-2" : "";

              return (
                <div key={r.id} className={`bg-white rounded-xl p-4 shadow-sm border ${alerte === "critique" ? "border-red-300 bg-red-50" : alerte === "alerte" ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{r.nom_produit}</p>
                      <p className="text-xs text-gray-500">{r.fournisseur} · Lot {r.numero_lot} · DLC {new Date(r.dlc).toLocaleDateString("fr-FR")}</p>
                    </div>
                    {badgeText && <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>{badgeText}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleMarquer(r.id, "UTILISE")} className="h-9 px-3 rounded-lg bg-green-500 text-white text-xs font-medium">Marqué utilisé</button>
                    <button onClick={() => handleMarquer(r.id, "JETE")} className="h-9 px-3 rounded-lg bg-red-500 text-white text-xs font-medium">Marqué jeté</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ CONSOMMABLES ═══ */}
      {tab === "consommables" && (
        <div className="space-y-4">
          <button onClick={() => setShowStockForm(true)} className="h-10 px-4 rounded-xl bg-petitsafe-primary text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Ajouter un produit</button>

          {showStockForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-semibold text-gray-700">Ajouter un produit</h3>
              <input type="text" value={sNom} onChange={(e) => setSNom(e.target.value)} placeholder="Nom du produit" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <select value={sCat} onChange={(e) => setSCat(e.target.value)} className={`${inputClass} bg-white`}>
                  {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
                <input type="text" value={sUnite} onChange={(e) => setSUnite(e.target.value)} placeholder="Unité (paquets, litres...)" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-600">Quantité</label><input type="number" value={sQte} onChange={(e) => setSQte(Number(e.target.value))} className={inputClass} /></div>
                <div><label className="text-sm text-gray-600">Seuil alerte</label><input type="number" value={sSeuil} onChange={(e) => setSSeuil(Number(e.target.value))} className={inputClass} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStockForm(false)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>
                <button onClick={handleAddStock} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Ajouter</button>
              </div>
            </div>
          )}

          {stocks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100"><p className="text-gray-400">Aucun stock configuré</p></div>
          ) : (
            CATEGORIES.map((cat) => {
              const catStocks = stocks.filter((s) => s.categorie === cat.v);
              if (catStocks.length === 0) return null;
              return (
                <div key={cat.v}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{cat.l}</h3>
                  <div className="space-y-2">
                    {catStocks.map((s) => {
                      const statut = s.quantite <= 0 ? "alerte" : s.quantite <= s.seuil_alerte ? "attention" : "conforme";
                      return (
                        <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                          <PastilleStatut status={statut} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">{s.produit_nom}</p>
                            <p className="text-xs text-gray-500">{s.quantite} {s.unite} (seuil: {s.seuil_alerte})</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleAjuster(s.id, -1)} className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50" aria-label="Retirer 1"><Minus size={16} /></button>
                            <span className="w-10 text-center font-mono font-bold">{s.quantite}</span>
                            <button onClick={() => handleAjuster(s.id, 1)} className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50" aria-label="Ajouter 1"><Plus size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
