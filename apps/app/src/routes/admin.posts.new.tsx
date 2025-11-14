import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Heading, Flex, Button, Card, TextField, TextArea, Box, Select, Text } from '@radix-ui/themes';
import { Upload, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import type { CreatePostInput, UploadResponse, PostResponse } from '@robin/types';

export const Route = createFileRoute('/admin/posts/new')({
  component: NewPostPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/auth' });
    }
  },
});

function NewPostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [uploading, setUploading] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      return api.post<PostResponse>('/api/posts', data);
    },
    onSuccess: (data) => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate({ to: `/admin/posts` });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
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

      const data: UploadResponse = await response.json();
      setCoverImage(data.url);
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

    createPostMutation.mutate({
      title,
      content,
      coverImage: coverImage || undefined,
      status,
    });
  };

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>
      <Container size="3" py="6">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="6">
            {/* Header */}
            <Flex justify="between" align="center">
              <Heading size="8">Create Post</Heading>
              <Flex gap="2">
                <Button type="button" variant="soft" onClick={() => navigate({ to: '/posts' })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  <Save size={20} />
                  {createPostMutation.isPending ? 'Saving...' : 'Save'}
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
                    placeholder="Write your post content here... (Markdown supported)"
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

            {/* Preview Card */}
            {content && (
              <Card size="4">
                <Flex direction="column" gap="3">
                  <Flex align="center" gap="2">
                    <Eye size={16} />
                    <Heading size="4">Preview</Heading>
                  </Flex>
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-2)',
                      }}
                    />
                  )}
                  <Heading size="6">{title || 'Untitled'}</Heading>
                  <Text
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                    }}
                  >
                    {content}
                  </Text>
                </Flex>
              </Card>
            )}
          </Flex>
        </form>
      </Container>
    </Box>
  );
}
