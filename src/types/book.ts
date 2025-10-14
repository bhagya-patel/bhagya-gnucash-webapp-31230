export interface Book {
  id: string;
  name: string;
  accountCount: number;
  transactionCount: number;
  lastExported: number | null;
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  passcodeEnabled: boolean;
  passcode?: string;
  accountColorInReports: boolean;
  defaultCurrency: string;
  defaultTransactionType: 'Debit' | 'Credit';
  doubleEntryEnabled: boolean;
  compactViewEnabled: boolean;
  saveAccountOpeningBalances: boolean;
  backupOnDelete: boolean;
  backupOnImport: boolean;
  exportAllTransactions: boolean;
  deleteExportedTransactions: boolean;
  useXMLOFXHeader: boolean;
  defaultExportFormat: string;
  defaultExportEmail: string;
}
