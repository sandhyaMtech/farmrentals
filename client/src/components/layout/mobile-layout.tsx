import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  Home, 
  Search, 
  BookOpen, 
  Settings, 
  Tractor, 
  LogOut,
  User,
  Globe
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  language: string;
}

export function MobileLayout({ children, title, language }: MobileLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const translations = {
    en: {
      browse: 'Browse',
      bookings: 'Bookings',
      equipment: 'Equipment',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      language: 'Language',
      switchToTamil: 'Switch to Tamil',
      switchToEnglish: 'Switch to English',
      guest: 'Guest'
    },
    ta: {
      browse: 'பார்வையிடு',
      bookings: 'முன்பதிவுகள்',
      equipment: 'உபகரணங்கள்',
      profile: 'சுயவிவரம்',
      logout: 'வெளியேறு',
      login: 'உள்நுழைய',
      language: 'மொழி',
      switchToTamil: 'தமிழுக்கு மாறவும்',
      switchToEnglish: 'ஆங்கிலத்திற்கு மாறவும்',
      guest: 'விருந்தினர்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setMenuOpen(false);
    navigate('/auth');
  };
  
  // Get user's initial for avatar
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold">{title}</h1>
            
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm">
                {/* User Profile */}
                <div className="flex items-center mb-6 mt-2">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitial()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{user?.name || t.guest}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.role === 'farmer' ? 'Farmer' : user?.role === 'owner' ? 'Owner' : ''}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4">
                  {user && (
                    <>
                      {user.role === 'farmer' && (
                        <Button
                          variant={location === '/browse' || location === '/' ? 'default' : 'ghost'}
                          className="justify-start"
                          onClick={() => {
                            navigate('/browse');
                            setMenuOpen(false);
                          }}
                        >
                          <Search className="mr-2 h-5 w-5" />
                          {t.browse}
                        </Button>
                      )}
                      
                      <Button
                        variant={location === '/bookings' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => {
                          navigate('/bookings');
                          setMenuOpen(false);
                        }}
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        {t.bookings}
                      </Button>
                      
                      {user.role === 'owner' && (
                        <Button
                          variant={location === '/equipment' || location === '/' ? 'default' : 'ghost'}
                          className="justify-start"
                          onClick={() => {
                            navigate('/equipment');
                            setMenuOpen(false);
                          }}
                        >
                          <Tractor className="mr-2 h-5 w-5" />
                          {t.equipment}
                        </Button>
                      )}
                      
                      <Button
                        variant={location === '/profile' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => {
                          navigate('/profile');
                          setMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t.profile}
                      </Button>
                      
                      <Separator className="my-2" />
                      
                      <Button 
                        variant="ghost" 
                        className="justify-start text-muted-foreground"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        {t.logout}
                      </Button>
                    </>
                  )}
                  
                  {!user && (
                    <Button
                      variant="default"
                      className="justify-start"
                      onClick={() => {
                        navigate('/auth');
                        setMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-5 w-5" />
                      {t.login}
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container px-4 pb-16">
        {children}
      </main>
      
      {/* Bottom Nav Bar for quick access */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
          <div className="container h-full">
            <div className="grid h-full w-full grid-cols-3">
              {user.role === 'farmer' ? (
                <>
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/browse')}
                  >
                    <Search className={`h-5 w-5 ${(location === '/browse' || location === '/') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${(location === '/browse' || location === '/') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.browse}
                    </span>
                  </Button>
                  
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/bookings')}
                  >
                    <BookOpen className={`h-5 w-5 ${location === '/bookings' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${location === '/bookings' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.bookings}
                    </span>
                  </Button>
                  
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/profile')}
                  >
                    <User className={`h-5 w-5 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${location === '/profile' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.profile}
                    </span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/equipment')}
                  >
                    <Tractor className={`h-5 w-5 ${(location === '/equipment' || location === '/') ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${(location === '/equipment' || location === '/') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.equipment}
                    </span>
                  </Button>
                  
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/bookings')}
                  >
                    <BookOpen className={`h-5 w-5 ${location === '/bookings' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${location === '/bookings' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.bookings}
                    </span>
                  </Button>
                  
                  <Button
                    variant="link"
                    className="h-full w-full flex flex-col items-center justify-center rounded-none space-y-1"
                    onClick={() => navigate('/profile')}
                  >
                    <User className={`h-5 w-5 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${location === '/profile' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {t.profile}
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}