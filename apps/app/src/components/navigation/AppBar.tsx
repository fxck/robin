import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutDashboard, LogOut, Settings, User, Menu, X, PenLine } from 'lucide-react';
import { Button, Avatar, DropdownMenu } from '@radix-ui/themes';
import { useSession, signOut } from '../../lib/auth';
import { Container } from '../layout/Container';
import { Flex } from '../layout/Flex';
import { Text } from '../typography/Text';
import { cn } from '../../lib/utils';

export function AppBar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show on scroll up, hide on scroll down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-transform duration-300 ease-out',
        'px-4 pt-4',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <nav className="glass-appbar relative py-3 px-6 mx-auto max-w-5xl">
        <Flex align="center" justify="between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
              <Text weight="bold" size="base" style={{ color: 'white' }} className="font-serif">
                R
              </Text>
            </div>
            <Text size="base" weight="bold" style={{ color: 'var(--color-text-primary)' }}>
              Robin
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <Flex align="center" gap="6" className="hidden lg:flex">
            <Link
              to="/posts"
              className="text-text-secondary hover:text-text-primary transition-colors duration-200 no-underline"
            >
              <Text size="sm" weight="medium">
                Explore
              </Text>
            </Link>

            {session?.user && (
              <>
                <Link to="/admin/posts/new" className="no-underline">
                  <Button variant="soft" size="2">
                    <PenLine size={16} />
                    Write
                  </Button>
                </Link>

                <Link to="/dashboard" className="no-underline">
                  <Button variant="ghost" size="2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" size="2" style={{ cursor: 'pointer' }}>
                      <Avatar
                        size="1"
                        src={session.user.image || undefined}
                        fallback={<User size={12} />}
                        radius="full"
                      />
                      {session.user.name}
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    <DropdownMenu.Item asChild>
                      <Link to="/settings" style={{ textDecoration: 'none' }}>
                        <Flex align="center" gap="2">
                          <Settings size={16} />
                          Settings
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator />

                    <DropdownMenu.Item color="red" onClick={handleSignOut}>
                      <Flex align="center" gap="2">
                        <LogOut size={16} />
                        Sign Out
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </>
            )}

            {!session?.user && (
              <Link to="/auth" className="no-underline">
                <Button variant="soft" size="2">
                  Sign In
                </Button>
              </Link>
            )}
          </Flex>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-text-primary hover:text-accent-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Flex>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-surface mx-4 mt-2 p-4 animate-slide-up">
          <Flex direction="col" gap="3">
            <Link
              to="/posts"
              className="text-text-secondary hover:text-text-primary transition-colors duration-200 no-underline py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Text size="sm" weight="medium">
                Explore
              </Text>
            </Link>

            {session?.user ? (
              <>
                <Link
                  to="/admin/posts/new"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="soft" size="2" style={{ width: '100%' }}>
                    <PenLine size={16} />
                    Write
                  </Button>
                </Link>

                <Link
                  to="/dashboard"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="2" style={{ width: '100%' }}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>

                <Link
                  to="/settings"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="2" style={{ width: '100%' }}>
                    <Settings size={16} />
                    Settings
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="2"
                  color="red"
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className="no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="soft" size="2" style={{ width: '100%' }}>
                  Sign In
                </Button>
              </Link>
            )}
          </Flex>
        </div>
      )}
    </header>
  );
}
