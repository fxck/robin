import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutDashboard, LogOut, Settings, User, Menu, X, PenLine } from 'lucide-react';
import { Button, Avatar, DropdownMenu } from '@radix-ui/themes';
import { useSession, signOut } from '../../lib/auth';
import { Flex } from '../layout/Flex';
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
        'px-4 pt-5',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <nav className="glass-appbar relative py-4 px-7 mx-auto max-w-6xl">
        <Flex align="center" justify="between">
          {/* Logo - Enhanced with better proportions */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-1 ring-white/10 transition-all duration-200 group-hover:shadow-purple-500/40 group-hover:scale-105">
              <span className="text-white font-bold text-lg tracking-tight">R</span>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-gray-100 transition-colors group-hover:text-white">
              Robin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Flex align="center" gap="2" className="hidden lg:flex">
            <Link
              to="/posts"
              className="no-underline px-3 py-1.5 rounded-lg text-[15px] font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-all duration-200"
            >
              Explore
            </Link>

            {session?.user && (
              <>
                <Link to="/admin/posts/new" className="no-underline ml-2">
                  <Button
                    variant="soft"
                    size="2"
                    className="font-medium text-[15px] px-4 h-9 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200"
                  >
                    <PenLine size={16} strokeWidth={2} />
                    Write
                  </Button>
                </Link>

                <Link to="/dashboard" className="no-underline" search={{ verified: false }}>
                  <Button
                    variant="ghost"
                    size="2"
                    className="font-medium text-[15px] px-4 h-9 text-gray-300 hover:text-gray-100 hover:bg-white/5 transition-all duration-200"
                  >
                    <LayoutDashboard size={16} strokeWidth={2} />
                    Dashboard
                  </Button>
                </Link>

                <div className="ml-1">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button
                        variant="soft"
                        size="2"
                        className="font-medium text-[15px] px-3 h-9 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                        style={{ cursor: 'pointer' }}
                      >
                        <Avatar
                          size="1"
                          src={session.user.image || undefined}
                          fallback={<User size={14} strokeWidth={2} />}
                          radius="full"
                        />
                        <span className="max-w-[120px] truncate">
                          {session.user.name || session.user.email?.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content align="end" className="min-w-[200px]">
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
                </div>
              </>
            )}

            {!session?.user && (
              <Link to="/auth" className="no-underline ml-2">
                <Button
                  variant="soft"
                  size="2"
                  className="font-medium text-[15px] px-5 h-9 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </Flex>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </Flex>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-surface mx-4 mt-3 p-5 animate-slide-up">
          <Flex direction="col" gap="2">
            <Link
              to="/posts"
              className="no-underline px-3 py-2.5 rounded-lg text-[15px] font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-all duration-200 block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>

            {session?.user ? (
              <>
                <Link
                  to="/admin/posts/new"
                  className="no-underline mt-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="soft"
                    size="2"
                    className="w-full justify-start font-medium text-[15px] h-10 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/30"
                  >
                    <PenLine size={16} strokeWidth={2} />
                    Write
                  </Button>
                </Link>

                <Link
                  to="/dashboard"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                  search={{ verified: false }}
                >
                  <Button
                    variant="ghost"
                    size="2"
                    className="w-full justify-start font-medium text-[15px] h-10 text-gray-300 hover:text-gray-100 hover:bg-white/5"
                  >
                    <LayoutDashboard size={16} strokeWidth={2} />
                    Dashboard
                  </Button>
                </Link>

                <Link
                  to="/settings"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="2"
                    className="w-full justify-start font-medium text-[15px] h-10 text-gray-300 hover:text-gray-100 hover:bg-white/5"
                  >
                    <Settings size={16} strokeWidth={2} />
                    Settings
                  </Button>
                </Link>

                <div className="h-px bg-white/10 my-1" />

                <Button
                  variant="ghost"
                  size="2"
                  color="red"
                  className="w-full justify-start font-medium text-[15px] h-10"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={16} strokeWidth={2} />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                to="/auth"
                className="no-underline mt-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="soft"
                  size="2"
                  className="w-full justify-center font-medium text-[15px] h-10 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/30"
                >
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
