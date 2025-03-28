import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import RoleSelector from "@/pages/role-selector";
import FarmerDashboard from "@/pages/farmer-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "./lib/i18n";
import { User } from "./types";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    // For demo purposes, set default mock user. In a real app, this would check a cookie or local storage
    const mockUser: User = {
      id: 1,
      username: "farmer1",
      name: "Ramesh Kumar",
      phone: "+91 9876543210",
      role: "farmer"
    };
    setCurrentUser(mockUser);
  }, []);

  const handleSelectRole = (role: "farmer" | "owner") => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role
      });
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ta" : "en");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={currentUser} language={language} onToggleLanguage={handleToggleLanguage} />
      <main className="flex-grow">
        <Switch>
          <Route path="/">
            {currentUser ? (
              currentUser.role === "farmer" ? (
                <FarmerDashboard currentUser={currentUser} language={language} />
              ) : (
                <OwnerDashboard currentUser={currentUser} language={language} />
              )
            ) : (
              <RoleSelector onSelectRole={handleSelectRole} language={language} />
            )}
          </Route>
          <Route path="/farmer">
            <FarmerDashboard currentUser={currentUser} language={language} />
          </Route>
          <Route path="/owner">
            <OwnerDashboard currentUser={currentUser} language={language} />
          </Route>
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
