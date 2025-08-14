import React, { useState, useEffect } from 'react';
import { Bell, MailOpen, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Notification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/utils/notificationService';
import { supabase } from '@/integrations/supabase/client'; // For real-time subscription

const NotificationMenu: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    const fetched = await fetchNotifications();
    setNotifications(fetched);
    setUnreadCount(fetched.filter(n => !n.is_read).length);
    setLoading(false);
  };

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user) {
        await loadNotifications();

        // Set up real-time subscription
        const subscription = supabase
          .channel('public:notifications')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`, // Only listen for changes relevant to this user
            },
            (payload) => {
              console.log('Realtime notification change:', payload);
              // Reload notifications on any relevant change
              loadNotifications();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      }
    };

    setup();
  }, [currentUserId]); // Re-run if currentUserId changes (e.g., on login/logout)

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_accepted':
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case 'training_approved':
        return <MailOpen className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-2 py-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                onSelect={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <div className="pt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={notification.sender_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {notification.sender_profile?.display_name ? notification.sender_profile.display_name.charAt(0) : 'VA'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {notification.sender_profile?.display_name || 'System'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{notification.content}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;