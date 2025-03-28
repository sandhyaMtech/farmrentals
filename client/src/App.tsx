import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import RoleSelector from "@/pages/role-selector";
import FarmerDashboard from "@/pages/farmer-dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import Login from "@/pages/login";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "./lib/i18n";
import { User } from "./types";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [location, setLocation] = useLocation();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect based on user role
    if (user.role === "farmer") {
      setLocation("/farmer");
    } else {
      setLocation("/owner");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocation("/login");
  };

  const handleSelectRole = (role: "farmer" | "owner") => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        role
      };
      setCurrentUser(updatedUser);
      
      // Redirect to appropriate dashboard
      setLocation(role === "farmer" ? "/farmer" : "/owner");
    } else {
      // If not logged in, redirect to login page
      setLocation("/login");
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ta" : "en");
  };

  // Redirect to login page if not logged in (except for role selector)
  useEffect(() => {
    if (!currentUser && location !== "/role-selector" && location !== "/login") {
      setLocation("/login");
    }
  }, [currentUser, location, setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentUser={currentUser} 
        language={language} 
        onToggleLanguage={handleToggleLanguage}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Switch>
          <Route path="/login">
            <Login onLogin={handleLogin} language={language} />
          </Route>
          <Route path="/role-selector">
            <RoleSelector onSelectRole={handleSelectRole} language={language} />
          </Route>
          <Route path="/farmer">
            {currentUser ? 
              <FarmerDashboard currentUser={currentUser} language={language} /> : 
              <Login onLogin={handleLogin} language={language} />
            }
          </Route>
          <Route path="/owner">
            {currentUser ? 
              <OwnerDashboard currentUser={currentUser} language={language} /> : 
              <Login onLogin={handleLogin} language={language} />
            }
          </Route>
          <Route path="/">
            {currentUser ? (
              currentUser.role === "farmer" ? (
                <FarmerDashboard currentUser={currentUser} language={language} />
              ) : (
                <OwnerDashboard currentUser={currentUser} language={language} />
              )
            ) : (
              <Login onLogin={handleLogin} language={language} />
            )}
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
