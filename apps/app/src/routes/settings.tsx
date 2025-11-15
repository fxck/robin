import { createFileRoute } from '@tanstack/react-router';
import { Container, Heading, Card, Flex, Text, TextField, Button, Avatar, Box } from '@radix-ui/themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { Upload, Loader2, User } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current user data
  const { data: userData, isLoading } = useQuery<{ user: User }>({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/api/users/me'),
  });

  // Set initial name when data loads
  if (userData?.user && !name) {
    setName(userData.user.name);
  }

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

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to upload avatar');
      }

      return response.json();
    },
    onSuccess: (data: { user: User; url: string }) => {
      queryClient.setQueryData(['currentUser'], { user: data.user });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Avatar updated successfully');
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar');
      setIsUploading(false);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    // Validate file size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5 MB limit');
      return;
    }

    setIsUploading(true);
    uploadAvatarMutation.mutate(file);
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handleRemoveAvatar = () => {
    updateProfileMutation.mutate({ image: null });
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

          <Flex align="center" gap="4">
            <Avatar
              size="8"
              src={user?.image || undefined}
              fallback={<User size={32} />}
              radius="full"
            />

            <Flex direction="column" gap="2" style={{ flex: 1 }}>
              <Text size="2" color="gray">
                Upload a new profile picture. Max size: 5 MB
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <Flex gap="2">
                <Button
                  variant="soft"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || uploadAvatarMutation.isPending}
                >
                  {isUploading || uploadAvatarMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload New
                    </>
                  )}
                </Button>

                {user?.image && (
                  <Button
                    variant="outline"
                    color="red"
                    onClick={handleRemoveAvatar}
                    disabled={updateProfileMutation.isPending}
                  >
                    Remove
                  </Button>
                )}
              </Flex>
            </Flex>
          </Flex>
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
