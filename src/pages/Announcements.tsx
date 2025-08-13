import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EditAnnouncementDialog from '@/components/EditAnnouncementDialog';
import CreateAnnouncementForm from '@/components/CreateAnnouncementForm';
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  created_at: string;
  author_profile: {
    display_name: string | null;
  } | null;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_staff')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching staff status:', profileError);
        } else {
          setIsStaff(profileData?.is_staff || false);
        }
      }

      await fetchAnnouncements();
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchAnnouncements = async () => {
    // Fetch announcements without direct profile join
    const { data, error } = await supabase
      .from('announcements')
      .select('id,title,content,author_id,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching announcements: ' + error.message);
      console.error('Error fetching announcements:', error);
      return;
    }

    const allAuthorIds = new Set<string>();
    data.forEach(ann => {
      if (ann.author_id) {
        allAuthorIds.add(ann.author_id);
      }
    });

    const profilesMap = await fetchProfilesData(Array.from(allAuthorIds));

    const announcementsWithProfiles = data.map(announcement => ({
      ...announcement,
      author_profile: announcement.author_id ? profilesMap[announcement.author_id] || null : null,
    }));
    setAnnouncements(announcementsWithProfiles as Announcement[]);
  };

  const handleEditClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) {
      showError('Error deleting announcement: ' + error.message);
      console.error('Error deleting announcement:', error);
    } else {
      showSuccess('Announcement deleted successfully!');
      fetchAnnouncements();
    }
  };

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className="p-6 shadow-md rounded-lg">
        <CardHeader className="p-0 pb-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-20 w-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Announcements</h1>

      {isStaff && (
        <CreateAnnouncementForm onAnnouncementPosted={fetchAnnouncements} />
      )}

      <div className="space-y-6">
        {loading ? (
          renderSkeletons()
        ) : announcements.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No announcements yet.</p>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6 shadow-md rounded-lg">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{announcement.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Posted by {announcement.author_profile?.display_name || 'Unknown'} on {format(new Date(announcement.created_at), 'PPP p')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{announcement.content}</p>
                {isStaff && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(announcement)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this announcement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAnnouncement(announcement.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedAnnouncement && (
        <EditAnnouncementDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          announcement={selectedAnnouncement}
          onAnnouncementUpdated={fetchAnnouncements}
        />
      )}
    </div>
  );
};

export default Announcements;