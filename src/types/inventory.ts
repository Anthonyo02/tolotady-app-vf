// Matériel standard
export interface Equipment {
  id: string;
  name: string;
  totalQuantity: number;
  utiliser: number;   // Quantité utilisée
  pret: number;       // Quantité prêtée
  endommagé: number;  // Quantité endommagée
  responsable: string;
  preteur?: string;   // optionnel
  status?: string;    // optionnel, si nécessaire
}

// Exemple de responsables possibles
export const RESPONSABLES = ["Miary", "Dio", "Aina", "Anthonyo"];

// Équipement sélectionné pour le terrain
export interface EquipementSelected {
  name: string;      // Nom de l'équipement
  utiliser: number;  // Quantité utilisée pour cette sortie terrain
}

// ================================
// Données venant de Google Sheets (terrain)
// ================================
export interface TerrainItemRaw {
  id: string;
  date: string;
  lieu: string;
  description: string;
  responsable: string;
  equipe:any | any[];       // liste des membres
  materiel: any[];  // IDs ou noms d'équipements (brut)
  remarque: string;
  statut: string;
}

// ================================
// Données utilisées par la modal / UI (terrain)
// ================================
export interface TerrainItem {
  id: string | null;
  date: string;
  lieu: string;
  description: string;
  responsable: string;
  equipe:  string | null | string[] ;
  materiel: any[]; 
  remarque: string;
  statut: string;
}
