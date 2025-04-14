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
import tractorImg from "./assets/tractor.jpg";
import logoImg from "./assets/logo.png"; // ✅ Imported logo

// ✅ Define supported language type
type Language = "en" | "ta";

function Router() {
  const [language, setLanguage] = useState<Language>("en");
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [complaintFormOpen, setComplaintFormOpen] = useState(false);

  const handleToggleLanguage = () => {
    const newLang: Language = language === "en" ? "ta" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const HomePage = () => {
    if (isMobile) {
      return user?.role === "farmer"
        ? <MobileBrowsePage language={language} />
        : <MobileEquipmentPage language={language} />;
    } else {
      return user?.role === "farmer"
        ? <FarmerDashboard currentUser={user} language={language} />
        : <OwnerDashboard currentUser={user} language={language} />;
    }
  };

  const translations: Record<Language, { chat: string; report: string }> = {
    en: { chat: 'Chat with AI', report: 'Report Issue' },
    ta: { chat: 'AI உடன் அரட்டை', report: 'சிக்கலைப் புகாரளிக்க' }
  };
  const t = translations[language];

  const backgroundStyle = {
    backgroundImage: `url(${tractorImg})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    borderRadius: "12px",
    padding: "1rem"
  };

  // 📱 MOBILE ROUTING
  if (isMobile) {
    return (
      <div className="min-h-screen relative p-4 bg-white">
        {/* Logo at top center */}
        <div className="flex items-center mt-4 ml-6 space-x-3">
          <img src={logoImg} alt="VillageWheels Logo" className="h-12 w-12 object-contain" />
        </div>

        <main className="relative z-10">
          <Switch>
            <Route path="/auth" component={() => (
              <MobileAuthPage language={language} onToggleLanguage={handleToggleLanguage} />
            )} />
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/browse" component={() => <MobileBrowsePage language={language} />} />
            <ProtectedRoute path="/bookings" component={() => <MobileBookingsPage language={language} />} />
            <ProtectedRoute path="/equipment" component={() => <MobileEquipmentPage language={language} />} />
            <ProtectedRoute path="/profile" component={() => (
              <ProfilePage language={language} onToggleLanguage={handleToggleLanguage} />
            )} />
            <Route component={NotFound} />
          </Switch>

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

          <AIChatbot language={language} isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
          <ComplaintForm language={language} isOpen={complaintFormOpen} onClose={() => setComplaintFormOpen(false)} />
        </main>
      </div>
    );
  }

  // 💻 DESKTOP ROUTING
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentUser={user}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onLogout={handleLogout}
      />

      {/* Logo inline before main */}
      <div className="flex justify-center mt-4">
        <img src={logoImg} alt="VillageWheels Logo" className="h-20 object-contain" />
      </div>

      <main className="flex-grow relative z-10 p-4">
        <div style={backgroundStyle}>
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/" component={HomePage} />
            <ProtectedRoute path="/farmer" component={() => (
              <FarmerDashboard currentUser={user} language={language} />
            )} />
            <ProtectedRoute path="/owner" component={() => (
              <OwnerDashboard currentUser={user} language={language} />
            )} />
            <Route component={NotFound} />
          </Switch>
        </div>

        {user && (
          <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
            <Button
              variant="outline"
              className="h-12 px-4 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2"
              onClick={() => setChatbotOpen(true)}
              title={t.chat}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {t.chat}
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4 rounded-full shadow-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center space-x-2"
              onClick={() => setComplaintFormOpen(true)}
              title={t.report}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t.report}
            </Button>
          </div>
        )}

        <AIChatbot language={language} isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
        <ComplaintForm language={language} isOpen={complaintFormOpen} onClose={() => setComplaintFormOpen(false)} />
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
