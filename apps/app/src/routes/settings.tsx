import { createFileRoute } from '@tanstack/react-router';
import { Heading, Flex, Text, TextField, Button, Box, Tabs } from '@radix-ui/themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import { FileUpload } from '../components';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Loader2, User, Shield, Bell, Palette } from 'lucide-react';

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
      setAvatarUrl('');
      updateProfileMutation.mutate({ image: null });
      return;
    }

    setAvatarUrl(url);

    try {
      const updatedUser = await api.patch<User>('/api/users/me', { image: url });
      queryClient.setQueryData(['currentUser'], { user: updatedUser });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
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
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
        <Flex align="center" justify="center" py="9">
          <Loader2 className="animate-spin" size={32} />
        </Flex>
      </div>
    );
  }

  const user = userData?.user;

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Settings</h1>
        <p className="text-lg text-gray-400">Manage your account settings and preferences</p>
      </div>

      <Tabs.Root defaultValue="profile" className="w-full">
        <Tabs.List className="mb-8">
          <Tabs.Trigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Tabs.Trigger>
          <Tabs.Trigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </Tabs.Trigger>
        </Tabs.List>

        {/* Profile Tab */}
        <Tabs.Content value="profile" className="animate-fade-in">
          <div className="space-y-6">
            {/* Profile Picture Card */}
            <div className="glass-surface p-8 rounded-2xl">
              <Flex direction="column" gap="6">
                <div>
                  <Heading size="5" mb="2">Profile Picture</Heading>
                  <Text size="2" color="gray">
                    Upload a profile picture to personalize your account
                  </Text>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || 'Profile'}
                        className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-500/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center ring-2 ring-purple-500/20">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <FileUpload
                      value={avatarUrl}
                      onChange={handleAvatarChange}
                      maxSize={5 * 1024 * 1024}
                      accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                    />
                    <Text size="1" color="gray" mt="2">
                      Recommended: Square image, at least 200x200px. Max size: 5 MB
                    </Text>
                  </div>
                </div>
              </Flex>
            </div>

            {/* Profile Information Card */}
            <div className="glass-surface p-8 rounded-2xl">
              <Flex direction="column" gap="6">
                <div>
                  <Heading size="5" mb="2">Profile Information</Heading>
                  <Text size="2" color="gray">
                    Update your personal information
                  </Text>
                </div>

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
                    Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                  </Text>
                  <Button
                    variant="solid"
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
              </Flex>
            </div>
          </div>
        </Tabs.Content>

        {/* Security Tab */}
        <Tabs.Content value="security" className="animate-fade-in">
          <div className="space-y-6">
            <div className="glass-surface p-8 rounded-2xl">
              <Flex direction="column" gap="6">
                <div>
                  <Heading size="5" mb="2">Password</Heading>
                  <Text size="2" color="gray">
                    Change your password to keep your account secure
                  </Text>
                </div>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" className="block">
                    Current Password
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="Enter current password"
                    size="3"
                    className="w-full"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" className="block">
                    New Password
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="Enter new password"
                    size="3"
                    className="w-full"
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" className="block">
                    Confirm New Password
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="Confirm new password"
                    size="3"
                    className="w-full"
                  />
                </Box>

                <Flex justify="end" className="pt-4 border-t border-white/10">
                  <Button variant="solid" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    Update Password
                  </Button>
                </Flex>
              </Flex>
            </div>

            <div className="glass-surface p-8 rounded-2xl">
              <Flex direction="column" gap="4">
                <div>
                  <Heading size="5" mb="2">Sessions</Heading>
                  <Text size="2" color="gray">
                    Manage your active sessions across devices
                  </Text>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <Text size="2" weight="bold">Current Session</Text>
                      <Text size="1" color="gray">Last active: Now</Text>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>
                </div>
              </Flex>
            </div>
          </div>
        </Tabs.Content>

        {/* Notifications Tab */}
        <Tabs.Content value="notifications" className="animate-fade-in">
          <div className="glass-surface p-8 rounded-2xl">
            <Flex direction="column" gap="6">
              <div>
                <Heading size="5" mb="2">Email Notifications</Heading>
                <Text size="2" color="gray">
                  Choose what updates you want to receive
                </Text>
              </div>

              <div className="space-y-4 pt-2">
                <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                  <div>
                    <Text size="2" weight="bold" className="block mb-1">New Comments</Text>
                    <Text size="1" color="gray">Get notified when someone comments on your posts</Text>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </Flex>

                <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                  <div>
                    <Text size="2" weight="bold" className="block mb-1">New Followers</Text>
                    <Text size="1" color="gray">Get notified when someone follows you</Text>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </Flex>

                <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                  <div>
                    <Text size="2" weight="bold" className="block mb-1">Post Likes</Text>
                    <Text size="1" color="gray">Get notified when someone likes your post</Text>
                  </div>
                  <input type="checkbox" className="toggle" />
                </Flex>

                <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                  <div>
                    <Text size="2" weight="bold" className="block mb-1">Weekly Digest</Text>
                    <Text size="1" color="gray">Receive a weekly summary of your activity</Text>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </Flex>
              </div>
            </Flex>
          </div>
        </Tabs.Content>

        {/* Preferences Tab */}
        <Tabs.Content value="preferences" className="animate-fade-in">
          <div className="glass-surface p-8 rounded-2xl">
            <Flex direction="column" gap="6">
              <div>
                <Heading size="5" mb="2">Appearance</Heading>
                <Text size="2" color="gray">
                  Customize how Robin looks for you
                </Text>
              </div>

              <Box>
                <Text as="label" size="2" weight="bold" mb="3" className="block">
                  Theme
                </Text>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-white/5 rounded-lg border-2 border-purple-500 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-900 to-gray-800 rounded mb-3"></div>
                    <Text size="2" weight="bold" className="text-center block">Dark</Text>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border-2 border-transparent cursor-pointer hover:bg-white/10 transition-colors opacity-50">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-white rounded mb-3"></div>
                    <Text size="2" weight="bold" className="text-center block">Light</Text>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border-2 border-transparent cursor-pointer hover:bg-white/10 transition-colors opacity-50">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-900 via-gray-100 to-gray-900 rounded mb-3"></div>
                    <Text size="2" weight="bold" className="text-center block">Auto</Text>
                  </div>
                </div>
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" mb="3" className="block">
                  Reading Preferences
                </Text>
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                    <Text size="2">Show reading time estimates</Text>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </Flex>
                  <Flex justify="between" align="center" className="p-4 bg-white/5 rounded-lg">
                    <Text size="2">Auto-play videos</Text>
                    <input type="checkbox" className="toggle" />
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
