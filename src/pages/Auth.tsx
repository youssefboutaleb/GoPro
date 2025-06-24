
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Auth = () => {
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
      toast.success("Connexion réussie!");
      
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
      toast.success("Inscription réussie!");
      
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
        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
                <div className="mt-4">
                  <p className="text-sm text-blue-700">
                    <strong>Admin :</strong> admin@admin.com / adminadmin <br />
                    <strong>Utilisateur:</strong> medalia@protonmail.ch / dalidali <br />
                    <strong>2 Sales Directors:</strong> director1@sales.com, director2@sales.com / 123456 <br />
                    <strong>4 Supervisors:</strong> supervisor1@sup.com, ... , supervisor4@sup.com / 123456 <br />
                    <strong>10 Delegates:</strong> delegate1@dlg.com, ..., delegate10@dlg.com / 123456
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Prénom</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Nom</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
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
                    {loading ? 'Inscription...' : "S'inscrire"}
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
