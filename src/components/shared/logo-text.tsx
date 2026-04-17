interface LogoTextProps {
  /** Couleur des lettres "Pan" et "Da". Par défaut text-gray-900 (quasi noir). */
  textClassName?: string;
  className?: string;
}

/**
 * Affiche "RZPan'Da" en bicolore : RZ + ' en bleu navy primaire, Pan + Da en noir.
 * Le wrapper applique la taille/poids ; ne pas mettre de couleur globale dessus.
 */
export function LogoText({ textClassName = "text-gray-900", className }: LogoTextProps) {
  return (
    <span className={className}>
      <span className="text-rzpanda-primary">RZ</span>
      <span className={textClassName}>Pan</span>
      <span className="text-rzpanda-primary">&apos;</span>
      <span className={textClassName}>Da</span>
    </span>
  );
}
