import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Globe, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileAuthPageProps {
  language: string;
  onToggleLanguage: () => void;
}

export default function MobileAuthPage({ language, onToggleLanguage }: MobileAuthPageProps) {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Translations
  const translations = {
    en: {
      welcomeBack: 'Welcome Back',
      loginDescription: 'Enter your credentials to access your account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      loggingIn: 'Logging in...',
      register: 'Register',
      registering: 'Registering...',
      createAccount: 'Create Account',
      registerDescription: 'Fill in your details to create an account',
      name: 'Full Name',
      phone: 'Phone Number',
      selectRole: 'Select Role',
      farmerRole: 'I am a Farmer (looking for equipment)',
      ownerRole: 'I am an Owner (offering equipment)',
      alreadyAccount: 'Already have an account?',
      noAccount: 'Don\'t have an account?',
      switchToTamil: 'Switch to Tamil',
      switchToEnglish: 'Switch to English'
    },
    ta: {
      welcomeBack: 'மீண்டும் வருக',
      loginDescription: 'உங்கள் கணக்கை அணுக உங்கள் சான்றுகளை உள்ளிடவும்',
      username: 'பயனர்பெயர்',
      password: 'கடவுச்சொல்',
      login: 'உள்நுழை',
      loggingIn: 'உள்நுழைகிறது...',
      register: 'பதிவு செய்',
      registering: 'பதிவு செய்கிறது...',
      createAccount: 'கணக்கை உருவாக்கு',
      registerDescription: 'கணக்கை உருவாக்க உங்கள் விவரங்களை நிரப்பவும்',
      name: 'முழு பெயர்',
      phone: 'தொலைபேசி எண்',
      selectRole: 'பங்கைத் தேர்ந்தெடுக்கவும்',
      farmerRole: 'நான் ஒரு விவசாயி (உபகரணங்களைத் தேடுகிறேன்)',
      ownerRole: 'நான் ஒரு உரிமையாளர் (உபகரணங்களை வழங்குகிறேன்)',
      alreadyAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      noAccount: 'கணக்கு இல்லையா?',
      switchToTamil: 'தமிழுக்கு மாறவும்',
      switchToEnglish: 'ஆங்கிலத்திற்கு மாறவும்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(1, {
      message: language === 'en' ? 'Username is required' : 'பயனர்பெயர் தேவை',
    }),
    password: z.string().min(1, {
      message: language === 'en' ? 'Password is required' : 'கடவுச்சொல் தேவை',
    }),
  });
  
  // Register form schema
  const registerSchema = z.object({
    username: z.string().min(3, {
      message: language === 'en' 
        ? 'Username must be at least 3 characters'
        : 'பயனர்பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்',
    }),
    password: z.string().min(6, {
      message: language === 'en'
        ? 'Password must be at least 6 characters'
        : 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
    }),
    name: z.string().min(2, {
      message: language === 'en'
        ? 'Name must be at least 2 characters'
        : 'பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்',
    }),
    phone: z.string().min(10, {
      message: language === 'en'
        ? 'Please enter a valid phone number'
        : 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
    }),
    role: z.enum(['farmer', 'owner'], {
      required_error: language === 'en'
        ? 'Please select a role'
        : 'தயவுசெய்து ஒரு பங்கைத் தேர்ந்தெடுக்கவும்',
    }),
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      phone: '',
      role: 'farmer',
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Village Wheels</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLanguage}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Village Wheels</h1>
            <p className="text-muted-foreground mt-2">
              {language === 'en' 
                ? 'Connect farmers with equipment owners'
                : 'விவசாயிகளை உபகரண உரிமையாளர்களுடன் இணைக்கவும்'}
            </p>
          </div>
          
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.login}</TabsTrigger>
              <TabsTrigger value="register">{t.register}</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.welcomeBack}</CardTitle>
                  <CardDescription>{t.loginDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.username}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.username} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.password}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder={t.password} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mobile-button" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.loggingIn}
                          </div>
                        ) : (
                          t.login
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Separator />
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => setActiveTab('register')}
                  >
                    {t.noAccount} {t.register}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.createAccount}</CardTitle>
                  <CardDescription>{t.registerDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.username}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.username} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.password}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder={t.password} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.name}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.name} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.phone}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.phone} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">{t.selectRole}</h4>
                        <div className="space-y-2">
                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-2">
                                  <Button
                                    type="button"
                                    variant={field.value === 'farmer' ? 'default' : 'outline'}
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => registerForm.setValue('role', 'farmer')}
                                  >
                                    <div>
                                      <div className="font-medium">{t.farmerRole}</div>
                                    </div>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={field.value === 'owner' ? 'default' : 'outline'}
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => registerForm.setValue('role', 'owner')}
                                  >
                                    <div>
                                      <div className="font-medium">{t.ownerRole}</div>
                                    </div>
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full mobile-button" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.registering}
                          </div>
                        ) : (
                          t.register
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Separator />
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={() => setActiveTab('login')}
                  >
                    {t.alreadyAccount} {t.login}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}