-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Recipient
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Staff sender (optional)
  type TEXT NOT NULL, -- e.g., 'message', 'job_accepted', 'training_approved'
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy: Staff can insert notifications for any user
CREATE POLICY "Staff can insert notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));

-- Policy: Staff can update any notification (e.g., mark as read for a user, or correct content)
CREATE POLICY "Staff can update any notification" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));

-- Policy: Staff can delete any notification
CREATE POLICY "Staff can delete any notification" ON public.notifications
FOR DELETE TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));

-- Policy: Users can mark their own notifications as read
CREATE POLICY "Users can mark their own notifications as read" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);