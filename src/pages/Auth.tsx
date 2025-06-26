import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
                  <p className="text-xs text-gray-600 mb-2">Click any user below to auto-fill credentials:</p>
                  <div className="space-y-1">
                    <div 
                      className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                      onClick={() => handleQuickLogin('admin@admin.com', 'adminadmin')}
                    >
                      <span className="font-semibold text-blue-700">{t('auth:admin')}:</span> admin@admin.com / adminadmin
                    </div>
                    
                    <div 
                      className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                      onClick={() => handleQuickLogin('medalia@protonmail.ch', 'dalidali')}
                    >
                      <span className="font-semibold text-blue-700">{t('auth:user')}:</span> medalia@protonmail.ch / dalidali
                    </div>
                    
                    <div className="text-sm text-blue-700 font-semibold">2 {t('auth:salesDirectors')}:</div>
                    <div 
                      className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors ml-2"
                      onClick={() => handleQuickLogin('director1@sales.com', '123456')}
                    >
                      director1@sales.com / 123456
                    </div>
                    <div 
                      className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors ml-2"
                      onClick={() => handleQuickLogin('director2@sales.com', '123456')}
                    >
                      director2@sales.com / 123456
                    </div>
                    
                    <div className="text-sm text-blue-700 font-semibold">4 {t('auth:supervisors')}:</div>
                    {[1, 2, 3, 4].map(num => (
                      <div 
                        key={num}
                        className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors ml-2"
                        onClick={() => handleQuickLogin(`supervisor${num}@sup.com`, '123456')}
                      >
                        supervisor{num}@sup.com / 123456
                      </div>
                    ))}
                    
                    <div className="text-sm text-blue-700 font-semibold">10 {t('auth:delegates')}:</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <div 
                        key={num}
                        className="text-sm cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors ml-2"
                        onClick={() => handleQuickLogin(`delegate${num}@dlg.com`, '123456')}
                      >
                        delegate{num}@dlg.com / 123456
                      </div>
                    ))}
                  </div>
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
