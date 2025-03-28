import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import i18n from "@/lib/i18n";

export default function AuthPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "owner">("farmer");
  const [language, setLanguage] = useState<string>(i18n.language || "en");
  
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();
  
  const handleToggleLanguage = () => {
    const newLanguage = language === "en" ? "ta" : "en";
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };
  
  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username, password, name, phone, role });
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Left side form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">{t('auth.title')}</h1>
              <p className="text-gray-600">{t('auth.subtitle')}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleLanguage}
              className="text-gray-600 text-sm font-medium px-2 py-1 rounded border border-gray-300"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </Button>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>{t('auth.loginTitle')}</CardTitle>
                    <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('auth.username')}</Label>
                      <Input 
                        id="username" 
                        placeholder={t('auth.usernamePlaceholder')} 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.loggingIn')}</>
                      ) : (
                        t('auth.loginButton')
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <span>{t('auth.noAccount')} </span>
                <button 
                  className="text-primary font-medium hover:underline" 
                  onClick={() => setActiveTab("register")}
                >
                  {t('auth.createAccount')}
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle>{t('auth.registerTitle')}</CardTitle>
                    <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">{t('auth.username')}</Label>
                      <Input 
                        id="reg-username" 
                        placeholder={t('auth.usernamePlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">{t('auth.password')}</Label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('auth.name')}</Label>
                      <Input 
                        id="name" 
                        placeholder={t('auth.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')}</Label>
                      <Input 
                        id="phone" 
                        placeholder={t('auth.phonePlaceholder')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">{t('auth.role')}</Label>
                      <Select 
                        value={role} 
                        onValueChange={(value) => setRole(value as "farmer" | "owner")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('auth.selectRole')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer">{t('auth.farmer')}</SelectItem>
                          <SelectItem value="owner">{t('auth.owner')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.registering')}</>
                      ) : (
                        t('auth.registerButton')
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <span>{t('auth.haveAccount')} </span>
                <button 
                  className="text-primary font-medium hover:underline" 
                  onClick={() => setActiveTab("login")}
                >
                  {t('auth.loginNow')}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side hero */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-4">{t('auth.welcomeTitle')}</h2>
          <p className="text-lg mb-6">{t('auth.welcomeMessage')}</p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">{t('auth.feature1Title')}</h3>
                <p className="mt-1">{t('auth.feature1Desc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">{t('auth.feature2Title')}</h3>
                <p className="mt-1">{t('auth.feature2Desc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">{t('auth.feature3Title')}</h3>
                <p className="mt-1">{t('auth.feature3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}