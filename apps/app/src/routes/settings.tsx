import { createFileRoute } from '@tanstack/react-router';
import { Heading, Flex, Text, TextField, Button, Box } from '@radix-ui/themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, User, Camera } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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

function formatDate(date: string | null | undefined): string {
  if (!date) return 'Unknown';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

interface UpdateProfileData {
  name?: string;
  image?: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function SettingsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current user data
  const { data: userData, isLoading } = useQuery<{ user: User }>({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/users/me'),
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
      api.patch<User>('/users/me', data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], { user: updatedUser });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();

      // Update avatar
      setAvatarUrl(data.url);
      const updatedUser = await api.patch<User>('/users/me', { image: data.url });
      queryClient.setQueryData(['currentUser'], { user: updatedUser });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        let errorMessage = 'File upload failed';

        if (rejection.errors?.[0]?.code === 'file-too-large') {
          errorMessage = 'File is too large. Maximum size is 5MB';
        } else if (rejection.errors?.[0]?.code === 'file-invalid-type') {
          errorMessage = 'Invalid file type. Please upload an image.';
        }

        toast.error(errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        await handleAvatarUpload(acceptedFiles[0]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading,
    noClick: false,
  });

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    updateProfileMutation.mutate({ name: name.trim() });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-16 pt-32 md:pt-36">
        <Flex align="center" justify="center" py="9">
          <Loader2 className="animate-spin" size={32} />
        </Flex>
      </div>
    );
  }

  const user = userData?.user;

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16 pt-32 md:pt-36">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-lg text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="w-full animate-fade-in">
        {/* Combined Profile Card */}
        <div className="glass-surface p-8 rounded-2xl">
          <Flex direction="column" gap="6">
            <div>
              <Heading size="5" mb="2">Profile Information</Heading>
              <Text size="2" color="gray">
                Update your personal information
              </Text>
            </div>

            {/* Grid layout with avatar and form fields */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <div
                  {...getRootProps()}
                  className={`
                    relative w-40 h-40 rounded-full cursor-pointer
                    transition-all duration-300 group
                    ${isDragActive ? 'ring-4 ring-purple-500 scale-105' : 'ring-2 ring-purple-500/20 hover:ring-purple-500/50'}
                    ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  <input {...getInputProps()} />

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                      <User className="h-20 w-20 text-white" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className={`
                    absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
                    transition-opacity duration-300
                    ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="h-8 w-8 text-white" />
                        <Text size="1" className="text-white font-medium">
                          {isDragActive ? 'Drop here' : 'Change'}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>

                <Text size="1" color="gray" className="text-center md:text-left max-w-[200px]">
                  Click or drag to upload. Max 5MB • PNG, JPG, GIF, WebP
                </Text>
              </div>

              {/* Form Fields Section */}
              <div className="space-y-6">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" className="block">
                    Full Name
                  </Text>
                  <TextField.Root
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    size="3"
                    className="w-full"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" className="block">
                    Email Address
                  </Text>
                  <TextField.Root
                    value={user?.email || ''}
                    disabled
                    size="3"
                    className="w-full"
                  />
                  <Flex align="center" gap="2" mt="2">
                    {user?.emailVerified ? (
                      <>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <Text size="1" color="gray">Verified</Text>
                      </>
                    ) : (
                      <>
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                        <Text size="1" color="gray">Not verified</Text>
                      </>
                    )}
                  </Flex>
                </Box>

                <Flex justify="between" align="center" className="pt-4 border-t border-white/10">
                  <Text size="2" color="gray">
                    Member since {formatDate(user?.createdAt)}
                  </Text>
                  <Button
                    variant="solid"
                    size="3"
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending || name === user?.name}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all"
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
              </div>
            </div>
          </Flex>
        </div>
      </div>
    </div>
  );
}
