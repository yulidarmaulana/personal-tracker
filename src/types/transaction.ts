export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
    icon?: string;
    color?: string;
    user_id: string;
}

export type TransactionCategory = string; // Changed to string for dynamic DB values

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    date: string; // ISO format
    wallet_id: string;
    user_id?: string;
}
