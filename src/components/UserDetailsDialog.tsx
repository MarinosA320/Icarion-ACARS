import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    discord_username: string | null;
    vatsim_ivao_id: string | null;
    avatar_url: string | null;
    is_staff: boolean;
    rank: string | null; // Updated to allow null
    email?: string | null;
    type_ratings?: string[] | null;
  } | null;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details: {user.display_name || 'N/A'}</DialogTitle>
          <DialogDescription>
            Comprehensive profile information for {user.display_name || 'this user'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 text-sm">
          <div className="flex flex-col items-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || "User"} />
              <AvatarFallback>{user.display_name ? user.display_name.charAt(0) : 'VA'}</AvatarFallback>
            </Avatar>
          </div>
          <div><span className="font-medium">Full Name:</span> {fullName || 'N/A'}</div>
          <div><span className="font-medium">Display Name:</span> {user.display_name || 'N/A'}</div>
          <div><span className="font-medium">Email:</span> {user.email || 'N/A'}</div>
          <div><span className="font-medium">Rank:</span> {user.rank || 'N/A'}</div>
          <div><span className="font-medium">Staff Member:</span> {user.is_staff ? 'Yes' : 'No'}</div>
          <div><span className="font-medium">Discord Username:</span> {user.discord_username || 'N/A'}</div>
          <div><span className="font-medium">VATSIM/IVAO ID:</span> {user.vatsim_ivao_id || 'N/A'}</div>
          <div><span className="font-medium">Type Ratings:</span> {user.type_ratings && user.type_ratings.length > 0 ? user.type_ratings.join(', ') : 'None'}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;