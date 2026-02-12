export interface Transaction {
  id: number;
  type: 'CREDIT' | 'PAYMENT';
  amount: number;
  date: string;
  description?: string; 
}

export type DebtStatus = 'ACTIVE' | 'CONTENTIOUS' | 'PAID';

export interface Debt {
  id: number;
  nom: string;
  montant: number;
  date: string; 
  tel: string;
  isPaid: boolean; // Gardé pour compatibilité, mais `status` prévaut
  status: DebtStatus;
  location?: {
    lat: number;
    lng: number;
  };
  transactions: Transaction[]; 
}

export interface MerchantConfig {
  name: string;
  phone: string;
  whatsapp: string;
  logo?: string; 
  address?: string;
  bankilyNumber?: string;
}

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'date-credit-asc' | 'date-credit-desc';

export type Language = 'fr' | 'ar';