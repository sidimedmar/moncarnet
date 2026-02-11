export interface Transaction {
  id: number;
  type: 'CREDIT' | 'PAYMENT';
  amount: number;
  date: string;
}

export interface Debt {
  id: number;
  nom: string;
  montant: number;
  date: string; // Date de la dernière activité ou création
  tel: string;
  isPaid: boolean;
  transactions: Transaction[]; // Historique
}

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'date-credit-asc' | 'date-credit-desc';

export type Language = 'fr' | 'ar';