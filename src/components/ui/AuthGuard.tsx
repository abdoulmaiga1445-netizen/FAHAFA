'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, allowedRoles, fallback }: AuthGuardProps) {
  const { currentUser, setCurrentView, isAuthenticated } = useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Try to fetch session if no currentUser in store
    const checkSession = async () => {
      if (!currentUser) {
        try {
          const res = await fetch('/api/auth/session');
          const session = await res.json();
          if (session?.user) {
            const { useAppStore: storeHook } = await import('@/lib/store');
            const store = storeHook.getState();
            store.setCurrentUser({
              id: (session.user as { id: string }).id,
              name: session.user.name || 'Utilisateur',
              email: session.user.email || '',
              role: (session.user as { role: string }).role || 'CLIENT',
              supermarcheId: (session.user as { supermarcheId?: string | null }).supermarcheId || null,
            });
          }
        } catch {
          // No session available
        }
      }
      setChecking(false);
    };
    checkSession();
  }, [currentUser]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="size-10 text-sm-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Vérification de l&apos;authentification...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-24 rounded-full bg-sm-light flex items-center justify-center mb-6">
          <ShieldCheck className="size-10 text-sm-accent" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Vous devez être connecté pour accéder à cette page
        </p>
        <Button className="bg-sm-accent hover:bg-sm-accent/90 text-white" onClick={() => setCurrentView('login')}>
          <LogIn className="size-4 mr-2" />
          Se connecter
        </Button>
      </div>
    );
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <ShieldCheck className="size-10 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page
        </p>
        <Button variant="outline" onClick={() => setCurrentView('decouverte')}>
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
