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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse Items', icon: Search },
    { path: '/report', label: 'Report Item', icon: Plus },
    { path: '/dashboard', label: 'Dashboard', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">ReConnect</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-1 bg-accent/50 rounded-full p-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 water-drop ${
                    isActive(path)
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'hover:bg-background hover:shadow-sm'
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
            <BellNotifications />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Mobile Actions (Notifications + Menu Button) */}
        {isMobile && (
          <div className="flex items-center space-x-2 md:hidden">
            <BellNotifications />
            <Button
              variant="ghost"
              size="icon"
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
            <div className="fixed right-0 top-0 h-full w-64 bg-card border-l shadow-xl z-50">
              <div className="flex flex-col h-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-lg gradient-text">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 water-drop ${
                        isActive(path)
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Actions */}
                <div className="pt-6 border-t space-y-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
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