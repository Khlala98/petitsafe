export interface ProtocoleTemplate {
  titre: string;
  categorie: "Hygiène" | "Sécurité" | "Alimentation" | "Biberonnerie";
  contenu_markdown: string;
}

export const PROTOCOLES_TEMPLATES: ProtocoleTemplate[] = [
  {
    titre: "Lavage des mains",
    categorie: "Hygiène",
    contenu_markdown: `## Quand se laver les mains ?

- Avant et après chaque repas
- Après chaque change
- Après chaque passage aux toilettes
- En arrivant dans la structure

## Comment procéder ?

1. Mouiller les mains à l'eau tiède
2. Appliquer du savon doux
3. Frotter pendant **30 secondes minimum** (paumes, dos des mains, entre les doigts, ongles)
4. Rincer abondamment à l'eau claire
5. Sécher avec une serviette à usage unique
6. Jeter la serviette dans la poubelle prévue à cet effet`,
  },
  {
    titre: "Préparation des biberons",
    categorie: "Biberonnerie",
    contenu_markdown: `## Étapes de préparation

1. **Se laver les mains** soigneusement (cf. protocole Lavage des mains)
2. **Vérifier la DLC** du lait avant utilisation
3. **Utiliser de l'eau faiblement minéralisée** à température ambiante
4. **Respecter le dosage** : 1 mesurette rase pour 30 ml d'eau
5. Fermer le biberon et **agiter** pour bien mélanger
6. **Vérifier la température** sur l'intérieur du poignet avant de donner

## Règles de conservation

- **Ne jamais réchauffer au micro-ondes** (risque de brûlure par points chauds)
- Consommer dans l'heure suivant la préparation
- Si non consommé dans l'heure : réfrigérer immédiatement à **4 °C maximum**
- Un biberon entamé doit être jeté après **1 heure**`,
  },
  {
    titre: "Protocole PAI — Projet d'Accueil Individualisé",
    categorie: "Sécurité",
    contenu_markdown: `## Procédure

1. **Vérifier l'identité** de l'enfant concerné
2. **Consulter la fiche PAI** dans le dossier de l'enfant (classeur PAI ou dossier numérique)
3. S'assurer que le traitement prescrit est disponible et non périmé

## En cas de réaction allergique

1. **Appeler le 15 (SAMU)** immédiatement
2. **Administrer le traitement prescrit** selon les instructions du PAI (ex. : Ventoline, Anapen, antihistaminique)
3. **Prévenir les parents** immédiatement
4. **Rester auprès de l'enfant** et surveiller son état en attendant les secours
5. **Consigner l'incident** dans le registre de sécurité et dans RZPan'Da`,
  },
  {
    titre: "Nettoyage et désinfection cuisine",
    categorie: "Hygiène",
    contenu_markdown: `## Nettoyage quotidien

- **Nettoyer les plans de travail** après chaque utilisation avec un détergent alimentaire
- **Vider et nettoyer les poubelles** quotidiennement
- **Nettoyer l'évier** et les robinets en fin de journée
- **Balayer et laver le sol** de la cuisine chaque jour

## Nettoyage hebdomadaire

- **Désinfecter le réfrigérateur** 1 fois par semaine
- **Nettoyer le four et le micro-ondes** 1 fois par semaine
- **Vérifier les dates de péremption** des produits stockés

## Produits autorisés

- Vinaigre blanc
- Savon noir
- Détergent alimentaire agréé
- Désinfectant alimentaire conforme à la norme EN 13697

## Règles importantes

- Ne jamais mélanger les produits de nettoyage
- Porter des gants lors de la désinfection
- Rincer les surfaces en contact avec les aliments après désinfection`,
  },
  {
    titre: "Réception des marchandises",
    categorie: "Alimentation",
    contenu_markdown: `## Contrôles à réception

1. **Vérifier la température** à réception :
   - Produits frais : **< 4 °C**
   - Produits surgelés : **< -18 °C**
2. **Contrôler l'emballage** : intact, propre, non déformé
3. **Vérifier les DLC** (Dates Limites de Consommation) et DDM
4. **Vérifier l'étiquetage** : liste des allergènes, numéro de lot

## Rangement

5. **Ranger immédiatement au froid** dans les 15 minutes suivant la réception
6. Appliquer la règle **FIFO** (Premier Entré, Premier Sorti)
7. **Enregistrer dans RZPan'Da** : fournisseur, produit, DLC, lot, température

## En cas de non-conformité

- Refuser le produit si température non conforme
- Refuser si emballage endommagé ou DLC dépassée
- Consigner le refus et prévenir le fournisseur`,
  },
  {
    titre: "Protocole fièvre / enfant malade",
    categorie: "Sécurité",
    contenu_markdown: `## Prise de température

- Utiliser un **thermomètre frontal ou auriculaire**
- Noter la température, l'heure et le nom de l'enfant

## Conduite à tenir

### Si T° > 38 °C
1. **Prévenir les parents** par téléphone
2. **Isoler l'enfant** dans un espace calme et confortable
3. **Surveiller** l'évolution toutes les 15 minutes
4. Proposer de l'eau régulièrement
5. Découvrir légèrement l'enfant

### Si T° > 39 °C
1. **Appeler les parents** pour venir chercher l'enfant
2. En cas d'impossibilité de joindre les parents : appeler les contacts d'urgence
3. Si signes de gravité (convulsions, somnolence excessive) : **appeler le 15**

## Règle absolue

**Ne JAMAIS administrer de médicament** sans :
- Une **ordonnance médicale** en cours de validité
- ET une **autorisation parentale écrite**

## Traçabilité

- Consigner dans RZPan'Da : heure, température, actions entreprises, personnes prévenues`,
  },
];
