import { Heart, MoreVertical, Plus } from 'lucide-react';
import { Account } from '@/types/account';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AccountItemProps {
  account: Account;
  subAccountCount: number;
  onToggleFavorite: (id: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onClick: (account: Account) => void;
}

export const AccountItem = ({
  account,
  subAccountCount,
  onToggleFavorite,
  onEdit,
  onDelete,
  onClick
}: AccountItemProps) => {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border cursor-pointer hover:bg-secondary/80 transition-smooth active:bg-muted hover:shadow-sm group"
      onClick={() => onClick(account)}
    >
      <div
        className="w-1 h-14 rounded-full shrink-0 transition-smooth group-hover:h-16 group-hover:shadow-lg"
        style={{ backgroundColor: account.color }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-card-foreground mb-0.5 transition-smooth group-hover:text-primary">{account.name}</h3>
        {subAccountCount > 0 && (
          <p className="text-sm text-muted-foreground transition-smooth">
            {subAccountCount} sub-account{subAccountCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-base font-semibold text-card-foreground mr-2 transition-smooth group-hover:text-primary">₹{account.balance.toFixed(2)}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(account.id);
          }}
          className="hover:bg-muted dark:hover:bg-white/10 h-9 w-9 transition-fast hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-fast ${
              account.favorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-muted-foreground hover:text-red-400'
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit({
              ...account,
              id: '',
              name: '',
              description: '',
              parentId: account.id,
              balance: 0,
              createdAt: 0
            } as Account);
          }}
          className="hover:bg-muted dark:hover:bg-white/10 h-9 w-9 transition-fast hover:scale-110 hover:bg-primary/10"
        >
          <Plus className="h-5 w-5 text-muted-foreground hover:text-primary transition-fast" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="hover:bg-muted dark:hover:bg-white/10 h-9 w-9 transition-fast hover:scale-110">
              <MoreVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-fast" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-popover border-border shadow-material-lg z-50 min-w-[180px] animate-in fade-in-0 zoom-in-95"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
              className="cursor-pointer hover:bg-secondary text-popover-foreground transition-fast focus:bg-secondary"
            >
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(account.id);
              }}
              className="cursor-pointer text-destructive hover:bg-destructive/10 transition-fast focus:bg-destructive/10"
            >
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
