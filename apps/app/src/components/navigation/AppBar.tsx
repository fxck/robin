import { useState, useEffect, useRef } from 'react';
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
  const navRef = useRef<HTMLElement>(null);

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

  // Spotlight effect - track mouse position for jheyy-style interaction
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      nav.style.setProperty('--mouse-x', `${x}%`);
      nav.style.setProperty('--mouse-y', `${y}%`);
    };

    nav.addEventListener('mousemove', handleMouseMove);
    return () => nav.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      <nav ref={navRef} className="glass-appbar relative py-5 px-8 mx-auto max-w-7xl">
        <div className="glass-appbar-glow" aria-hidden="true"></div>
        <div className="glass-appbar-noise" aria-hidden="true"></div>
        <Flex align="center" justify="between">
          {/* Logo - Refined & Elegant */}
          <Link to="/" className="logo-container no-underline">
            <div className="logo-icon">
              <span className="text-black font-bold text-lg tracking-tight select-none relative z-10">R</span>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-white/95 transition-colors duration-200">
              Robin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <Flex align="center" gap="3" className="hidden lg:flex">
            <Link
              to="/posts"
              className="no-underline"
            >
              <span className="nav-btn">
                Explore
              </span>
            </Link>

            {session?.user && (
              <>
                <Link to="/admin/posts/new" className="no-underline">
                  <button className="nav-btn-primary">
                    <PenLine size={16} strokeWidth={2.5} />
                    Write
                  </button>
                </Link>

                <Link to="/dashboard" className="no-underline" search={{ verified: false }}>
                  <button className="nav-btn">
                    <LayoutDashboard size={16} strokeWidth={2.5} />
                    Dashboard
                  </button>
                </Link>

                <div className="ml-2">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <button className="profile-btn">
                        <Avatar
                          size="1"
                          src={session.user.image || undefined}
                          fallback={<User size={15} strokeWidth={2.5} />}
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
                <button className="nav-btn-primary">
                  Sign In
                </button>
              </Link>
            )}
          </Flex>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden mobile-menu-btn"
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
                    className="w-full justify-start font-medium text-[15px] h-10 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:border-amber-500/30"
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
                  className="w-full justify-center font-medium text-[15px] h-10 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:border-amber-500/30"
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
