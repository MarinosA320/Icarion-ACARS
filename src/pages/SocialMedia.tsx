import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { showSuccess, showError } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Heart } from 'lucide-react'; // Import Heart icon
import CommentSection from '@/components/CommentSection'; // New import
import { fetchProfilesData } from '@/utils/supabaseDataFetch'; // Import fetchProfilesData
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface SocialPost {
  id: string;
  user_id: string;
  image_url: string | null; // Made optional
  caption: string | null;
  created_at: string;
  user_profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  likes_count: number; // New field for like count
  has_liked: boolean; // New field to indicate if current user has liked
}

const SocialMedia = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      fetchPosts();
    };
    fetchUserDataAndPosts();
  }, [currentUserId]); // Added currentUserId to dependency array to re-fetch posts when it's set

  const fetchPosts = async () => {
    setLoading(true);
    // Fetch posts without direct profile join
    const { data, error } = await supabase
      .from('social_posts')
      .select('id,user_id,image_url,caption,created_at,likes(user_id)')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Error fetching social posts: ' + error.message);
      console.error('Error fetching social posts:', error);
      setLoading(false);
      return;
    }

    const allUserIds = new Set<string>();
    data.forEach(post => allUserIds.add(post.user_id));

    const profilesMap = await fetchProfilesData(Array.from(allUserIds));

    const postsWithProfilesAndLikes = data.map(post => ({
      ...post,
      user_profile: profilesMap[post.user_id] || null,
      likes_count: post.likes ? post.likes.length : 0,
      has_liked: post.likes ? post.likes.some((like: { user_id: string }) => like.user_id === currentUserId) : false,
    }));
    setPosts(postsWithProfilesAndLikes as SocialPost[]);
    setLoading(false);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostImage && !newPostCaption) { // Allow post without image if caption exists
      showError('Please add an image or a caption for your post.');
      return;
    }

    setLoading(true);
    const { data: { user } = { user: null } } = await supabase.auth.getUser(); // Destructure with default
    if (!user) {
      showError('User not logged in.');
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;
    if (newPostImage) {
      const fileExt = newPostImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `social_media_posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('social-media-posts') // Changed to social-media-posts
        .upload(filePath, newPostImage);

      if (uploadError) {
        showError('Error uploading image: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('social-media-posts').getPublicUrl(filePath); // Changed to social-media-posts
      imageUrl = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase.from('social_posts').insert({
      user_id: user.id,
      image_url: imageUrl,
      caption: newPostCaption,
    });

    if (insertError) {
      showError('Error creating post: ' + insertError.message);
    } else {
      showSuccess('Post created successfully!');
      setNewPostImage(null);
      setNewPostCaption('');
      fetchPosts(); // Refresh posts
    }
    setLoading(false);
  };

  const handleDeletePost = async (postId: string, imageUrl: string | null) => {
    setLoading(true);
    // If there's an image, delete it from storage
    if (imageUrl) {
      // Extract the path from the public URL
      // The public URL format is typically: https://<project_id>.supabase.co/storage/v1/object/public/<bucket_name>/<path_to_file>
      // We need to extract '<bucket_name>/<path_to_file>'
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf('public') + 1;
      const filePathInStorage = urlParts.slice(bucketIndex).join('/');

      // Delete image from storage
      const { error: storageError } = await supabase.storage
        .from('social-media-posts') // Changed to social-media-posts
        .remove([filePathInStorage]);

      if (storageError) {
        showError('Error deleting image from storage: ' + storageError.message);
        setLoading(false);
        return;
      }
    }

    // Delete post from database
    const { error: dbError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (dbError) {
      showError('Error deleting post: ' + dbError.message);
    } else {
      showSuccess('Post deleted successfully!');
      fetchPosts(); // Refresh posts
    }
    setLoading(false);
  };

  const handleLikePost = async (postId: string, hasLiked: boolean) => {
    if (!currentUserId) {
      showError('You must be logged in to like posts.');
      return;
    }

    if (hasLiked) {
      // Unlike the post
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);

      if (error) {
        showError('Error unliking post: ' + error.message);
      } else {
        showSuccess('Post unliked!');
        fetchPosts(); // Refresh posts
      }
    } else {
      // Like the post
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: currentUserId });

      if (error) {
        showError('Error liking post: ' + error.message);
      } else {
        showSuccess('Post liked!');
        fetchPosts(); // Refresh posts
      }
    }
  };

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className="p-6 shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="w-full h-48 rounded-md mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="mt-6 border-t pt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-24 self-end" />
          </div>
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="container mx-auto p-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Social Media Feed</h1>

      {/* New Post Section */}
      <Card className="mb-8 p-6 shadow-md rounded-lg">
        <CardHeader className="p-0 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Post</h2>
        </CardHeader>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <Input
              id="postImage"
              type="file"
              accept="image/*"
              onChange={(e) => setNewPostImage(e.target.files ? e.target.files[0] : null)}
              className="w-full"
            />
          </div>
          <div>
            <Textarea
              id="postCaption"
              value={newPostCaption}
              onChange={(e) => setNewPostCaption(e.target.value)}
              placeholder="What's on your mind? Add a caption..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Posting...' : 'Post to Feed'}
          </Button>
        </form>
      </Card>

      {/* Social Feed */}
      <div className="space-y-6">
        {loading ? (
          renderSkeletons()
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6 shadow-md rounded-lg transition-transform duration-200 hover:scale-[1.01]">
              <CardHeader className="flex flex-row items-center gap-4 p-0 pb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user_profile?.avatar_url || undefined} alt={post.user_profile?.display_name || "User"} />
                  <AvatarFallback>
                    {typeof post.user_profile?.display_name === 'string' && post.user_profile.display_name.length > 0
                      ? post.user_profile.display_name.charAt(0)
                      : 'VA'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{post.user_profile?.display_name || 'Anonymous Pilot'}</p>
                  <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {post.image_url && (
                  <img src={post.image_url} alt="Social Post" className="w-full h-auto max-h-96 object-contain rounded-md mb-4" />
                )}
                {post.caption && (
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.caption}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikePost(post.id, post.has_liked)}
                    className={`flex items-center gap-1 ${post.has_liked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  >
                    <Heart fill={post.has_liked ? 'currentColor' : 'none'} className="h-4 w-4" />
                    {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
                  </Button>
                  {currentUserId === post.user_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete Post</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your social media post and its associated image.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post.id, post.image_url)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <CommentSection postId={post.id} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialMedia;