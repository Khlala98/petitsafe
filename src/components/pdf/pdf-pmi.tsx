import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TYPES_STRUCTURE } from "@/lib/constants";
import type { ExportPMIData } from "@/app/actions/exports";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Footer({ date }: { date: string }) {
  return (
    <Text style={s.footer} fixed>
      Généré par PetitSafe — {formatDate(date)} — Document à valeur probante
    </Text>
  );
}

const TYPE_REPAS_LABELS: Record<string, string> = {
  PETIT_DEJ: "Petit-déj",
  DEJEUNER: "Déjeuner",
  GOUTER: "Goûter",
  DINER: "Dîner",
};

export function PdfPMI({ data }: { data: ExportPMIData }) {
  const typeLabel = TYPES_STRUCTURE[data.structure.type as keyof typeof TYPES_STRUCTURE] ?? data.structure.type;

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={s.coverPage}>
        <Text style={s.coverTitle}>PetitSafe</Text>
        <Text style={s.coverSubtitle}>Rapport PMI — Petite enfance</Text>
        <Text style={s.coverInfo}>{data.structure.nom}</Text>
        <Text style={s.coverInfo}>{typeLabel}</Text>
        <Text style={{ ...s.coverInfo, marginTop: 30 }}>
          Période : {formatDate(data.periode.debut)} — {formatDate(data.periode.fin)}
        </Text>
        <Text style={s.coverInfo}>Généré le {formatDate(data.dateGeneration)}</Text>
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Bilan biberonnerie */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>1. Bilan biberonnerie</Text>
        {data.biberons.length === 0 ? (
          <Text style={s.emptyText}>Aucun biberon sur la période.</Text>
        ) : (
          <>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 9, color: "#4A5568" }}>
                Total : {data.biberons.length} biberons — Conformité ANSES : {Math.round((data.biberons.filter((b) => b.conforme_anses).length / data.biberons.length) * 100)}%
              </Text>
            </View>
            <View>
              <View style={s.tableHeader}>
                <Text style={{ ...s.headerCell, width: "15%" }}>Date</Text>
                <Text style={{ ...s.headerCell, width: "18%" }}>Enfant</Text>
                <Text style={{ ...s.headerCell, width: "15%" }}>Type lait</Text>
                <Text style={{ ...s.headerCell, width: "17%" }}>Lot</Text>
                <Text style={{ ...s.headerCell, width: "20%" }}>Préparateur</Text>
                <Text style={{ ...s.headerCell, width: "15%" }}>ANSES</Text>
              </View>
              {data.biberons.map((b, i) => (
                <View key={i} style={b.conforme_anses ? s.tableRow : s.tableRowAlert}>
                  <Text style={{ ...s.cell, width: "15%" }}>{formatDate(b.date)}</Text>
                  <Text style={{ ...s.cell, width: "18%" }}>{b.enfant_prenom}</Text>
                  <Text style={{ ...s.cell, width: "15%" }}>{b.type_lait}</Text>
                  <Text style={{ ...s.cell, width: "17%" }}>{b.numero_lot}</Text>
                  <Text style={{ ...s.cell, width: "20%" }}>{b.preparateur_nom}</Text>
                  <Text style={{ ...(b.conforme_anses ? s.cellOk : s.cellAlert), width: "15%" }}>
                    {b.conforme_anses ? "Oui" : "Non"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Suivi repas */}
        <Text style={s.sectionTitle}>2. Suivi repas</Text>
        {data.repas.length === 0 ? (
          <Text style={s.emptyText}>Aucun repas sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "12%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Enfant</Text>
              <Text style={{ ...s.headerCell, width: "14%" }}>Type</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Entrée</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Plat</Text>
              <Text style={{ ...s.headerCell, width: "16%" }}>Dessert</Text>
            </View>
            {data.repas.map((r, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "12%" }}>{formatDate(r.date)}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{r.enfant_prenom}</Text>
                <Text style={{ ...s.cell, width: "14%" }}>{TYPE_REPAS_LABELS[r.type_repas] ?? r.type_repas}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>{r.entree ?? "—"}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>{r.plat ?? "—"}</Text>
                <Text style={{ ...s.cell, width: "16%" }}>{r.dessert ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Siestes + transmissions */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>3. Suivi siestes</Text>
        {data.siestes.length === 0 ? (
          <Text style={s.emptyText}>Aucune sieste sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "15%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Enfant</Text>
              <Text style={{ ...s.headerCell, width: "30%" }}>Durée</Text>
              <Text style={{ ...s.headerCell, width: "30%" }}>Qualité</Text>
            </View>
            {data.siestes.map((si, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "15%" }}>{formatDate(si.date)}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{si.enfant_prenom}</Text>
                <Text style={{ ...s.cell, width: "30%" }}>{si.duree_minutes ? `${si.duree_minutes} min` : "En cours"}</Text>
                <Text style={{ ...s.cell, width: "30%" }}>{si.qualite ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.sectionTitle}>4. Transmissions</Text>
        {data.transmissions.length === 0 ? (
          <Text style={s.emptyText}>Aucune transmission sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "12%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Enfant</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>Auteur</Text>
              <Text style={{ ...s.headerCell, width: "55%" }}>Contenu</Text>
            </View>
            {data.transmissions.map((t, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "12%" }}>{formatDate(t.date)}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{t.enfant_prenom ?? "Général"}</Text>
                <Text style={{ ...s.cell, width: "15%" }}>{t.auteur}</Text>
                <Text style={{ ...s.cell, width: "55%" }}>{t.contenu}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Protocoles */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>5. Protocoles en vigueur</Text>
        {data.protocoles.length === 0 ? (
          <Text style={s.emptyText}>Aucun protocole actif.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "45%" }}>Titre</Text>
              <Text style={{ ...s.headerCell, width: "35%" }}>Catégorie</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Version</Text>
            </View>
            {data.protocoles.map((p, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "45%" }}>{p.titre}</Text>
                <Text style={{ ...s.cell, width: "35%" }}>{p.categorie}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>v{p.version}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>
    </Document>
  );
}
