import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Home, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { BellNotifications } from '@/components/BellNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/auth');
    setIsMenuOpen(false);
  };

  // Navigation items shown to authenticated users
  const authNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse Items', icon: Search },
    { path: '/report', label: 'Report Item', icon: Plus },
    { path: '/dashboard', label: 'Dashboard', icon: User },
  ];

  // Navigation items shown to unauthenticated users
  const publicNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse Items', icon: Search },
    { path: '/blog', label: 'Blog', icon: Home },
  ];

  const navItems = isAuthenticated ? authNavItems : publicNavItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:h-20 sm:px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-primary/10 dark:border-slate-700 dark:bg-primary/20">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">ReConnect</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-card dark:border-slate-700 dark:bg-slate-900/90">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-slate-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
          <div className="flex items-center space-x-2">
            {isAuthenticated && <BellNotifications />}
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="h-11 w-11 text-slate-700 dark:text-slate-200"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSignIn}
                className="px-6"
              >
                Sign In
              </Button>
            )}
          </div>
        )}

        {/* Mobile Actions (Notifications + Menu Button) */}
        {isMobile && (
          <div className="flex items-center space-x-1.5 md:hidden">
            {isAuthenticated && <BellNotifications />}
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        )}

      </div>

      {/* Mobile Sidebar */}
      {isMobile && isMenuOpen &&
        ReactDOM.createPortal(
          <>
            {/* Backdrop Blur */}
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 z-50 h-full w-[min(84vw,20rem)] border-l border-slate-200 bg-white/95 shadow-soft backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
              <div className="flex h-full flex-col p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Menu</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                  {navItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 rounded-xl px-4 py-3 transition-colors duration-200 ${
                        isActive(path)
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-slate-100'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium tracking-tight">{label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Actions */}
                <div className="space-y-3 border-t border-slate-200 pt-6 dark:border-slate-700">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
                    <ThemeToggle />
                  </div>
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleSignIn}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.getElementById('portal-root')!
        )
      }
    </header>
  );
};