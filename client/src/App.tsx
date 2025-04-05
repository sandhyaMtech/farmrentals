import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import FarmerDashboard from "@/pages/farmer-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import AuthPage from "@/pages/auth-page";
import MobileAuthPage from "@/pages/mobile-auth-page";
import MobileBrowsePage from "@/pages/mobile-browse-page";
import MobileBookingsPage from "@/pages/mobile-bookings-page";
import MobileEquipmentPage from "@/pages/mobile-equipment-page";
import ProfilePage from "@/pages/profile-page";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import i18n from "./lib/i18n";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useIsMobile } from "@/hooks/use-mobile";
import AIChatbot from "@/components/ai-chatbot";
import ComplaintForm from "@/components/complaint-form";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router() {
  const [language, setLanguage] = useState<string>("en");
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [complaintFormOpen, setComplaintFormOpen] = useState(false);

  const handleToggleLanguage = () => {
    const newLanguage = language === "en" ? "ta" : "en";
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };
  
  // Effect to sync i18n language with our state
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Component for the homepage that redirects based on user role
  const HomePage = () => {
    if (isMobile) {
      if (user?.role === "farmer") {
        return <MobileBrowsePage language={language} />;
      } else {
        return <MobileEquipmentPage language={language} />;
      }
    } else {
      if (user?.role === "farmer") {
        return <FarmerDashboard currentUser={user} language={language} />;
      } else {
        return <OwnerDashboard currentUser={user} language={language} />;
      }
    }
  };

  // We don't need to render header and footer when using mobile layouts
  if (isMobile) {
    const translations = {
      en: {
        chat: 'Chat with AI',
        report: 'Report Issue'
      },
      ta: {
        chat: 'AI உடன் அரட்டை',
        report: 'சிக்கலைப் புகாரளிக்க'
      }
    };
    
    const t = translations[language === 'en' ? 'en' : 'ta'];
    
    return (
      <div className="min-h-screen">
        <main>
          <Switch>
            <Route 
              path="/auth" 
              component={() => <MobileAuthPage language={language} onToggleLanguage={handleToggleLanguage} />} 
            />
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute 
              path="/browse" 
              component={() => <MobileBrowsePage language={language} />} 
            />
            <ProtectedRoute 
              path="/bookings" 
              component={() => <MobileBookingsPage language={language} />} 
            />
            <ProtectedRoute 
              path="/equipment" 
              component={() => <MobileEquipmentPage language={language} />} 
            />
            <ProtectedRoute 
              path="/profile" 
              component={() => <ProfilePage language={language} onToggleLanguage={handleToggleLanguage} />} 
            />
            <Route component={NotFound} />
          </Switch>
          
          {/* Floating Action Buttons for Quick Access to Chat and Report */}
          {user && (
            <div className="fixed bottom-20 right-4 flex flex-col space-y-3 z-50">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setChatbotOpen(true)}
                title={t.chat}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => setComplaintFormOpen(true)}
                title={t.report}
              >
                <AlertTriangle className="h-5 w-5" />
              </Button>
            </div>
          )}
          
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
        </main>
      </div>
    );
  }

  // Desktop version
  const desktopTranslations = {
    en: {
      chat: 'Chat with AI',
      report: 'Report Issue'
    },
    ta: {
      chat: 'AI உடன் அரட்டை',
      report: 'சிக்கலைப் புகாரளிக்க'
    }
  };
  
  const dt = desktopTranslations[language === 'en' ? 'en' : 'ta'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentUser={user} 
        language={language} 
        onToggleLanguage={handleToggleLanguage}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute 
            path="/farmer" 
            component={() => <FarmerDashboard currentUser={user} language={language} />} 
          />
          <ProtectedRoute 
            path="/owner" 
            component={() => <OwnerDashboard currentUser={user} language={language} />} 
          />
          <Route component={NotFound} />
        </Switch>
        
        {/* Floating Action Buttons for Desktop */}
        {user && (
          <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
            <Button
              variant="outline"
              className="h-12 px-4 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2"
              onClick={() => setChatbotOpen(true)}
              title={dt.chat}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {dt.chat}
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4 rounded-full shadow-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center space-x-2"
              onClick={() => setComplaintFormOpen(true)}
              title={dt.report}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              {dt.report}
            </Button>
          </div>
        )}
        
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
      </main>
      <Footer language={language} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
