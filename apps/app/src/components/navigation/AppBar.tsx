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
      <nav className="glass-appbar relative py-5 px-8 mx-auto max-w-7xl">
        <Flex align="center" justify="between">
          {/* Logo - Refined & Elegant */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-amber-500/30 group-hover:scale-105">
              <span className="text-black font-bold text-lg tracking-tight select-none">R</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/15"></div>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-white/95 transition-all duration-300 group-hover:text-white">
              Robin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Flex align="center" gap="3" className="hidden lg:flex">
            <Link
              to="/posts"
              className="no-underline px-4 py-2 rounded-xl text-[15px] font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Explore
            </Link>

            {session?.user && (
              <>
                <Link to="/admin/posts/new" className="no-underline">
                  <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[15px] font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 border border-purple-400/30">
                    <PenLine size={17} strokeWidth={2.5} />
                    Write
                  </button>
                </Link>

                <Link to="/dashboard" className="no-underline" search={{ verified: false }}>
                  <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[15px] font-semibold text-gray-200 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200">
                    <LayoutDashboard size={17} strokeWidth={2.5} />
                    Dashboard
                  </button>
                </Link>

                <div className="ml-2">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <button className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[15px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer text-gray-100">
                        <Avatar
                          size="1"
                          src={session.user.image || undefined}
                          fallback={<User size={16} strokeWidth={2.5} />}
                          radius="full"
                        />
                        <span className="max-w-[100px] truncate">
                          {session.user.name || session.user.email?.split('@')[0]}
                        </span>
                      </button>
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
              <Link to="/auth" className="no-underline">
                <button className="px-6 py-2 rounded-xl text-[15px] font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 border border-purple-400/30">
                  Sign In
                </button>
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
