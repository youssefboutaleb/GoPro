import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import goproLogo from '@/assets/gopro-logo.png';

const Auth = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page - user state changed:', { 
      userId: user?.id, 
      sessionExists: !!session,
      timestamp: new Date().toISOString()
    });
    
    if (user && session) {
      console.log('User authenticated, redirecting to index from Auth page');
      navigate('/', { replace: true });
    }
  }, [user, session, navigate]);

  const handleQuickLogin = (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    toast.success('Credentials filled automatically');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting sign in from Auth page');

    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Sign in failed:', error);
      toast.error(error.message);
    } else {
      console.log('Sign in successful from Auth page');
      toast.success(t('auth:signInSuccess'));
      
      // Fallback redirect - give AuthContext time to update, then force redirect
      setTimeout(() => {
        console.log('Fallback redirect after successful sign in');
        navigate('/', { replace: true });
      }, 1000);
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting sign up from Auth page');

    const { error } = await signUp(email, password, firstName, lastName);
    
    if (error) {
      console.error('Sign up failed:', error);
      toast.error(error.message);
    } else {
      console.log('Sign up successful from Auth page');
      toast.success(t('auth:signUpSuccess'));
      
      // Fallback redirect for sign up as well
      setTimeout(() => {
        console.log('Fallback redirect after successful sign up');
        navigate('/', { replace: true });
      }, 1000);
    }
    setLoading(false);
  };

  // Don't render the auth form if user is already authenticated
  if (user && session) {
    console.log('Auth page - user already authenticated, should redirect');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* GOPRO Branding */}
        <div className="mb-8 text-center space-y-2">
          <img 
            src={goproLogo} 
            alt="GOPRO Logo" 
            className="h-16 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            GOPRO
          </h1>
          <p className="text-sm font-semibold text-gray-700">
            Global Operational Performance Reporting & Optimization
          </p>
          <p className="text-xs italic text-gray-600 mt-1">
            Go in the field, perform like a pro.
          </p>
        </div>

        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('auth:authentication')}</CardTitle>
            <CardDescription>
              {t('auth:signInOrCreateAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth:signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth:signUp')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth:email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth:password')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth:signingIn') : t('auth:signIn')}
                  </Button>
                </form>
                
                <div className="mt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Quick Login (Test Users) <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border shadow-lg z-50 max-h-80 overflow-y-auto">
                      <div className="p-1">
                        <DropdownMenuLabel className="text-blue-700 font-semibold">
                          {t('auth:admin')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleQuickLogin('admin@admin.com', 'adminadmin')}
                          className="cursor-pointer"
                        >
                          Admin User
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel className="text-blue-700 font-semibold">
                          Regular {t('auth:user')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleQuickLogin('medalia@protonmail.ch', 'dalidali')}
                          className="cursor-pointer"
                        >
                          Test User
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel className="text-blue-700 font-semibold">
                          {t('auth:salesDirectors')}
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleQuickLogin('director1@sales.com', '123456')}
                          className="cursor-pointer"
                        >
                          Director 1
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleQuickLogin('director2@sales.com', '123456')}
                          className="cursor-pointer"
                        >
                          Director 2
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel className="text-blue-700 font-semibold">
                          {t('auth:supervisors')}
                        </DropdownMenuLabel>
                        {[1, 2, 3, 4].map(num => (
                          <DropdownMenuItem 
                            key={num}
                            onClick={() => handleQuickLogin(`supervisor${num}@sup.com`, '123456')}
                            className="cursor-pointer"
                          >
                            Supervisor {num}
                          </DropdownMenuItem>
                        ))}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel className="text-blue-700 font-semibold">
                          {t('auth:delegates')}
                        </DropdownMenuLabel>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <DropdownMenuItem 
                            key={num}
                            onClick={() => handleQuickLogin(`delegate${num}@dlg.com`, '123456')}
                            className="cursor-pointer"
                          >
                            Delegate {num}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">{t('auth:firstName')}</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">{t('auth:lastName')}</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth:email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth:password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth:signingUp') : t('auth:signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
