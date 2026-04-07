interface LogoTextProps {
  /** Couleur des lettres "Pan" et "Da". Par défaut text-gray-800 (s'adapte si dark mode via override). */
  textClassName?: string;
  className?: string;
}

/**
 * Affiche "RZPan'Da" en bicolore : RZ + ' en vert primaire, Pan + Da en couleur de texte.
 * Le wrapper applique la taille/poids ; ne pas mettre de couleur globale dessus.
 */
export function LogoText({ textClassName = "text-gray-800", className }: LogoTextProps) {
  return (
    <span className={className}>
      <span className="text-rzpanda-primary">RZ</span>
      <span className={textClassName}>Pan</span>
      <span className="text-rzpanda-primary">&apos;</span>
      <span className={textClassName}>Da</span>
    </span>
  );
}
