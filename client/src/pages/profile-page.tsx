import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Globe, 
  Settings, 
  User, 
  Phone,
  Shield,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AIChatbot from '@/components/ai-chatbot';
import ComplaintForm from '@/components/complaint-form';

interface ProfilePageProps {
  language: string;
  onToggleLanguage: () => void;
}

export default function ProfilePage({ language, onToggleLanguage }: ProfilePageProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [complaintFormOpen, setComplaintFormOpen] = useState(false);
  
  const translations = {
    en: {
      profile: 'Profile',
      accountSettings: 'Account Settings',
      language: 'Language',
      switchToTamil: 'Switch to Tamil',
      switchToEnglish: 'Switch to English',
      logout: 'Logout',
      personalInfo: 'Personal Information',
      name: 'Name',
      phone: 'Phone',
      username: 'Username',
      role: 'Role',
      farmer: 'Farmer',
      owner: 'Equipment Owner',
      version: 'App Version',
      currentLanguage: 'Current Language',
      english: 'English',
      tamil: 'Tamil',
      contact: 'Contact Support',
      aboutApp: 'About Village Wheels',
      aboutDescription: 'Village Wheels connects farmers with equipment owners to make farming equipment accessible to everyone.',
      contactDescription: 'Having issues with the app? Contact our support team.',
      chatWithAI: 'Chat with AI Assistant',
      chatDescription: 'Get instant answers to your questions about the platform',
      fileComplaint: 'File a Complaint',
      complaintDescription: 'Report issues with equipment, drivers, or service',
      supportOptions: 'Support Options'
    },
    ta: {
      profile: 'சுயவிவரம்',
      accountSettings: 'கணக்கு அமைப்புகள்',
      language: 'மொழி',
      switchToTamil: 'தமிழுக்கு மாறவும்',
      switchToEnglish: 'ஆங்கிலத்திற்கு மாறவும்',
      logout: 'வெளியேறு',
      personalInfo: 'தனிப்பட்ட தகவல்',
      name: 'பெயர்',
      phone: 'தொலைபேசி',
      username: 'பயனர்பெயர்',
      role: 'பங்கு',
      farmer: 'விவசாயி',
      owner: 'உபகரண உரிமையாளர்',
      version: 'பயன்பாட்டு பதிப்பு',
      currentLanguage: 'தற்போதைய மொழி',
      english: 'ஆங்கிலம்',
      tamil: 'தமிழ்',
      contact: 'ஆதரவைத் தொடர்பு கொள்ளவும்',
      aboutApp: 'கிராம சக்கரங்களைப் பற்றி',
      aboutDescription: 'கிராம சக்கரங்கள் விவசாயிகளை உபகரண உரிமையாளர்களுடன் இணைத்து, விவசாய உபகரணங்களை அனைவருக்கும் அணுகக்கூடியதாக்குகிறது.',
      contactDescription: 'பயன்பாட்டில் சிக்கல்கள் உள்ளதா? எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளவும்.',
      chatWithAI: 'செயற்கை நுண்ணறிவு உதவியாளருடன் அரட்டை',
      chatDescription: 'தளம் பற்றிய உங்கள் கேள்விகளுக்கு உடனடி பதில்களைப் பெறுங்கள்',
      fileComplaint: 'புகார் தாக்கல் செய்யவும்',
      complaintDescription: 'உபகரணங்கள், டிரைவர்கள் அல்லது சேவை பற்றிய சிக்கல்களைப் புகாரளிக்கவும்',
      supportOptions: 'ஆதரவு விருப்பங்கள்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  // Get user's initial for avatar
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/auth');
  };
  
  // Get translation of role
  const getRole = () => {
    if (!user) return '';
    return user.role === 'farmer' ? t.farmer : t.owner;
  };
  
  return (
    <MobileLayout title={t.profile} language={language}>
      <div className="space-y-6 py-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarFallback className="text-xl">{getInitial()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription>{getRole()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t.username}</span>
                <span>{user?.username}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t.phone}</span>
                <span>{user?.phone}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t.role}</span>
                <span>{getRole()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Support Options Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.supportOptions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Chatbot Option */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium">{t.chatWithAI}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.chatDescription}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setChatbotOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </div>
            
            <Separator />
            
            {/* File Complaint Option */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium">{t.fileComplaint}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.complaintDescription}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setComplaintFormOpen(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.accountSettings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium">{t.language}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'en' ? t.english : t.tamil}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={onToggleLanguage}>
                {language === 'en' ? t.switchToTamil : t.switchToEnglish}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* About the App */}
        <Card>
          <CardHeader>
            <CardTitle>{t.aboutApp}</CardTitle>
            <CardDescription>{t.aboutDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{t.version}</span>
                <span>1.0.0</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between">
                <span>{t.currentLanguage}</span>
                <span>{language === 'en' ? t.english : t.tamil}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.contact}</CardTitle>
            <CardDescription>{t.contactDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              support@villagewheels.com
            </Button>
          </CardContent>
        </Card>
        
        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t.logout}
        </Button>
      </div>
      
      {/* AI Chatbot */}
      <AIChatbot 
        language={language}
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
      
      {/* Complaint Form */}
      <ComplaintForm 
        language={language}
        isOpen={complaintFormOpen}
        onClose={() => setComplaintFormOpen(false)}
      />
    </MobileLayout>
  );
}