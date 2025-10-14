import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Account, getTopLevelColor } from '@/types/account';
import type { User, Session } from '@supabase/supabase-js';
import { Book, AppSettings } from '@/types/book';
import { AccountHeader } from '@/components/AccountHeader';
import { TabNavigation } from '@/components/TabNavigation';
import { AccountItem } from '@/components/AccountItem';
import { AccountForm } from '@/components/AccountForm';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Settings } from '@/pages/Settings';
import ReportsPage from '@/pages/ReportsPage';
import ScheduledActionsPage from '@/pages/ScheduledActionsPage';
import CreateExportPage from '@/pages/CreateExportPage';
import { GeneralPreferences } from '@/pages/settings/GeneralPreferences';
import { ManageBooks } from '@/pages/settings/ManageBooks';
import { AccountPreferences } from '@/pages/settings/AccountPreferences';
import { TransactionPreferences } from '@/pages/settings/TransactionPreferences';
import { BackupPreferences } from '@/pages/settings/BackupPreferences';
import { About } from '@/pages/settings/About';
import { toast } from 'sonner';

type View = 'list' | 'sub-accounts' | 'create' | 'edit' | 'settings' | 'settings-general' | 'settings-books' | 'settings-accounts' | 'settings-transactions' | 'settings-backup' | 'settings-about' | 'reports' | 'scheduled' | 'create-export';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [view, setView] = useState<View>('list');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Books state
  const [books, setBooks] = useState<Book[]>([
    {
      id: 'book1',
      name: 'Book 1',
      accountCount: 0,
      transactionCount: 0,
      lastExported: null,
      createdAt: Date.now()
    }
  ]);
  const [activeBookId, setActiveBookId] = useState('book1');

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    passcodeEnabled: false,
    accountColorInReports: false,
    defaultCurrency: 'INR (Indian Rupee)',
    defaultTransactionType: 'Debit',
    doubleEntryEnabled: true,
    compactViewEnabled: false,
    saveAccountOpeningBalances: true,
    backupOnDelete: true,
    backupOnImport: true,
    exportAllTransactions: false,
    deleteExportedTransactions: false,
    useXMLOFXHeader: false,
    defaultExportFormat: 'GnuCash XML',
    defaultExportEmail: ''
  });

  // Auth state management
  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch accounts for current user
  useEffect(() => {
    if (!user) return;

    const fetchAccounts = async () => {
      const { data, error } = await (supabase as any)
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Failed to load accounts');
        return;
      }

      // Map database fields to Account type
      const mappedAccounts: Account[] = (data || []).map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        accountType: acc.account_type as Account['accountType'],
        color: acc.color,
        description: acc.description || '',
        parentId: acc.parent_id,
        currency: acc.currency,
        notes: acc.notes || '',
        placeholder: acc.placeholder || false,
        hidden: acc.hidden || false,
        favorite: acc.favorite || false,
        balance: Number(acc.balance) || 0,
        createdAt: Number(acc.created_at)
      }));

      setAccounts(mappedAccounts);

      // Update book account count
      const updatedBooks = books.map(book => 
        book.id === activeBookId 
          ? { ...book, accountCount: data?.length || 0 }
          : book
      );
      setBooks(updatedBooks);
    };

    fetchAccounts();

    // Set up realtime subscription
    const channel = (supabase as any)
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeBookId, books]);

  const getSubAccounts = useCallback((parentId: string) => {
    return accounts.filter(acc => acc.parentId === parentId);
  }, [accounts]);

  const getTopLevelAccounts = useCallback(() => {
    return accounts.filter(acc => acc.parentId === null);
  }, [accounts]);

  const getFavoriteAccounts = useCallback(() => {
    return accounts.filter(acc => acc.favorite);
  }, [accounts]);

  const handleToggleFavorite = async (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      const { error } = await (supabase as any)
        .from('accounts')
        .update({ favorite: !account.favorite })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update favorite');
      } else {
        toast.success(account.favorite ? 'Removed from favorites' : 'Added to favorites');
      }
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      // Recursively delete all sub-accounts
      const deleteRecursive = async (accountId: string) => {
        const subAccounts = getSubAccounts(accountId);
        for (const subAcc of subAccounts) {
          await deleteRecursive(subAcc.id);
        }
        
        const { error } = await (supabase as any)
          .from('accounts')
          .delete()
          .eq('id', accountId);

        if (error) throw error;
      };

      await deleteRecursive(id);
      toast.success('Account deleted successfully');
      
      // Stay in current view, just refresh the list
      if (selectedAccount?.id === id) {
        setView('list');
        setSelectedAccount(null);
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleSaveAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      if (editingAccount && editingAccount.id) {
        // Update existing account - map camelCase to snake_case
        const { error } = await (supabase as any)
          .from('accounts')
          .update({
            name: accountData.name,
            account_type: accountData.accountType,
            color: accountData.color,
            description: accountData.description,
            parent_id: accountData.parentId || null,
            currency: accountData.currency,
            notes: accountData.notes,
            placeholder: accountData.placeholder,
            hidden: accountData.hidden,
            favorite: accountData.favorite,
            balance: accountData.balance
          })
          .eq('id', editingAccount.id);

        if (error) throw error;
        toast.success('Account updated successfully');
      } else {
        // Create new account - map camelCase to snake_case
        const { error } = await (supabase as any)
          .from('accounts')
          .insert({
            user_id: user.id,
            name: accountData.name,
            account_type: accountData.accountType,
            color: accountData.color,
            description: accountData.description || '',
            parent_id: accountData.parentId || null,
            currency: accountData.currency,
            notes: accountData.notes || '',
            placeholder: accountData.placeholder || false,
            hidden: accountData.hidden || false,
            favorite: accountData.favorite || false,
            balance: accountData.balance || 0,
            created_at: Date.now()
          });

        if (error) throw error;
        toast.success('Account created successfully');
      }
      
      // Go back to previous view
      if (accountData.parentId && accountData.parentId !== '') {
        // If creating/editing a sub-account, find the parent and show sub-accounts view
        const parent = accounts.find(acc => acc.id === accountData.parentId);
        if (parent) {
          setSelectedAccount(parent);
          setView('sub-accounts');
        } else {
          setView('list');
          setSelectedAccount(null);
        }
      } else if (selectedAccount) {
        setView('sub-accounts');
      } else {
        setView('list');
        setSelectedAccount(null);
      }
      
      setEditingAccount(null);
    } catch (error) {
      toast.error('Failed to save account');
    }
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setView('sub-accounts');
  };

  const handleBack = () => {
    if (view === 'sub-accounts' && selectedAccount?.parentId) {
      const parent = accounts.find(acc => acc.id === selectedAccount.parentId);
      setSelectedAccount(parent || null);
    } else {
      setView('list');
      setSelectedAccount(null);
    }
  };

  const getHeaderColor = () => {
    if (!selectedAccount) return '#4CAF50';
    
    // Find the top-level parent
    let current = selectedAccount;
    while (current.parentId) {
      const parent = accounts.find(acc => acc.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current.color;
  };

  const getDisplayedAccounts = () => {
    if (view === 'sub-accounts' && selectedAccount) {
      return getSubAccounts(selectedAccount.id);
    }
    
    if (activeTab === 'FAVORITES') {
      return getFavoriteAccounts();
    }
    
    if (activeTab === 'RECENT') {
      return [];
    }
    
    return getTopLevelAccounts();
  };

  // Settings handlers
  const handleCreateBook = () => {
    const newBook: Book = {
      id: `book${books.length + 1}`,
      name: `Book ${books.length + 1}`,
      accountCount: 0,
      transactionCount: 0,
      lastExported: null,
      createdAt: Date.now()
    };
    setBooks([...books, newBook]);
    toast.success('New book created');
  };

  const handleSelectBook = (bookId: string) => {
    setActiveBookId(bookId);
    setView('list');
    setDrawerOpen(false);
    toast.success(`Switched to ${books.find(b => b.id === bookId)?.name}`);
  };

  const handleDeleteBook = (bookId: string) => {
    if (books.length === 1) {
      toast.error('Cannot delete the last book');
      return;
    }
    setBooks(books.filter(b => b.id !== bookId));
    if (activeBookId === bookId) {
      setActiveBookId(books[0].id);
    }
    toast.success('Book deleted');
  };

  const handleExportBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const updatedBooks = books.map(b =>
        b.id === bookId ? { ...b, lastExported: Date.now() } : b
      );
      setBooks(updatedBooks);
      toast.success('Book exported successfully');
    }
  };

  const renderContent = () => {
    // Settings pages
    if (view === 'settings') {
      return (
        <Settings
          onNavigate={(page) => setView(`settings-${page}` as View)}
          onBack={() => {
            setView('list');
            setDrawerOpen(false);
          }}
        />
      );
    }

    if (view === 'reports') {
      return (
        <ReportsPage onMenuClick={() => setDrawerOpen(true)} />
      );
    }

    if (view === 'scheduled') {
      return (
        <ScheduledActionsPage
          onMenuClick={() => setDrawerOpen(true)}
          onCreate={() => setView('create-export')}
        />
      );
    }

    if (view === 'create-export') {
      return (
        <CreateExportPage onBack={() => setView('scheduled')} />
      );
    }

    if (view === 'settings-general') {
      return (
        <GeneralPreferences
          onBack={() => setView('settings')}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      );
    }

    if (view === 'settings-books') {
      return (
        <ManageBooks
          onBack={() => setView('settings')}
          books={books}
          activeBookId={activeBookId}
          onCreateBook={handleCreateBook}
          onSelectBook={handleSelectBook}
          onDeleteBook={handleDeleteBook}
          onExportBook={handleExportBook}
        />
      );
    }

    if (view === 'settings-accounts') {
      return (
        <AccountPreferences
          onBack={() => setView('settings')}
          defaultCurrency={settings.defaultCurrency}
          onSetCurrency={(currency) => setSettings({ ...settings, defaultCurrency: currency })}
          onCreateDefaultAccounts={() => {
            // Re-trigger default account creation
            setAccounts([]);
          }}
          onImportXML={() => {}}
          onExportCSV={() => {}}
          onDeleteAllAccounts={async () => {
            if (!user) return;
            const { error } = await (supabase as any)
              .from('accounts')
              .delete()
              .eq('user_id', user.id);
            
            if (error) {
              toast.error('Failed to delete accounts');
            } else {
              toast.success('All accounts deleted');
            }
          }}
        />
      );
    }

    if (view === 'settings-transactions') {
      return (
        <TransactionPreferences
          onBack={() => setView('settings')}
          settings={settings}
          onUpdateSettings={setSettings}
          onDeleteAllTransactions={() => {}}
        />
      );
    }

    if (view === 'settings-backup') {
      return (
        <BackupPreferences
          onBack={() => setView('settings')}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      );
    }

    if (view === 'settings-about') {
      return <About onBack={() => setView('settings')} />;
    }

    // Account create/edit pages
    if (view === 'create' || view === 'edit') {
      return (
        <div onContextMenu={(e) => e.preventDefault()}>
          <AccountHeader
            title={view === 'create' ? 'Create Account' : 'Edit Account'}
            color={getHeaderColor()}
            showBack
            showSave
            showMenu={false}
            onBack={() => {
              // Go back to the correct view based on context
              if (editingAccount?.parentId) {
                const parent = accounts.find(acc => acc.id === editingAccount.parentId);
                if (parent) {
                  setSelectedAccount(parent);
                  setView('sub-accounts');
                } else {
                  setView('list');
                  setSelectedAccount(null);
                }
              } else if (selectedAccount) {
                setView('sub-accounts');
              } else {
                setView('list');
                setSelectedAccount(null);
              }
              setEditingAccount(null);
            }}
            onSave={() => {
              document.getElementById('submit-account-form')?.click();
            }}
          />
          <AccountForm
            account={editingAccount}
            accounts={accounts}
            onSubmit={handleSaveAccount}
            parentAccount={selectedAccount}
          />
        </div>
      );
    }

    const displayedAccounts = getDisplayedAccounts();

    return (
        <>
          <AccountHeader
            title={selectedAccount ? selectedAccount.name : 'Accounts'}
            color={getHeaderColor()}
            showBack={view === 'sub-accounts'}
            onBack={handleBack}
            onMenuClick={() => setDrawerOpen(true)}
          />
        {view === 'list' && (
          <TabNavigation
            tabs={['RECENT', 'ALL', 'FAVORITES']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            color={getHeaderColor()}
          />
        )}
        {view === 'sub-accounts' && (
          <div className="py-3 text-center" style={{ backgroundColor: getHeaderColor() }}>
            <h2 className="text-white text-sm font-medium tracking-widest">SUB-ACCOUNTS</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto bg-background">
          {displayedAccounts.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-base">
              {activeTab === 'RECENT' ? 'No recent accounts' : 'No accounts found'}
            </div>
          ) : (
            displayedAccounts.map(account => (
              <AccountItem
                key={account.id}
                account={account}
                subAccountCount={getSubAccounts(account.id).length}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(acc) => {
                  setEditingAccount(acc);
                  // If creating a new sub-account (id is empty), set it to create mode
                  if (!acc.id) {
                    setView('create');
                  } else {
                    setView('edit');
                  }
                }}
                onDelete={handleDeleteAccount}
                onClick={handleAccountClick}
              />
            ))
          )}
        </div>
        <ChatbotWidget />
        <FloatingActionButton
          onClick={() => {
            setEditingAccount(null);
            setView('create');
          }}
        />
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavigationDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        onFavoritesClick={() => {
          setView('list');
          setActiveTab('FAVORITES');
          setDrawerOpen(false);
        }}
        onReportsClick={() => {
          setView('reports');
          setDrawerOpen(false);
        }}
        onScheduledClick={() => {
          setView('scheduled');
          setDrawerOpen(false);
        }}
        onSettingsClick={() => {
          setView('settings');
          setDrawerOpen(false);
        }}
        onLogout={async () => {
          await supabase.auth.signOut();
          navigate('/auth');
        }}
      />
      {renderContent()}
    </div>
  );
};

export default Index;
