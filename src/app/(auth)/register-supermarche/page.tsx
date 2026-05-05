'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterSupermarchePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    supermarketName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Le nom du responsable est requis';
    if (form.name.trim().length < 2)
      return 'Le nom doit contenir au moins 2 caractères';
    if (!form.supermarketName.trim())
      return 'Le nom du supermarché est requis';
    if (form.supermarketName.trim().length < 2)
      return 'Le nom du supermarché doit contenir au moins 2 caractères';
    if (!form.email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Adresse email invalide';
    if (!form.phone.trim()) return 'Le téléphone est requis';
    if (!/^[0-9+.\s-]{8,}$/.test(form.phone))
      return 'Entrez un numéro de téléphone valide';
    if (!form.password) return 'Le mot de passe est requis';
    if (form.password.length < 8)
      return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    if (form.password !== form.confirmPassword)
      return 'Les mots de passe ne correspondent pas';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: 'SUPERMARCHE_ADMIN',
          supermarketName: form.supermarketName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la création du compte');
        return;
      }

      router.push(
        '/login?message=Compte créé ! Connectez-vous pour configurer votre supermarché.'
      );
    } catch {
      toast.error('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto shadow-lg border-border/60">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex items-center justify-center size-14 rounded-full bg-[#1B4332] mb-4">
                <Store className="size-7 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Inscrire mon supermarché
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Créez votre compte gérant pour mettre votre magasin en ligne sur
                FAHAFA Market
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom du responsable */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom du responsable</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jean Konaté"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Nom du supermarché */}
              <div className="space-y-2">
                <Label htmlFor="supermarketName">
                  Nom du supermarché
                </Label>
                <Input
                  id="supermarketName"
                  name="supermarketName"
                  type="text"
                  placeholder="Supermarché Étoile"
                  value={form.supermarketName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email professionnel */}
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="gerant@supermarche.ci"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 caractères"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Au moins 8 caractères avec une majuscule, une minuscule et un
                  chiffre
                </p>
              </div>

              {/* Confirmer le mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ backgroundColor: '#1B4332' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </form>

            {/* Link to login */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="font-medium text-[#1B4332] hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
