import { StyleSheet } from "@react-pdf/renderer";
import { COULEURS } from "@/lib/constants";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1A202C",
  },
  // Cover page
  coverPage: {
    padding: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: COULEURS.primaire,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 40,
  },
  coverInfo: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 6,
    textAlign: "center",
  },
  // Section headers
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COULEURS.primaire,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.primaire,
  },
  // Tables
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EBF5FB",
    borderBottomWidth: 1,
    borderBottomColor: "#B0C4DE",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRowAlert: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: "#FFF5F5",
  },
  headerCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#2D3748",
  },
  cell: {
    fontSize: 8,
    color: "#4A5568",
  },
  cellAlert: {
    fontSize: 8,
    color: "#E53E3E",
    fontFamily: "Helvetica-Bold",
  },
  cellOk: {
    fontSize: 8,
    color: "#27AE60",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7,
    color: "#A0AEC0",
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
  },
  footerLeft: {
    fontSize: 7,
    color: "#A0AEC0",
  },
  footerRight: {
    fontSize: 7,
    color: "#A0AEC0",
  },
  // Cover footer / mention
  coverMention: {
    fontSize: 9,
    color: "#A0AEC0",
    textAlign: "center",
    marginTop: 40,
  },
  // Utils
  emptyText: {
    fontSize: 10,
    color: "#A0AEC0",
    fontStyle: "italic",
    marginVertical: 10,
  },
});
