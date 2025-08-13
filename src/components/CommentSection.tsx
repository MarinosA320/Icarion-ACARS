import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { showSuccess, showError } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  currentUserId: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    // Fetch comments without direct profile join
    const { data, error } = await supabase
      .from('comments')
      .select('id,post_id,user_id,content,created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      showError('Error fetching comments: ' + error.message);
      console.error('Error fetching comments:', error);
      setLoading(false);
      return;
    }

    const allUserIds = new Set<string>();
    data.forEach(comment => allUserIds.add(comment.user_id));

    const profilesMap = await fetchProfilesData(Array.from(allUserIds));

    const commentsWithProfiles = data.map(comment => ({
      ...comment,
      user_profile: profilesMap[comment.user_id] || null,
    }));
    setComments(commentsWithProfiles as Comment[]);
    setLoading(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) {
      showError('Comment cannot be empty.');
      return;
    }
    if (!currentUserId) {
      showError('You must be logged in to comment.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUserId,
      content: newCommentContent.trim(),
    });

    if (error) {
      showError('Error posting comment: ' + error.message);
      console.error('Error posting comment:', error);
    } else {
      showSuccess('Comment posted!');
      setNewCommentContent('');
      fetchComments(); // Refresh comments
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', currentUserId); // Ensure only the owner can delete

    if (error) {
      showError('Error deleting comment: ' + error.message);
      console.error('Error deleting comment:', error);
    } else {
      showSuccess('Comment deleted!');
      fetchComments(); // Refresh comments
    }
    setLoading(false);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
      <div className="space-y-4 mb-6">
        {loading && comments.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user_profile?.avatar_url || undefined} alt={comment.user_profile?.display_name || "User"} />
                <AvatarFallback>
                  {typeof comment.user_profile?.display_name === 'string' && comment.user_profile.display_name.length > 0
                    ? comment.user_profile.display_name.charAt(0)
                    : 'VA'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.user_profile?.display_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-1">{comment.content}</p>
                {currentUserId === comment.user_id && (
                  <div className="mt-2 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 h-auto p-1 text-xs">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {currentUserId && (
        <form onSubmit={handlePostComment} className="flex flex-col gap-2">
          <Textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            disabled={loading}
          />
          <Button type="submit" className="self-end" disabled={loading}>
            {loading ? 'Commenting...' : 'Post Comment'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;