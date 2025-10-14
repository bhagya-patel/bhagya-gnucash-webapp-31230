import { useState, useEffect, useRef } from 'react';
import { Account, getAccountColor } from '@/types/account';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface AccountFormProps {
  account?: Account | null;
  accounts: Account[];
  onSubmit: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  onValidationError?: () => void;
  parentAccount?: Account | null; // Parent account context when creating sub-account
}

export const AccountForm = ({ account, accounts, onSubmit, onValidationError, parentAccount }: AccountFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null as string | null,
    accountType: 'ASSET' as Account['accountType'],
    currency: 'INR (Indian Rupee)',
    color: '#2196F3',
    notes: '',
    placeholder: false,
    hidden: false,
    favorite: false,
    balance: 0
  });
  const [errors, setErrors] = useState<{ name?: string; accountType?: string }>({});
  const [selectedTypeAccountId, setSelectedTypeAccountId] = useState<string>('');
  const initializedDefaultsRef = useRef(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        description: account.description,
        parentId: account.parentId,
        accountType: account.accountType,
        currency: account.currency,
        color: account.color,
        notes: account.notes,
        placeholder: account.placeholder,
        hidden: account.hidden,
        favorite: account.favorite,
        balance: account.balance
      });
      // Try to preselect a source account whose type matches the account's type
      const match = accounts.find(a => a.accountType === account.accountType && a.parentId === null) || accounts.find(a => a.accountType === account.accountType) || null;
      setSelectedTypeAccountId(match?.id || '');
    } else {
      // Reset form for new account
      // If we have a parent account context, use its type and color as defaults
      const defaultType = parentAccount?.accountType || 'ASSET';
      const defaultColor = parentAccount?.color || getAccountColor(defaultType);
      
      setFormData({
        name: '',
        description: '',
        parentId: parentAccount?.id || null,
        accountType: defaultType,
        currency: 'INR (Indian Rupee)',
        color: defaultColor,
        notes: '',
        placeholder: false,
        hidden: false,
        favorite: false,
        balance: 0
      });
      
      // Set the selectedTypeAccountId to the parent account or a matching type
      if (parentAccount) {
        setSelectedTypeAccountId(parentAccount.id);
      }
      
      // Initial default will be handled by the next effect (runs once)
      initializedDefaultsRef.current = false;
    }
  }, [account, parentAccount]);

  // Set initial defaults ONCE when creating a new account (do not reset while typing)
  useEffect(() => {
    if (!account && !initializedDefaultsRef.current) {
      // If we have a parent account, find a matching type account for the dropdown
      if (parentAccount) {
        const match = accounts.find(a => a.id === parentAccount.id) || 
                     accounts.find(a => a.accountType === parentAccount.accountType) ||
                     accounts.find(a => a.parentId === null);
        setSelectedTypeAccountId(match?.id || '');
      } else {
        const firstTop = accounts.find(a => a.parentId === null);
        setSelectedTypeAccountId(firstTop?.id || '');
      }
      initializedDefaultsRef.current = true;
    }
  }, [accounts, account, parentAccount]);

  const handleTypeChange = (type: Account['accountType']) => {
    setFormData({
      ...formData,
      accountType: type,
      color: getAccountColor(type)
    });
    // Clear type error when user selects a type
    if (errors.accountType) {
      setErrors({ ...errors, accountType: undefined });
    }
  };

  const handleTypeAccountSelect = (accountId: string) => {
    const source = accounts.find(a => a.id === accountId);
    if (!source) return;
    setSelectedTypeAccountId(accountId);
    handleTypeChange(source.accountType);
  };

  const validateForm = () => {
    const newErrors: { name?: string; accountType?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!formData.accountType) {
      newErrors.accountType = 'Account type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      onValidationError?.();
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background" onContextMenu={(e) => e.preventDefault()}>
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground text-sm font-semibold">
              Account Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`bg-card border-2 ${errors.name ? 'border-destructive' : 'border-border'} text-foreground h-12 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-smooth font-medium shadow-sm`}
              placeholder="e.g., Primary Savings Account"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType" className="text-foreground text-sm font-semibold">
              Account Type <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedTypeAccountId} onValueChange={handleTypeAccountSelect}>
              <SelectTrigger className={`bg-card border-2 ${errors.accountType ? 'border-destructive' : 'border-border'} text-foreground h-12 text-base focus:ring-2 focus:ring-primary focus:border-primary transition-smooth shadow-sm`}>
                <SelectValue placeholder="Select account type source" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-material-lg max-h-60 z-50">
                {(() => {
                  const topLevel = accounts.filter(a => a.parentId === null);
                  return topLevel.map(top => (
                    <SelectGroup key={top.id}>
                      <SelectLabel className="text-muted-foreground">{top.name}</SelectLabel>
                      <SelectItem value={top.id} className="text-foreground hover:bg-secondary transition-smooth cursor-pointer">
                        {top.name}
                      </SelectItem>
                      {accounts
                        .filter(a => a.parentId === top.id)
                        .map(child => (
                          <SelectItem key={child.id} value={child.id} className="text-foreground hover:bg-secondary transition-smooth cursor-pointer">
                            {/* visually indent children */}
                            {'	'}- {child.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ));
                })()}
              </SelectContent>
            </Select>
            {errors.accountType && <p className="text-sm text-destructive">{errors.accountType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-foreground text-sm font-semibold">
              Currency <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger className="bg-card border-2 border-border text-foreground h-12 text-base focus:ring-2 focus:ring-primary focus:border-primary transition-smooth shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-material-lg z-50">
                <SelectItem value="INR (Indian Rupee)" className="text-foreground hover:bg-secondary transition-smooth">INR (Indian Rupee)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional Details Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Optional Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground text-sm font-semibold">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-card border-2 border-border text-foreground h-12 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-smooth shadow-sm"
              placeholder="Account for monthly savings and investments"
            />
          </div>

          <div className="flex items-center justify-between py-3 border border-border hover:bg-secondary/20 transition-smooth rounded-lg px-4">
            <Label className="text-foreground text-base font-medium">Parent account</Label>
            <Switch
              checked={formData.parentId !== null}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, parentId: checked ? '' : null })
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {formData.parentId !== null && (
            <Select
              value={formData.parentId || ''}
              onValueChange={(value) => setFormData({ ...formData, parentId: value })}
            >
              <SelectTrigger className="bg-card border-2 border-border text-foreground h-12 text-base focus:ring-2 focus:ring-primary focus:border-primary transition-smooth shadow-sm">
                <SelectValue placeholder="Select parent account" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-material-lg z-50">
                {accounts.filter(acc => !acc.placeholder).map((acc) => (
                  <SelectItem key={acc.id} value={acc.id} className="text-foreground hover:bg-secondary transition-smooth">
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="space-y-2">
            <Label htmlFor="color" className="text-foreground text-sm font-semibold">Account Color</Label>
            <div className="flex gap-3">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-20 h-12 bg-card border-2 border-border cursor-pointer p-1 rounded-lg shadow-sm hover:scale-105 transition-smooth"
              />
              <Input
                value={formData.color}
                readOnly
                className="flex-1 bg-card border-2 border-border text-foreground h-12 font-mono shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground text-sm font-semibold">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-card border-2 border-border text-foreground min-h-24 text-base placeholder:text-muted-foreground resize-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-smooth shadow-sm"
              placeholder="Any additional notes about this account..."
            />
          </div>
        </div>

        {/* Account Options */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">Account Options</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/20 transition-smooth">
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  id="placeholder"
                  checked={formData.placeholder}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, placeholder: checked as boolean })
                  }
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="placeholder" className="text-foreground cursor-pointer text-base font-medium">
                  Placeholder
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/20 transition-smooth">
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  id="hidden"
                  checked={formData.hidden}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, hidden: checked as boolean })
                  }
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="hidden" className="text-foreground cursor-pointer text-base font-medium">
                  Hidden
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/20 transition-smooth">
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  id="favorite"
                  checked={formData.favorite}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, favorite: checked as boolean })
                  }
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="favorite" className="text-foreground cursor-pointer text-base font-medium">
                  Favorite
                </Label>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="hidden"
          id="submit-account-form"
        />
      </div>
    </div>
  );
};
