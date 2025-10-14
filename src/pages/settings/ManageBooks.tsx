import { AccountHeader } from '@/components/AccountHeader';
import { Book } from '@/types/book';
import { MoreVertical, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ManageBooksProps {
  onBack: () => void;
  books: Book[];
  activeBookId: string;
  onCreateBook: () => void;
  onSelectBook: (bookId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onExportBook: (bookId: string) => void;
}

export const ManageBooks = ({ 
  onBack, 
  books, 
  activeBookId, 
  onCreateBook,
  onSelectBook,
  onDeleteBook,
  onExportBook 
}: ManageBooksProps) => {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="Manage Books"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background p-4">
        <div className="flex gap-3 mb-4">
          <Button
            onClick={onCreateBook}
            className="flex-1 h-14 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Create New Book
          </Button>
          <Button
            variant="outline"
            className="h-14 px-6 border-2 hover:bg-secondary"
          >
            <FolderOpen className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {books.map((book) => (
            <div
              key={book.id}
              className={`bg-card border-2 rounded-lg p-4 shadow-sm transition-all ${
                book.id === activeBookId ? 'border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => onSelectBook(book.id)}>
                  <h3 className="text-lg font-semibold text-primary mb-1">{book.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {book.accountCount} accounts, {book.transactionCount} transactions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last Exported: {formatDate(book.lastExported)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-secondary"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg">
                    <DropdownMenuItem 
                      onClick={() => onSelectBook(book.id)}
                      className="cursor-pointer hover:bg-secondary"
                    >
                      Open Book
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onExportBook(book.id)}
                      className="cursor-pointer hover:bg-secondary"
                    >
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteBook(book.id)}
                      className="cursor-pointer text-destructive hover:bg-destructive/10"
                      disabled={books.length === 1}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
