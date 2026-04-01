import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s } from "./pdf-styles";
import { TYPES_STRUCTURE } from "@/lib/constants";
import type { ExportDDPPData } from "@/app/actions/exports";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function Footer({ date }: { date: string }) {
  return (
    <Text style={s.footer} fixed>
      Généré par PetitSafe — {formatDate(date)} — Document à valeur probante
    </Text>
  );
}

export function PdfDDPP({ data }: { data: ExportDDPPData }) {
  const typeLabel = TYPES_STRUCTURE[data.structure.type as keyof typeof TYPES_STRUCTURE] ?? data.structure.type;

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={s.coverPage}>
        <Text style={s.coverTitle}>PetitSafe</Text>
        <Text style={s.coverSubtitle}>Rapport DDPP — Contrôle sanitaire</Text>
        <Text style={s.coverInfo}>{data.structure.nom}</Text>
        <Text style={s.coverInfo}>{typeLabel}</Text>
        {data.structure.adresse && <Text style={s.coverInfo}>{data.structure.adresse}</Text>}
        {data.structure.numero_agrement && <Text style={s.coverInfo}>Agrément : {data.structure.numero_agrement}</Text>}
        <Text style={{ ...s.coverInfo, marginTop: 30 }}>
          Période : {formatDate(data.periode.debut)} — {formatDate(data.periode.fin)}
        </Text>
        <Text style={s.coverInfo}>Généré le {formatDate(data.dateGeneration)}</Text>
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Section 1 : Relevés température */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>1. Relevés de température</Text>
        {data.releves.length === 0 ? (
          <Text style={s.emptyText}>Aucun relevé sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "15%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>Heure</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Équipement</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>Type</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>T°C</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>Conforme</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Action corrective</Text>
            </View>
            {data.releves.map((r) => (
              <View key={r.id} style={r.conforme ? s.tableRow : s.tableRowAlert}>
                <Text style={{ ...s.cell, width: "15%" }}>{formatDate(r.date)}</Text>
                <Text style={{ ...s.cell, width: "10%" }}>{formatHeure(r.heure)}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>{r.equipement_nom}</Text>
                <Text style={{ ...s.cell, width: "10%" }}>{r.equipement_type === "REFRIGERATEUR" ? "Frigo" : "Congél."}</Text>
                <Text style={{ ...s.cell, width: "10%" }}>{r.temperature}°C</Text>
                <Text style={{ ...(r.conforme ? s.cellOk : s.cellAlert), width: "10%" }}>{r.conforme ? "Oui" : "Non"}</Text>
                <Text style={{ ...(r.action_corrective ? s.cellAlert : s.cell), width: "25%" }}>{r.action_corrective ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section 2 : Plats témoins */}
        <Text style={s.sectionTitle}>2. Plats témoins</Text>
        {data.plats.length === 0 ? (
          <Text style={s.emptyText}>Aucun relevé plat sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "15%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Plat</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>T° avant</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>T° après</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>Conforme</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Action</Text>
            </View>
            {data.plats.map((p) => (
              <View key={p.id} style={p.conforme ? s.tableRow : s.tableRowAlert}>
                <Text style={{ ...s.cell, width: "15%" }}>{formatDate(p.date)}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{p.nom_plat}</Text>
                <Text style={{ ...s.cell, width: "15%" }}>{p.temperature_avant}°C</Text>
                <Text style={{ ...s.cell, width: "15%" }}>{p.temperature_apres}°C</Text>
                <Text style={{ ...(p.conforme ? s.cellOk : s.cellAlert), width: "10%" }}>{p.conforme ? "Oui" : "Non"}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>{p.action_corrective ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Section 3 : Réceptions marchandises */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>3. Réceptions marchandises</Text>
        {data.receptions.length === 0 ? (
          <Text style={s.emptyText}>Aucune réception sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "12%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Fournisseur</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Produit</Text>
              <Text style={{ ...s.headerCell, width: "14%" }}>Lot</Text>
              <Text style={{ ...s.headerCell, width: "12%" }}>DLC</Text>
              <Text style={{ ...s.headerCell, width: "10%" }}>T°C</Text>
              <Text style={{ ...s.headerCell, width: "8%" }}>Conf.</Text>
              <Text style={{ ...s.headerCell, width: "8%" }}>Statut</Text>
            </View>
            {data.receptions.map((r) => (
              <View key={r.id} style={r.conforme ? s.tableRow : s.tableRowAlert}>
                <Text style={{ ...s.cell, width: "12%" }}>{formatDate(r.date)}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{r.fournisseur}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{r.nom_produit}</Text>
                <Text style={{ ...s.cell, width: "14%" }}>{r.numero_lot}</Text>
                <Text style={{ ...s.cell, width: "12%" }}>{formatDate(r.dlc)}</Text>
                <Text style={{ ...s.cell, width: "10%" }}>{r.temperature_reception !== null ? `${r.temperature_reception}°C` : "—"}</Text>
                <Text style={{ ...(r.conforme ? s.cellOk : s.cellAlert), width: "8%" }}>{r.conforme ? "Oui" : "Non"}</Text>
                <Text style={{ ...s.cell, width: "8%" }}>{r.statut}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section 4 : Bilan nettoyage */}
        <Text style={s.sectionTitle}>4. Bilan nettoyage</Text>
        {data.nettoyage.length === 0 ? (
          <Text style={s.emptyText}>Aucune validation de nettoyage sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "15%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Zone</Text>
              <Text style={{ ...s.headerCell, width: "35%" }}>Tâche</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Professionnel</Text>
            </View>
            {data.nettoyage.map((n, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "15%" }}>{formatDate(n.date)}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{n.zone}</Text>
                <Text style={{ ...s.cell, width: "35%" }}>{n.tache}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{n.professionnel_nom}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>

      {/* Section 5+6+7 : Biberonnerie, alertes DLC, produits jetés */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>5. Traçabilité biberonnerie</Text>
        {data.biberons.length === 0 ? (
          <Text style={s.emptyText}>Aucun biberon sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "12%" }}>Date</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Enfant</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>Type lait</Text>
              <Text style={{ ...s.headerCell, width: "18%" }}>Lot</Text>
              <Text style={{ ...s.headerCell, width: "22%" }}>Préparateur</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>ANSES</Text>
            </View>
            {data.biberons.map((b) => (
              <View key={b.id} style={b.conforme_anses ? s.tableRow : s.tableRowAlert}>
                <Text style={{ ...s.cell, width: "12%" }}>{formatDate(b.date)}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{b.enfant_prenom}</Text>
                <Text style={{ ...s.cell, width: "15%" }}>{b.type_lait}</Text>
                <Text style={{ ...s.cell, width: "18%" }}>{b.numero_lot}</Text>
                <Text style={{ ...s.cell, width: "22%" }}>{b.preparateur_nom}</Text>
                <Text style={{ ...(b.conforme_anses ? s.cellOk : s.cellAlert), width: "15%" }}>{b.conforme_anses ? "Conforme" : "Non conf."}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.sectionTitle}>6. Alertes DLC</Text>
        {data.alertesDlc.length === 0 ? (
          <Text style={s.emptyText}>Aucune alerte DLC sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "30%" }}>Produit</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>DLC</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Fournisseur</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Statut</Text>
            </View>
            {data.alertesDlc.map((a, i) => (
              <View key={i} style={s.tableRowAlert}>
                <Text style={{ ...s.cellAlert, width: "30%" }}>{a.nom_produit}</Text>
                <Text style={{ ...s.cellAlert, width: "20%" }}>{formatDate(a.dlc)}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{a.fournisseur}</Text>
                <Text style={{ ...s.cellAlert, width: "25%" }}>{a.statut}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.sectionTitle}>7. Produits jetés / rappelés</Text>
        {data.produitsJetes.length === 0 ? (
          <Text style={s.emptyText}>Aucun produit jeté ou rappelé sur la période.</Text>
        ) : (
          <View>
            <View style={s.tableHeader}>
              <Text style={{ ...s.headerCell, width: "25%" }}>Produit</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>Lot</Text>
              <Text style={{ ...s.headerCell, width: "15%" }}>Statut</Text>
              <Text style={{ ...s.headerCell, width: "20%" }}>Fournisseur</Text>
              <Text style={{ ...s.headerCell, width: "25%" }}>Motif</Text>
            </View>
            {data.produitsJetes.map((p, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.cell, width: "25%" }}>{p.nom_produit}</Text>
                <Text style={{ ...s.cell, width: "15%" }}>{p.numero_lot}</Text>
                <Text style={{ ...s.cellAlert, width: "15%" }}>{p.statut === "JETE" ? "Jeté" : "Rappelé"}</Text>
                <Text style={{ ...s.cell, width: "20%" }}>{p.fournisseur}</Text>
                <Text style={{ ...s.cell, width: "25%" }}>{p.motif_destruction ?? "—"}</Text>
              </View>
            ))}
          </View>
        )}
        <Footer date={data.dateGeneration} />
      </Page>
    </Document>
  );
}
