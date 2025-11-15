import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Heading, Flex, Button, Card, TextField, Box, Select, Text } from '@radix-ui/themes';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api-client';
import { authClient } from '../lib/auth';
import { AdvancedEditor, FileUpload } from '../components';
import type { CreatePostInput, PostResponse } from '@robin/types';

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
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

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
      <Container size="4" py="6">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="6">
            {/* Header */}
            <Flex justify="between" align="center">
              <Heading size="8">Create Post</Heading>
              <Flex gap="2">
                <Button type="button" variant="soft" onClick={() => navigate({ to: '/admin/posts' })}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  <Save size={16} />
                  {createPostMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </Flex>
            </Flex>

            {/* Metadata Card */}
            <Card>
              <Flex direction="column" gap="4" p="4">
                <Flex gap="4" wrap="wrap">
                  {/* Cover Image */}
                  <Box style={{ flex: '1', minWidth: '200px' }}>
                    <Text size="2" weight="bold" mb="2" as="label">
                      Cover Image
                    </Text>
                    <FileUpload value={coverImage} onChange={setCoverImage} />
                  </Box>

                  {/* Status */}
                  <Box style={{ minWidth: '150px' }}>
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
                    style={{ fontSize: '1.5rem', fontWeight: '600' }}
                  />
                </Box>
              </Flex>
            </Card>

            {/* Editor */}
            <AdvancedEditor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here... Press '/' for commands"
            />
          </Flex>
        </form>
      </Container>
    </Box>
  );
}
