import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import FarmerDashboard from "@/pages/farmer-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import i18n from "./lib/i18n";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  const [language, setLanguage] = useState<string>("en");
  const { user, logoutMutation } = useAuth();

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
    if (user?.role === "farmer") {
      return <FarmerDashboard currentUser={user} language={language} />;
    } else {
      return <OwnerDashboard currentUser={user} language={language} />;
    }
  };

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
