import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { fetchProfilesData } from '@/utils/supabaseDataFetch';

export interface Notification {
  id: string;
  user_id: string;
  sender_id: string | null;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Sends a new notification to a specific user.
 * @param userId The ID of the recipient user.
 * @param type The type of notification (e.g., 'message', 'job_accepted', 'training_approved').
 * @param content The message content of the notification.
 * @param senderId The ID of the user sending the notification (optional, defaults to current user if staff).
 */
export const sendNotification = async (
  userId: string,
  type: string,
  content: string,
  senderId: string | null = null,
) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    sender_id: senderId,
    type,
    content,
    is_read: false,
  });

  if (error) {
    console.error('Error sending notification:', error);
    showError('Failed to send notification: ' + error.message);
  }
};

/**
 * Fetches all notifications for the current user, with sender profile data.
 * @returns An array of Notification objects.
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, sender_id, type, content, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    showError('Failed to fetch notifications: ' + error.message);
    return [];
  }

  const senderIds = new Set<string>();
  data.forEach(notif => {
    if (notif.sender_id) {
      senderIds.add(notif.sender_id);
    }
  });

  const senderProfilesMap = await fetchProfilesData(Array.from(senderIds));

  const notificationsWithProfiles = data.map(notif => ({
    ...notif,
    sender_profile: notif.sender_id ? senderProfilesMap[notif.sender_id] || null : null,
  }));

  return notificationsWithProfiles as Notification[];
};

/**
 * Marks a specific notification as read.
 * @param notificationId The ID of the notification to mark as read.
 */
export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    showError('Failed to mark notification as read: ' + error.message);
  }
};

/**
 * Marks all notifications for the current user as read.
 */
export const markAllNotificationsAsRead = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false); // Only update unread ones

  if (error) {
    console.error('Error marking all notifications as read:', error);
    showError('Failed to mark all notifications as read: ' + error.message);
  }
};