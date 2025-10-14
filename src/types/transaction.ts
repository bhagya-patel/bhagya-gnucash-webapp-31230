export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  transaction_type: 'RECEIVE' | 'SPEND';
  transaction_date: string;
  notes: string;
  recurring_transaction_id?: string;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  description: string;
  amount: number;
  transaction_type: 'RECEIVE' | 'SPEND';
  notes: string;
  frequency_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  frequency_value: number;
  days_of_week?: string[];
  end_type: 'FOREVER' | 'UNTIL_DATE';
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  created_at: string;
}

export interface TransactionSchedule {
  enabled: boolean;
  frequency_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  frequency_value: number;
  days_of_week: string[];
  end_type: 'FOREVER' | 'UNTIL_DATE';
  end_date?: Date;
}
