// src/types/inventory.ts
// @/types/inventory.ts
export interface Equipment {
  id: string;
  name: string;
  totalQuantity: number;
  utiliser: number;   // ajouté
  pret: number;       // ajouté
  endommagé: number;  // ajouté
  responsable: string;
  preteur?: string;
  status?: string;    // tu peux garder si tu en avais besoin avant
}
  

// Exemple de responsables possibles
export const RESPONSABLES = ["Miary", "Dio", "Aina","Anthonyo"];
