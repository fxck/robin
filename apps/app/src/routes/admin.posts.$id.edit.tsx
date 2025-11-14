import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Heading, Flex, Button, Card, TextField, TextArea, Box, Select, Text } from '@radix-ui/themes';
import { Upload, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import type { UpdatePostInput, UploadResponse, PostResponse } from '@robin/types';

export const Route = createFileRoute('/admin/posts/$id/edit')({
  component: EditPostPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
});

function EditPostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [version, setVersion] = useState(1);
  const [uploading, setUploading] = useState(false);

  // Fetch existing post
  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get<PostResponse>(`/api/posts/${id}`),
  });

  // Set form values when data loads
  useEffect(() => {
    if (data?.post) {
      setTitle(data.post.title);
      setContent(data.post.content);
      setCoverImage(data.post.coverImage || '');
      setStatus(data.post.status);
      setVersion(data.post.version);
    }
  }, [data]);

  const updatePostMutation = useMutation({
    mutationFn: async (updateData: UpdatePostInput) => {
      return api.patch<PostResponse>(`/api/posts/${id}`, updateData);
    },
    onSuccess: () => {
      toast.success('Post updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigate({ to: '/admin/posts' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadData: UploadResponse = await response.json();
      setCoverImage(uploadData.url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    updatePostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status,
      version,
    });
  };

  if (isLoading) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>
        <Container size="3" py="6">
          <Card>
            <Flex align="center" justify="center" py="9">
              <Text>Loading...</Text>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!data?.post) {
    return (
      <Box style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>
        <Container size="3" py="6">
          <Card>
            <Flex direction="column" align="center" gap="4" py="9">
              <Text size="5">Post not found</Text>
              <Button onClick={() => navigate({ to: '/admin/posts' })}>
                <ArrowLeft size={16} />
                Back to Posts
              </Button>
            </Flex>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>
      <Container size="3" py="6">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="6">
            {/* Header */}
            <Flex justify="between" align="center">
              <Heading size="8">Edit Post</Heading>
              <Flex gap="2">
                <Button type="button" variant="soft" onClick={() => navigate({ to: '/admin/posts' })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePostMutation.isPending}>
                  <Save size={20} />
                  {updatePostMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </Flex>
            </Flex>

            {/* Editor Card */}
            <Card size="4">
              <Flex direction="column" gap="4">
                {/* Cover Image */}
                <Box>
                  <Text size="2" weight="bold" mb="2" as="label">
                    Cover Image
                  </Text>
                  <Flex gap="3" align="center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload size={16} />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    {coverImage && (
                      <Text size="2" color="green">
                        ✓ Image uploaded
                      </Text>
                    )}
                  </Flex>
                  {coverImage && (
                    <Box mt="3">
                      <img
                        src={coverImage}
                        alt="Cover preview"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-2)',
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Title */}
                <Box>
                  <Text size="2" weight="bold" mb="2" as="label">
                    Title
                  </Text>
                  <TextField.Root
                    size="3"
                    placeholder="Enter post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Box>

                {/* Content */}
                <Box>
                  <Text size="2" weight="bold" mb="2" as="label">
                    Content
                  </Text>
                  <TextArea
                    size="3"
                    placeholder="Write your post content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ minHeight: '400px', fontFamily: 'monospace' }}
                  />
                  <Text size="1" color="gray" mt="1">
                    {content.length} characters
                  </Text>
                </Box>

                {/* Status */}
                <Box>
                  <Text size="2" weight="bold" mb="2" as="label">
                    Status
                  </Text>
                  <Select.Root value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="draft">Draft</Select.Item>
                      <Select.Item value="published">Published</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>
            </Card>
          </Flex>
        </form>
      </Container>
    </Box>
  );
}
