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


  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300 ease-out',
        'px-6 pt-6',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      )}
    >
      {/* Container for split layout */}
      <div className="mx-auto max-w-[1400px] flex items-start justify-between">
        {/* Left: Floating Cube */}
        <Link to="/" className="logo-link-floating no-underline">
          <div className="logo-cube">
            <div className="cube-inner">
              <div className="cube-face cube-front">R</div>
              <div className="cube-face cube-back">R</div>
              <div className="cube-face cube-left">R</div>
              <div className="cube-face cube-right">R</div>
              <div className="cube-face cube-top">R</div>
              <div className="cube-face cube-bottom">R</div>
            </div>
          </div>
        </Link>

        {/* Right: Floating Glass Navigation Panel */}
        <nav ref={navRef} className="apple-glass-nav">
          <Flex align="center" gap="3" className="hidden lg:flex">
            {session?.user ? (
              <>
                {/* Content Manager - Left */}
                <Link to="/admin/posts" className="no-underline">
                  <button className="nav-text-btn">
                    <LayoutDashboard size={16} strokeWidth={2.5} />
                    Content Manager
                  </button>
                </Link>

                {/* Write - Right of Content Manager */}
                <Link to="/admin/posts/new" className="no-underline">
                  <button className="nav-text-btn">
                    <PenLine size={16} strokeWidth={2.5} />
                    Write
                  </button>
                </Link>

                {/* Avatar - Large, no chip wrapper */}
                <div className="ml-2">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <button className="avatar-btn">
                        <Avatar
                          size="3"
                          src={session.user.image || undefined}
                          fallback={<User size={20} strokeWidth={2.5} />}
                          radius="full"
                        />
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
            ) : (
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
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-surface mx-4 mt-3 p-5 animate-slide-up">
          <Flex direction="col" gap="2">
            {session?.user ? (
              <>
                <Link
                  to="/admin/posts/new"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="soft"
                    size="2"
                    className="w-full justify-start font-medium text-[15px] h-10 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:border-blue-500/30"
                  >
                    <PenLine size={16} strokeWidth={2} />
                    Write
                  </Button>
                </Link>

                <Link
                  to="/admin/posts"
                  className="no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="2"
                    className="w-full justify-start font-medium text-[15px] h-10 text-gray-300 hover:text-gray-100 hover:bg-white/5"
                  >
                    <LayoutDashboard size={16} strokeWidth={2} />
                    Content Manager
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
                className="no-underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="soft"
                  size="2"
                  className="w-full justify-center font-medium text-[15px] h-10 bg-blue-500/10 hover:bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:border-blue-500/30"
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
