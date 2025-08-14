import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { sendNotification } from '@/utils/notificationService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface SendMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientDisplayName: string;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientDisplayName,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      showError('Message content cannot be empty.');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('You must be logged in to send messages.');
      setLoading(false);
      return;
    }

    await sendNotification(recipientId, 'message', messageContent.trim(), user.id);
    showSuccess('Message sent successfully!');
    setMessageContent('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Message to {recipientDisplayName}</DialogTitle>
          <DialogDescription>
            Compose a direct message to this user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendMessage} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="messageContent">Message</Label>
            <Textarea
              id="messageContent"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              rows={5}
              required
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;