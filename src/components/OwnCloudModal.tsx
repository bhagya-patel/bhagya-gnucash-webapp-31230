import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface OwnCloudCredentials {
  serverUrl: string;
  username: string;
  password: string;
  remotePath: string;
}

interface OwnCloudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (credentials: OwnCloudCredentials) => void;
}

export const OwnCloudModal = ({ open, onOpenChange, onSave }: OwnCloudModalProps) => {
  const [credentials, setCredentials] = useState<OwnCloudCredentials>({
    serverUrl: '',
    username: '',
    password: '',
    remotePath: ''
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!credentials.serverUrl || !credentials.username || !credentials.password) {
      toast.error('Please fill in Server URL, Username, and Password before testing');
      return;
    }

    setIsTesting(true);
    
    try {
      // Simulate API call with 2-second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly show success or failure
      const isSuccess = Math.random() > 0.3; // 70% success rate
      
      if (isSuccess) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed. Please check your credentials and server URL.');
      }
    } catch (error) {
      toast.error('Connection test failed. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!credentials.serverUrl || !credentials.username || !credentials.password || !credentials.remotePath) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic URL validation
    try {
      new URL(credentials.serverUrl);
    } catch {
      toast.error('Please enter a valid server URL');
      return;
    }

    onSave(credentials);
    onOpenChange(false);
    toast.success('ownCloud credentials saved successfully');
  };

  const handleCancel = () => {
    setCredentials({
      serverUrl: '',
      username: '',
      password: '',
      remotePath: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ownCloud Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverUrl">Server URL</Label>
            <Input
              id="serverUrl"
              type="url"
              placeholder="https://owncloud.com"
              value={credentials.serverUrl}
              onChange={(e) => setCredentials(prev => ({ ...prev, serverUrl: e.target.value }))}
              className="bg-card border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">User Name</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="bg-card border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="bg-card border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remotePath">Remote Path</Label>
            <Input
              id="remotePath"
              placeholder="GnuCash"
              value={credentials.remotePath}
              onChange={(e) => setCredentials(prev => ({ ...prev, remotePath: e.target.value }))}
              className="bg-card border-2 border-border"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? 'Testing...' : 'TEST'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            SAVE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
