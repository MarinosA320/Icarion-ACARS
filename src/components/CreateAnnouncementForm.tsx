import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardHeader } from '@/components/ui/card';

interface CreateAnnouncementFormProps {
  onAnnouncementPosted: () => void;
}

const CreateAnnouncementForm: React.FC<CreateAnnouncementFormProps> = ({ onAnnouncementPosted }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      showError('Title and content cannot be empty.');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('announcements').insert({
      title: newTitle,
      content: newContent,
      author_id: user.id,
    });

    if (error) {
      showError('Error posting announcement: ' + error.message);
      console.error('Error posting announcement:', error);
    } else {
      showSuccess('Announcement posted successfully!');
      setNewTitle('');
      setNewContent('');
      onAnnouncementPosted(); // Callback to refresh the list in parent
    }
    setLoading(false);
  };

  return (
    <Card className="mb-8 p-6">
      <CardHeader className="p-0 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Announcement
        </h2>
      </CardHeader>
      <form onSubmit={handlePostAnnouncement} className="space-y-4">
        <div>
          <Label htmlFor="announcementTitle">Title</Label>
          <Input
            id="announcementTitle"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter announcement title"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="announcementContent">Content</Label>
          <Textarea
            id="announcementContent"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your announcement here..."
            rows={5}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Posting...' : 'Post Announcement'}
        </Button>
      </form>
    </Card>
  );
};

export default CreateAnnouncementForm;