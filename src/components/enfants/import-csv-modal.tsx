"use client";

import { useState } from "react";
import { importerEnfants, checkDoublons } from "@/app/actions/enfants";
import { toast } from "sonner";
import { X, Upload, Download, Loader2, Check, AlertTriangle, XCircle } from "lucide-react";

interface ImportCSVModalProps {
  structureId: string;
  onClose: () => void;
  onImported: () => void;
}

interface ParsedRow {
  prenom: string; nom: string; date_naissance?: string; sexe?: string; groupe?: string;
  allergies: { allergene: string; severite: string }[];
  valid: boolean; warning?: string; error?: string; doublon?: boolean;
}

export function ImportCSVModal({ structureId, onClose, onImported }: ImportCSVModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);

  const parseCSV = (text: string): ParsedRow[] => {
    // Detect separator
    const firstLine = text.split("\n")[0];
    const sep = firstLine.includes(";") ? ";" : ",";
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/"/g, "").replace(/^\ufeff/, ""));
    const colMap: Record<string, number> = {};

    headers.forEach((h, i) => {
      if (h.includes("prenom") || h.includes("prénom") || h === "firstname") colMap.prenom = i;
      else if (h.includes("nom") || h === "lastname") colMap.nom = i;
      else if (h.includes("naissance") || h === "date_naissance" || h === "birthdate") colMap.date_naissance = i;
      else if (h.includes("sexe") || h === "gender") colMap.sexe = i;
      else if (h.includes("groupe") || h === "group") colMap.groupe = i;
      else if (h.includes("allergene_1") || h.includes("allergène_1")) colMap.allergene_1 = i;
      else if (h.includes("severite_1") || h.includes("sévérité_1")) colMap.severite_1 = i;
      else if (h.includes("allergene_2")) colMap.allergene_2 = i;
      else if (h.includes("severite_2")) colMap.severite_2 = i;
      else if (h.includes("allergene_3")) colMap.allergene_3 = i;
      else if (h.includes("severite_3")) colMap.severite_3 = i;
    });

    // If no prenom/nom found, try first two columns
    if (colMap.prenom === undefined) colMap.prenom = 0;
    if (colMap.nom === undefined) colMap.nom = 1;

    return lines.slice(1).filter((l) => l.trim()).map((line) => {
      const cols = line.split(sep).map((c) => c.trim().replace(/"/g, ""));
      const prenom = cols[colMap.prenom] ?? "";
      const nom = cols[colMap.nom] ?? "";
      const allergies: { allergene: string; severite: string }[] = [];
      for (let n = 1; n <= 3; n++) {
        const allerKey = `allergene_${n}` as keyof typeof colMap;
        const sevKey = `severite_${n}` as keyof typeof colMap;
        if (colMap[allerKey] !== undefined && cols[colMap[allerKey]]) {
          allergies.push({ allergene: cols[colMap[allerKey]], severite: cols[colMap[sevKey]] ?? "MODEREE" });
        }
      }

      const row: ParsedRow = {
        prenom, nom,
        date_naissance: colMap.date_naissance !== undefined ? cols[colMap.date_naissance] : undefined,
        sexe: colMap.sexe !== undefined ? cols[colMap.sexe] : undefined,
        groupe: colMap.groupe !== undefined ? cols[colMap.groupe] : undefined,
        allergies, valid: true,
      };

      if (!prenom) { row.valid = false; row.error = "Prénom manquant"; }
      else if (!nom) { row.valid = false; row.error = "Nom manquant"; }
      else if (!row.date_naissance) { row.warning = "Date de naissance manquante"; }

      return row;
    });
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) { toast.error("Aucune donnée trouvée dans le fichier."); return; }

    // Check doublons
    const doublonsResult = await checkDoublons(structureId, parsed.map((r) => ({ prenom: r.prenom, nom: r.nom })));
    if (doublonsResult.success && doublonsResult.data.length > 0) {
      const doublonNames = new Set(doublonsResult.data.map((d) => `${d.prenom.toLowerCase()}-${d.nom.toLowerCase()}`));
      parsed.forEach((r) => {
        if (doublonNames.has(`${r.prenom.toLowerCase()}-${r.nom.toLowerCase()}`)) {
          r.doublon = true;
          r.warning = "Cet enfant existe peut-être déjà";
        }
      });
    }

    setRows(parsed);
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) { toast.error("Aucune ligne valide à importer."); return; }
    setImporting(true);
    const res = await importerEnfants(structureId, validRows);
    setImporting(false);
    if (res.success && res.data) {
      setResult(res.data);
      setStep(3);
      onImported();
    } else {
      toast.error(res.error ?? "Erreur lors de l'import.");
    }
  };

  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const validCount = rows.filter((r) => r.valid).length;
  const warningCount = rows.filter((r) => r.warning && r.valid).length;
  const errorCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Importer des enfants</h2>
          <button onClick={onClose} aria-label="Fermer"><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Step 1 — Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-petitsafe-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById("csv-input")?.click()}>
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Glissez votre fichier .csv ici ou cliquez pour parcourir</p>
                <p className="text-xs text-gray-400 mt-1">Importez depuis Meeko, LiveKid, Agathe You, etc.</p>
                <input id="csv-input" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              <a href="/modele-import-enfants.csv" download className="flex items-center gap-2 text-sm text-petitsafe-primary hover:underline justify-center">
                <Download size={14} /> Télécharger le modèle CSV
              </a>
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600"><Check size={14} /> {validCount} prêts</span>
                {warningCount > 0 && <span className="flex items-center gap-1 text-orange-500"><AlertTriangle size={14} /> {warningCount} warnings</span>}
                {errorCount > 0 && <span className="flex items-center gap-1 text-red-500"><XCircle size={14} /> {errorCount} erreurs</span>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Prénom</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Nom</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Naissance</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Groupe</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Allergies</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`border-b ${!row.valid ? "bg-red-50" : row.doublon ? "bg-orange-50" : ""}`}>
                        <td className="py-2 px-2">{row.prenom || <span className="text-red-400">—</span>}</td>
                        <td className="py-2 px-2">{row.nom || <span className="text-red-400">—</span>}</td>
                        <td className="py-2 px-2 text-gray-500">{row.date_naissance || "—"}</td>
                        <td className="py-2 px-2 text-gray-500">{row.groupe || "—"}</td>
                        <td className="py-2 px-2">{row.allergies.length > 0 ? row.allergies.map((a) => a.allergene).join(", ") : "—"}</td>
                        <td className="py-2 px-2">
                          {!row.valid && <span className="text-xs text-red-500">{row.error}</span>}
                          {row.valid && row.warning && <span className="text-xs text-orange-500">{row.warning}</span>}
                          {row.valid && !row.warning && <Check size={14} className="text-green-500" />}
                        </td>
                        <td className="py-2 px-2">
                          <button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500" aria-label="Supprimer"><X size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 3 — Result */}
          {step === 3 && result && (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800">{result.imported} enfant{result.imported > 1 ? "s" : ""} importé{result.imported > 1 ? "s" : ""}</p>
              {result.failed > 0 && <p className="text-sm text-red-500">{result.failed} erreur{result.failed > 1 ? "s" : ""}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
          {step === 1 && <button onClick={onClose} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Annuler</button>}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="h-10 px-4 rounded-xl border border-gray-300 text-sm text-gray-600">Retour</button>
              <button onClick={handleImport} disabled={importing || validCount === 0}
                className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium hover:bg-petitsafe-primary/90 disabled:opacity-50 flex items-center gap-2">
                {importing && <Loader2 size={16} className="animate-spin" />}
                Importer {validCount} enfant{validCount > 1 ? "s" : ""}
              </button>
            </>
          )}
          {step === 3 && <button onClick={onClose} className="h-10 px-6 rounded-xl bg-petitsafe-primary text-white text-sm font-medium">Fermer</button>}
        </div>
      </div>
    </div>
  );
}
