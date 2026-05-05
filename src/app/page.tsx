'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ShoppingCart,
  Smartphone,
  Check,
  Store,
  ArrowRight,
  MapPin,
  Truck,
  Apple,
  Beef,
  Wheat,
  CupSoda,
  MilkOff,
  Sparkles,
  Baby,
  Tag,
  Zap,
  SmartphoneNfc,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  CreditCard,
  Users,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Supermarket {
  id: string;
  name: string;
  slug: string;
  commune: string;
  isOpen: boolean;
  productCount: number;
  logo: string | null;
  distance?: number | null;
}

// ─── Scroll Animation Hook ──────────────────────────────────────────────────────

function useScrollAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// ─── Format helpers ─────────────────────────────────────────────────────────────

const formatDistance = (km?: number | null) => {
  if (km === undefined || km === null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

// ─── Static Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Fruits & Legumes', icon: Apple, iconColor: '#2D6A4F', desc: 'Frais du marche', bg: '#E8F5E9', emoji: '🍎' },
  { name: 'Viandes & Poissons', icon: Beef, iconColor: '#C2410C', desc: 'Qualite garantie', bg: '#FFF3E0', emoji: '🥩' },
  { name: 'Epicerie seche', icon: Wheat, iconColor: '#7C3AED', desc: 'Riz, pates, farine', bg: '#F3E5F5', emoji: '🌾' },
  { name: 'Boissons', icon: CupSoda, iconColor: '#2563EB', desc: 'Jus, eau, sodas', bg: '#E3F2FD', emoji: '🧃' },
  { name: 'Laiterie', icon: MilkOff, iconColor: '#D97706', desc: 'Lait, yaourt, fromage', bg: '#FFF8E1', emoji: '🥛' },
  { name: 'Hygiene', icon: Sparkles, iconColor: '#4F46E5', desc: 'Soins & beaute', bg: '#E8EAF6', emoji: '🧴' },
  { name: 'Bebe & Enfants', icon: Baby, iconColor: '#DB2777', desc: 'Couches, lait bebe', bg: '#FCE4EC', emoji: '🍼' },
  { name: 'Promotions', icon: Tag, iconColor: '#DC2626', desc: "Jusqu'a -50%", bg: '#FFEBEE', emoji: '🏷️' },
];

const STEPS = [
  {
    number: 1,
    numberColor: '#1B4332',
    circleBg: '#E8F5E9',
    icon: Search,
    title: 'Cherchez vos produits',
    text: 'Recherchez par nom, categorie ou laissez-vous guider',
    image: null,
  },
  {
    number: 2,
    numberColor: '#F4A226',
    circleBg: '#FFF3E0',
    icon: ShoppingCart,
    title: 'Choisissez votre supermarche',
    text: 'Comparez prix et delais de livraison',
    image: null,
  },
  {
    number: 3,
    numberColor: '#7C3AED',
    circleBg: '#F3E5F5',
    icon: Smartphone,
    title: 'Payez facilement',
    text: 'Orange Money, Wave, MTN Money ou cash',
    image: null,
  },
  {
    number: 4,
    numberColor: '#2563EB',
    circleBg: '#E3F2FD',
    icon: PackageCheck,
    title: 'Recevez chez vous',
    text: 'Livraison en 45 min ou retrait en magasin',
    image: '/images/livreur.png' as const,
  },
];

// ─── Main Page Component ────────────────────────────────────────────────────────

export default function HomePage() {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const supermarketScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSupermarkets() {
      try {
        const res = await fetch('/api/supermarkets');
        if (res.ok) {
          const data = await res.json();
          setSupermarkets((data.supermarkets || []).slice(0, 6));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSupermarkets();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="dark" />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 1: HERO
        ═══════════════════════════════════════════════════════════════════════ */}
        <section className="relative bg-[#1B4332] overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#2D6A4F]/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#40916C]/20 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-[#52B788]/10 blur-2xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
            {/* Mobile Layout */}
            <div className="lg:hidden pt-10 pb-14">
              {/* Image A - Panier */}
              <div
                className="animate-fade-in-down flex justify-center mb-8"
                style={{ animationDelay: '0s', animationFillMode: 'both' }}
              >
                <Image
                  src="/images/panier.png"
                  alt="Panier de courses rempli de legumes et fruits frais"
                  width={360}
                  height={280}
                  className="w-full max-w-[340px] max-h-[280px] object-contain"
                  priority
                />
              </div>

              {/* Badge */}
              <div
                className="animate-fade-in-up flex justify-center mb-6"
                style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
              >
                <span className="inline-flex items-center gap-2 bg-[#F4A226] text-white text-xs font-semibold px-5 py-2 rounded-[50px] shadow-lg shadow-[#F4A226]/25">
                  <Truck className="size-4" />
                  Livraison rapide a Abidjan
                </span>
              </div>

              {/* Title */}
              <h1
                className="animate-fade-in-up text-white font-extrabold text-[30px] leading-[1.2] text-center px-4 mb-5"
                style={{ animationDelay: '0.25s', animationFillMode: 'both' }}
              >
                Vos supermarches d&apos;Abidjan, a portee de main
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-in-up text-center text-[16px] leading-relaxed px-6 mb-8"
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  animationDelay: '0.38s',
                  animationFillMode: 'both',
                }}
              >
                Commandez, comparez les prix et faites livrer chez vous en moins d&apos;une heure.
              </p>

              {/* Search Bar */}
              <div
                className="animate-fade-in-up mb-8"
                style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
              >
                <div className="flex items-center bg-white rounded-[60px] shadow-xl shadow-black/10 mx-2" style={{ padding: '14px 18px' }}>
                  <Search className="size-5 text-gray-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Riz, huile, lait..."
                    className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
                  />
                  <button
                    type="button"
                    className="flex-shrink-0 bg-[#F4A226] text-white font-semibold text-sm px-5 py-2.5 rounded-[50px] hover:bg-[#e09520] transition-colors shadow-md shadow-[#F4A226]/25"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Buttons - Stacked */}
              <div
                className="animate-fade-in-up flex flex-col gap-4 mx-2 mb-8"
                style={{ animationDelay: '0.62s', animationFillMode: 'both' }}
              >
                <Link href="/decouverte" className="w-full">
                  <Button
                    size="lg"
                    className="bg-white text-[#1B4332] hover:bg-white/90 font-semibold rounded-[50px] w-full py-4 text-base shadow-lg shadow-black/10"
                  >
                    <Store className="size-5 mr-2" />
                    Decouvrir les supermarches
                  </Button>
                </Link>
                <Link href="/register-supermarche" className="w-full">
                  <Button
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white/15 font-semibold rounded-[50px] w-full py-4 text-base"
                  >
                    Inscrire mon supermarche
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div
                className="animate-fade-in-up mx-2"
                style={{ animationDelay: '0.75s', animationFillMode: 'both' }}
              >
                <div
                  className="flex items-center justify-around rounded-2xl px-6 py-5"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Store className="size-5 text-[#52B788]" />
                    <span className="text-white text-sm font-bold">50+</span>
                    <span className="text-white/60 text-[11px]">supermarches</span>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <div className="flex flex-col items-center gap-1.5">
                    <Zap className="size-5 text-[#F4A226]" />
                    <span className="text-white text-sm font-bold">45 min</span>
                    <span className="text-white/60 text-[11px]">livraison</span>
                  </div>
                  <div className="w-px h-10 bg-white/15" />
                  <div className="flex flex-col items-center gap-1.5">
                    <SmartphoneNfc className="size-5 text-[#93C5FD]" />
                    <span className="text-white text-sm font-bold">3 modes</span>
                    <span className="text-white/60 text-[11px]">de paiement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout — 2 columns */}
            <div className="hidden lg:flex lg:items-center lg:gap-16 lg:py-24 xl:py-28">
              {/* Left Column (55%) */}
              <div className="flex-1 lg:max-w-[55%]">
                {/* Badge */}
                <div
                  className="animate-fade-in-up mb-7"
                  style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
                >
                  <span className="inline-flex items-center gap-2 bg-[#F4A226] text-white text-sm font-semibold px-5 py-2 rounded-[50px] shadow-lg shadow-[#F4A226]/25">
                    <Truck className="size-4" />
                    Livraison rapide a Abidjan
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="animate-fade-in-up text-white font-extrabold leading-[1.1] mb-6"
                  style={{
                    fontSize: 'clamp(2.4rem, 4vw, 3.8rem)',
                    animationDelay: '0.25s',
                    animationFillMode: 'both',
                    textAlign: 'left',
                  }}
                >
                  Vos supermarches d&apos;Abidjan, a portee de main
                </h1>

                {/* Subtitle */}
                <p
                  className="animate-fade-in-up text-lg leading-relaxed mb-10"
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    animationDelay: '0.38s',
                    animationFillMode: 'both',
                    textAlign: 'left',
                    maxWidth: '480px',
                  }}
                >
                  Commandez, comparez les prix et faites livrer chez vous en moins d&apos;une heure.
                </p>

                {/* Search Bar */}
                <div
                  className="animate-fade-in-up mb-10"
                  style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
                >
                  <div
                    className="flex items-center bg-white rounded-[60px] max-w-[540px] shadow-2xl shadow-black/15"
                    style={{
                      padding: '10px 10px 10px 24px',
                    }}
                  >
                    <Search className="size-5 text-gray-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      placeholder="Que cherchez-vous ? Riz, huile, lait..."
                      className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
                    />
                    <button
                      type="button"
                      className="flex-shrink-0 bg-[#F4A226] text-white font-semibold text-sm px-6 py-3 rounded-[50px] hover:bg-[#e09520] transition-colors shadow-md shadow-[#F4A226]/25"
                    >
                      Rechercher
                    </button>
                  </div>
                </div>

                {/* Buttons — side by side */}
                <div
                  className="animate-fade-in-up flex flex-wrap gap-4 mb-12"
                  style={{ animationDelay: '0.62s', animationFillMode: 'both' }}
                >
                  <Link href="/decouverte">
                    <Button
                      size="lg"
                      className="bg-white text-[#1B4332] hover:bg-white/90 font-semibold rounded-[50px] px-7 py-6 text-base shadow-lg shadow-black/10"
                    >
                      <Store className="size-5 mr-2" />
                      Decouvrir les supermarches
                    </Button>
                  </Link>
                  <Link href="/register-supermarche">
                    <Button
                      size="lg"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/15 font-semibold rounded-[50px] px-7 py-6 text-base"
                    >
                      Inscrire mon supermarche
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Stats Bar */}
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.75s', animationFillMode: 'both' }}
                >
                  <div
                    className="inline-flex items-center gap-8 rounded-2xl px-8 py-5 max-w-[540px]"
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="size-4 text-[#52B788]" />
                      <span className="text-white text-sm font-medium">50+ supermarches</span>
                    </div>
                    <div className="w-px h-6 bg-white/15" />
                    <div className="flex items-center gap-2.5">
                      <Zap className="size-4 text-[#F4A226]" />
                      <span className="text-white text-sm font-medium">Livraison en 45 min</span>
                    </div>
                    <div className="w-px h-6 bg-white/15" />
                    <div className="flex items-center gap-2.5">
                      <SmartphoneNfc className="size-4 text-[#93C5FD]" />
                      <span className="text-white text-sm font-medium">Orange Money &middot; Wave &middot; MTN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (45%) — Image A with float */}
              <div className="flex-1 lg:max-w-[45%] flex justify-center lg:justify-end">
                <div
                  className="animate-fade-in-down"
                  style={{ animationDelay: '0s', animationFillMode: 'both' }}
                >
                  <Image
                    src="/images/panier.png"
                    alt="Panier de courses rempli de legumes et fruits frais"
                    width={520}
                    height={560}
                    className="w-full max-w-[520px] max-h-[560px] object-contain animate-float"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wave divider at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 2: CATEGORIES POPULAIRES
        ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 bg-white relative">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#D8F3DC]/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#FFF3E0]/40 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {/* Header */}
            <CategorySectionHeader />

            {/* Grid — horizontal scroll on mobile, grid on larger screens */}
            <div className="flex lg:grid lg:grid-cols-4 xl:grid-cols-8 gap-5 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
              {CATEGORIES.map((cat, idx) => (
                <CategoryCard key={cat.name} category={cat} delay={idx * 60} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 3: SUPERMARCHES PARTENAIRES
        ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 bg-[#F6FBF4] relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-[#2D6A4F]/5 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {/* Header */}
            <div className="text-center mb-14">
              <Badge className="bg-[#D1FAE5] text-[#065F46] hover:bg-[#D1FAE5] mb-4 px-4 py-1.5 text-xs font-semibold rounded-full">
                Partenaires verifies
              </Badge>
              <h2 className="text-[2.2rem] lg:text-[2.6rem] font-bold text-[#1B4332] leading-tight">
                Les supermarches pres de chez vous
              </h2>
              <p className="mt-3 text-[#374151] text-base lg:text-lg">
                Cocody &middot; Plateau &middot; Marcory &middot; Yopougon &middot; Adjame &middot; Abobo
              </p>
            </div>

            {/* Supermarket Horizontal Carousel */}
            <div className="relative">
              {/* Left Arrow */}
              <button
                type="button"
                onClick={() => {
                  supermarketScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-[#E5E7EB] text-[#1B4332] hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] transition-all -translate-x-1"
                aria-label="Precedent"
              >
                <ChevronLeft className="size-5" />
              </button>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={() => {
                  supermarketScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-[#E5E7EB] text-[#1B4332] hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] transition-all translate-x-1"
                aria-label="Suivant"
              >
                <ChevronRight className="size-5" />
              </button>

              {loading ? (
                <div className="flex gap-6 overflow-hidden px-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[280px]">
                      <SupermarketSkeleton />
                    </div>
                  ))}
                </div>
              ) : supermarkets.length > 0 ? (
                <div
                  ref={supermarketScrollRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6"
                >
                  {supermarkets.map((sm) => (
                    <div key={sm.id} className="shrink-0 w-[280px] snap-start">
                      <SupermarketCard supermarket={sm} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#374151] text-sm py-12">
                  Aucun supermarche disponible pour le moment.
                </p>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 text-center">
              <Link href="/decouverte">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white font-semibold rounded-[50px] px-8 py-6 text-base"
                >
                  Voir tous les supermarches (50+)
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 4: COMMENT CA MARCHE
        ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-1/4 right-0 w-56 h-56 rounded-full bg-[#F3E5F5]/30 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            {/* Header */}
            <div className="text-center mb-16">
              <Badge className="bg-[#E3F2FD] text-[#2563EB] hover:bg-[#E3F2FD] mb-4 px-4 py-1.5 text-xs font-semibold rounded-full">
                Comment ca marche
              </Badge>
              <h2 className="text-[2.2rem] lg:text-[2.6rem] font-bold text-[#1B4332]">Simple comme bonjour</h2>
              <p className="mt-3 text-[#374151] text-base lg:text-lg">
                Faites vos courses en 4 etapes
              </p>
            </div>

            {/* Steps Grid */}
            <div className="relative">
              {/* Desktop: 4 columns with connecting line */}
              <div className="hidden lg:grid lg:grid-cols-4 relative gap-8">
                {/* Horizontal connecting line */}
                <div className="absolute top-[52px] left-[12.5%] right-[12.5%] border-t-2 border-dashed border-[#D1FAE5] z-0" />

                {STEPS.map((step, idx) => (
                  <StepCard key={idx} step={step} delay={idx * 100} />
                ))}
              </div>

              {/* Tablet: 2 columns */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:hidden gap-10">
                {STEPS.map((step, idx) => (
                  <StepCard key={idx} step={step} delay={idx * 100} />
                ))}
              </div>

              {/* Mobile: vertical */}
              <div className="sm:hidden flex flex-col gap-8">
                {STEPS.map((step, idx) => (
                  <StepCard key={idx} step={step} delay={idx * 100} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 5: BANNIERE B2B
        ═══════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <div
              className="rounded-[2rem] overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
                padding: '56px 0',
              }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

              <div className="relative mx-auto px-8 sm:px-12 lg:px-16">
                <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
                  {/* Left Column */}
                  <div className="flex-1 max-w-[55%] max-lg:max-w-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-6">
                      <Store className="size-7 text-white" />
                    </div>

                    <h2 className="text-[2.2rem] lg:text-[2.6rem] font-bold text-white leading-tight">
                      Vous etes proprietaire d&apos;un supermarche ?
                    </h2>

                    <p className="mt-4 text-base lg:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Rejoignez FAHAFA Market et touchez des milliers de clients a Abidjan. Tableau de bord, stock, statistiques, tout inclus.
                    </p>

                    <div className="mt-8 space-y-4">
                      <B2BCheckItem text="Tableau de bord en temps reel" />
                      <B2BCheckItem text="Gestion du stock simplifiee" />
                      <B2BCheckItem text="Statistiques et analytics" />
                      <B2BCheckItem text="Premiere inscription gratuite" />
                    </div>

                    <div className="mt-10">
                      <Link href="/register-supermarche">
                        <Button
                          size="lg"
                          className="bg-[#F4A226] text-white hover:bg-[#e09520] font-semibold rounded-[50px] px-8 py-6 text-base shadow-lg shadow-[#F4A226]/30"
                        >
                          Inscrire mon supermarche gratuitement
                          <ArrowRight className="size-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column — Livreur Image + Stats */}
                  <div className="flex-1 max-w-[45%] max-lg:max-w-full w-full flex flex-col items-center gap-8">
                    {/* IMAGE B - Livreur */}
                    <Image
                      src="/images/livreur.png"
                      alt="Livreur FAHAFA a scooter"
                      width={320}
                      height={260}
                      className="max-w-[320px] object-contain"
                    />

                    <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
                      <B2BStatCard value="50+" label="Supermarches" />
                      <B2BStatCard value="10k+" label="Clients actifs" />
                      <B2BStatCard value="45 min" label="Livraison moy." />
                      <B2BStatCard value="98%" label="Satisfaction" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function CategorySectionHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
      <div>
        <Badge className="bg-[#D1FAE5] text-[#065F46] hover:bg-[#D1FAE5] mb-4 px-4 py-1.5 text-xs font-semibold rounded-full">
          Categories
        </Badge>
        <h2 className="text-[2.2rem] lg:text-[2.6rem] font-bold text-[#1B4332] leading-tight">
          Nos categories populaires
        </h2>
        <p className="mt-2 text-[#374151] text-base lg:text-lg">
          Des milliers de produits disponibles pres de chez vous
        </p>
      </div>
      <Link
        href="/decouverte"
        className="text-[#40916C] font-semibold text-sm hover:underline shrink-0 flex items-center gap-1"
      >
        Voir tout
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}

function CategoryCard({
  category,
  delay,
}: {
  category: (typeof CATEGORIES)[number];
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`scroll-reveal snap-start shrink-0 w-[140px] lg:w-auto ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="category-card rounded-2xl p-6 lg:p-7 text-center cursor-pointer h-full"
        style={{ background: category.bg }}
      >
        <div className="flex items-center justify-center mb-4">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <category.icon className="size-8" style={{ color: category.iconColor }} />
          </div>
        </div>
        <h3 className="font-semibold text-sm text-[#1B4332]">{category.name}</h3>
        <p className="text-xs text-[#6B7280] mt-1.5">{category.desc}</p>
      </div>
    </div>
  );
}

function SupermarketCard({ supermarket }: { supermarket: Supermarket }) {
  const dist = formatDistance(supermarket.distance);

  return (
    <Link href={`/supermarche/${supermarket.slug}`} className="group">
      <Card className="supermarket-card overflow-hidden border border-[#E5E7EB] rounded-2xl h-full">
        {/* Banner */}
        <div className="relative h-[140px] bg-gradient-to-br from-[#1B4332] to-[#40916C]">
          {/* Open/Closed Badge */}
          <Badge
            className={`absolute top-4 right-4 text-[10px] px-3 py-1 font-semibold rounded-full ${
              supermarket.isOpen
                ? 'bg-[#D1FAE5] text-[#065F46] hover:bg-[#D1FAE5]'
                : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2]'
            }`}
          >
            {supermarket.isOpen ? 'OUVERT' : 'FERME'}
          </Badge>
        </div>

        {/* Logo — overlapping the banner */}
        <div className="relative flex justify-center" style={{ marginTop: '-24px' }}>
          <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-white">
            {supermarket.logo ? (
              <img
                src={supermarket.logo}
                alt={supermarket.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-[#1B4332]">
                {supermarket.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-6 pt-3 flex flex-col gap-2.5">
          {/* Name */}
          <h3 className="font-semibold text-base text-[#1B4332] text-center">
            {supermarket.name}
          </h3>

          {/* Commune + Distance */}
          <div className="flex items-center justify-center gap-2 text-sm text-[#374151]">
            <MapPin className="size-3.5 flex-shrink-0" />
            <span>{supermarket.commune}</span>
            {dist && (
              <>
                <span className="text-gray-300">|</span>
                <span>{dist}</span>
              </>
            )}
          </div>

          {/* Product count */}
          <p className="text-xs text-center text-[#6B7280]">
            {supermarket.productCount} produits
          </p>

          {/* CTA */}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white rounded-full text-xs font-medium group-hover:bg-[#1B4332] group-hover:text-white transition-colors"
          >
            Voir le catalogue
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function SupermarketSkeleton() {
  return (
    <Card className="overflow-hidden border border-[#E5E7EB] rounded-2xl">
      <Skeleton className="h-[140px] w-full rounded-none" />
      <div className="p-6 flex flex-col items-center gap-2.5">
        <Skeleton className="h-12 w-12 rounded-full -mt-9" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-full rounded-full mt-2" />
      </div>
    </Card>
  );
}

function StepCard({
  step,
  delay,
}: {
  step: (typeof STEPS)[number];
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center text-center px-4">
        {/* Step 4 with livreur image */}
        {step.image ? (
          <div
            className="flex items-center justify-center w-[88px] h-[88px] rounded-2xl overflow-hidden mb-6 shadow-lg"
            style={{ background: step.circleBg }}
          >
            <Image
              src={step.image}
              alt="Livraison FAHAFA"
              width={88}
              height={88}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center w-[88px] h-[88px] rounded-2xl mb-6 shadow-lg"
            style={{ background: step.circleBg }}
          >
            <step.icon className="size-10" style={{ color: step.numberColor }} />
          </div>
        )}

        {/* Step number */}
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white mb-4 shadow-md"
          style={{ background: step.numberColor }}
        >
          {step.number}
        </span>

        <h3 className="font-semibold text-base text-[#1B4332] mb-2">{step.title}</h3>
        <p className="text-sm text-[#6B7280] leading-relaxed">{step.text}</p>
      </div>
    </div>
  );
}

function B2BCheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
        <Check className="size-3.5 text-white" />
      </div>
      <span className="text-sm text-white/90">{text}</span>
    </div>
  );
}

function B2BStatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/10 rounded-2xl px-5 py-4 text-center backdrop-blur-sm border border-white/10">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/70 mt-1">{label}</p>
    </div>
  );
}
