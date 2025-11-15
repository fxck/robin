import { createFileRoute } from '@tanstack/react-router';
import { Container, Heading, Card, Flex, Text, TextField, Button, Avatar, Box } from '@radix-ui/themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { FileUpload } from '../components';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  name?: string;
  image?: string | null;
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Fetch current user data
  const { data: userData, isLoading } = useQuery<{ user: User }>({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/api/users/me'),
  });

  // Set initial values when data loads (only once)
  useEffect(() => {
    if (userData?.user && !initialized) {
      setName(userData.user.name);
      setAvatarUrl(userData.user.image || '');
      setInitialized(true);
    }
  }, [userData, initialized]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) =>
      api.patch<User>('/api/users/me', data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], { user: updatedUser });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleAvatarChange = async (url: string) => {
    if (!url) {
      // Handle removal
      setAvatarUrl('');
      updateProfileMutation.mutate({ image: null });
      return;
    }

    // Update local state immediately for better UX
    setAvatarUrl(url);

    // Update the database
    try {
      const updatedUser = await api.patch<User>('/api/users/me', { image: url });
      queryClient.setQueryData(['currentUser'], { user: updatedUser });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
      // Revert on error
      setAvatarUrl(userData?.user?.image || '');
    }
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    updateProfileMutation.mutate({ name: name.trim() });
  };

  if (isLoading) {
    return (
      <Container size="2" py="9">
        <Flex align="center" justify="center" py="9">
          <Loader2 className="animate-spin" size={32} />
        </Flex>
      </Container>
    );
  }

  const user = userData?.user;

  return (
    <Container size="2" py="9">
      <Heading size="8" mb="6">
        Account Settings
      </Heading>

      {/* Avatar Section */}
      <Card mb="4">
        <Flex direction="column" gap="4">
          <Heading size="5">Profile Picture</Heading>

          <Box>
            <Text size="2" color="gray" mb="3" style={{ display: 'block' }}>
              Click or drag & drop to upload a new profile picture. Max size: 5 MB
            </Text>

            <FileUpload
              value={avatarUrl}
              onChange={handleAvatarChange}
              maxSize={5 * 1024 * 1024}
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
            />
          </Box>
        </Flex>
      </Card>

      {/* Profile Information */}
      <Card>
        <Flex direction="column" gap="4">
          <Heading size="5">Profile Information</Heading>

          <Box>
            <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              size="3"
            />
          </Box>

          <Box>
            <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
              Email
            </Text>
            <TextField.Root
              value={user?.email || ''}
              disabled
              size="3"
            />
            <Text size="1" color="gray" mt="1">
              Email cannot be changed
              {user?.emailVerified && ' • Verified'}
              {!user?.emailVerified && ' • Not verified'}
            </Text>
          </Box>

          <Flex justify="end" gap="2">
            <Button
              variant="soft"
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending || name === user?.name}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Container>
  );
}
