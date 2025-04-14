import { User } from "@/types";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";

interface HeaderProps {
  currentUser: User | null;
  language: string;
  onToggleLanguage: () => void;
  onLogout: () => void;
}

export default function Header({ currentUser, language, onToggleLanguage, onLogout }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1590682644856-25940a16d0fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80" 
              alt="Village Wheels Logo" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold text-primary">
              <span>{t('app.title')}</span>
              <span className="text-sm text-gray-500 block">{t('app.subtitle')}</span>
            </h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleLanguage}
            className="text-gray-600 text-sm font-medium px-2 py-1 rounded border border-gray-300"
          >
            {language === 'en' ? 'தமிழ்' : 'English'}
          </Button>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                {currentUser.role === 'owner' && (
                  <Link href="/role-selector">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>{t('nav.switchRole')}</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="default">
                {t('auth.login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
