'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Store,
  Package,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import PanierDrawer from '@/components/client/PanierDrawer';
import { usePanier } from '@/hooks/usePanier';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    CLIENT: 'Client',
    SUPERMARCHE_ADMIN: 'Gérant',
    SUPER_ADMIN: 'Admin',
  };
  return map[role] || role;
}

function getRoleBadgeColor(role: string): string {
  const map: Record<string, string> = {
    CLIENT: 'bg-[#40916C]/10 text-[#40916C]',
    SUPERMARCHE_ADMIN: 'bg-amber-500/10 text-amber-700',
    SUPER_ADMIN: 'bg-red-500/10 text-red-600',
  };
  return map[role] || 'bg-gray-500/10 text-gray-600';
}

// ─── Navbar Props ────────────────────────────────────────────────────────────────

interface NavbarProps {
  variant?: 'default' | 'dark';
}

// ─── Navbar ─────────────────────────────────────────────────────────────────────

export function Navbar({ variant = 'default' }: NavbarProps) {
  const { data: session } = useSession();
  const { cartItems, currentUser, setCurrentUser } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panierOpen, setPanierOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const { itemCount: serverItemCount } = usePanier();
  const count = serverItemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get role from session or local store
  const role = (session?.user as { role?: string })?.role || currentUser?.role || '';
  const userName = session?.user?.name || currentUser?.name || '';
  const userEmail = session?.user?.email || currentUser?.email || '';
  const isLoggedIn = !!session?.user || !!currentUser;

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      // Fallback
    }
    setCurrentUser(null);
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/decouverte?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isClient = role === 'CLIENT';
  const isSupermarcheAdmin = role === 'SUPERMARCHE_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Dark variant styles
  const isDark = variant === 'dark';
  const bgClass = isDark ? 'bg-[#1B4332]' : 'bg-white border-b border-[#E5E7EB]';
  const logoTextClass = isDark ? 'text-white' : 'text-[#1B4332]';
  const logoBgClass = isDark ? 'bg-white/20 group-hover:bg-white/30' : 'bg-[#1B4332] group-hover:bg-[#2D6A4F]';
  const cartIconClass = isDark ? 'text-white' : 'text-[#1B4332]';
  const menuBtnClass = isDark ? 'text-white hover:bg-white/10' : 'text-[#1B4332] hover:bg-[#F3F4F6]';
  const searchBg = isDark ? 'bg-white/15' : 'bg-[#F3F4F6]';
  const searchTextClass = isDark ? 'text-white placeholder:text-white/50' : 'text-gray-900 placeholder:text-gray-500';
  const searchFocusRing = isDark ? 'focus:ring-2 focus:ring-white/20' : 'focus:ring-2 focus:ring-[#1B4332]/20';
  const navLinkClass = isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-[#1B4332] hover:bg-[#F3F4F6]';
  const activeLinkClass = isDark ? 'text-white font-semibold' : 'text-[#1B4332] font-semibold';
  const separatorClass = isDark ? 'bg-white/20' : 'bg-[#E5E7EB]';
  const userBtnClass = isDark ? 'text-white hover:bg-white/10 hover:text-white' : 'text-[#1B4332] hover:bg-[#F3F4F6] hover:text-[#1B4332]';
  const userIconBg = isDark ? 'bg-white/20' : 'bg-[#1B4332]/10';
  const userIconColor = isDark ? 'text-white' : 'text-[#1B4332]';
  const discoverLinkClass = isDark ? 'text-white/80 hover:text-white' : 'text-[#1B4332] hover:text-[#2D6A4F]';

  // Auth button styles for dark variant
  const connexionBtnClass = isDark
    ? 'border-white/50 text-white hover:bg-white/10 rounded-full px-5 font-medium'
    : 'border-[1.5px] border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332]/5 rounded-full px-5 font-medium';
  const inscriptionBtnClass = isDark
    ? 'bg-white text-[#1B4332] hover:bg-white/90 rounded-full px-5 font-medium'
    : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] rounded-full px-5 font-medium';

  return (
    <header className={`sticky top-0 z-50 ${bgClass}`}>
      <div className="mx-auto flex h-[60px] md:h-[70px] max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${logoBgClass}`}>
            <ShoppingCart className={`size-[22px] ${isDark ? 'text-white' : 'text-white'}`} />
          </div>
          <span className={`font-bold text-[20px] tracking-tight ${logoTextClass}`}>
            FAHAFA Market
          </span>
        </Link>

        {/* ── Center: Search Bar (Desktop only) ─────────────────────────────── */}
        <div className="hidden md:flex flex-1 justify-center px-6">
          <form onSubmit={handleSearch} className="relative w-[380px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Chercher un produit ou supermarché..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 pl-11 pr-4 rounded-full ${searchBg} text-sm ${searchTextClass} border-0 outline-none ${searchFocusRing} transition-shadow`}
            />
          </form>
        </div>

        {/* ── Right: Navigation + Auth (Desktop) ────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Role-based nav links for logged-in users */}
              {isClient && (
                <>
                  {/* Cart icon with badge */}
                  <button
                    type="button"
                    className={`relative p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                    onClick={() => setPanierOpen(true)}
                    aria-label="Ouvrir le panier"
                  >
                    <ShoppingCart className={`size-5 ${cartIconClass}`} />
                    {count > 0 && (
                      <Badge className={`absolute -top-0.5 -right-0.5 h-5 min-w-5 justify-center rounded-full text-[10px] px-1.5 font-bold border-2 ${isDark ? 'bg-[#F4A226] text-white border-[#1B4332]' : 'bg-[#1B4332] text-white border-white'}`}>
                        {count}
                      </Badge>
                    )}
                  </button>

                  <NavLink
                    href="/commandes"
                    label="Mes commandes"
                    isActive={pathname === '/commandes' || pathname.startsWith('/commandes/')}
                    navLinkClass={navLinkClass}
                    activeLinkClass={activeLinkClass}
                  />
                </>
              )}

              {isSupermarcheAdmin && (
                <NavLink
                  href="/dashboard"
                  label="Dashboard"
                  isActive={pathname === '/dashboard' || pathname.startsWith('/dashboard/')}
                  navLinkClass={navLinkClass}
                  activeLinkClass={activeLinkClass}
                />
              )}

              {isSuperAdmin && (
                <NavLink
                  href="/admin"
                  label="Admin"
                  isActive={pathname === '/admin' || pathname.startsWith('/admin/')}
                  navLinkClass={navLinkClass}
                  activeLinkClass={activeLinkClass}
                />
              )}

              {/* Separator */}
              <div className={`h-6 w-px ${separatorClass}`} />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 ${userBtnClass}`}
                  >
                    <div className={`flex items-center justify-center size-7 rounded-full ${userIconBg}`}>
                      <User className={`size-3.5 ${userIconColor}`} />
                    </div>
                    <span className={`max-w-[120px] truncate text-sm font-medium ${logoTextClass}`}>{userName}</span>
                    <Badge className={`text-[9px] h-4 px-1.5 rounded-sm font-medium border-0 ${getRoleBadgeColor(role)}`}>
                      {getRoleLabel(role)}
                    </Badge>
                    <ChevronDown className={`size-3.5 ${isDark ? 'text-white/60' : 'opacity-60'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-sm">{userName}</p>
                      <p className="text-xs text-muted-foreground font-normal">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/decouverte">
                      <Store className="size-4 mr-2" />
                      Découvrir
                    </Link>
                  </DropdownMenuItem>
                  {isClient && (
                    <DropdownMenuItem asChild>
                      <Link href="/commandes">
                        <Package className="size-4 mr-2" />
                        Mes commandes
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isSupermarcheAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="size-4 mr-2" />
                        Mon supermarché
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isSuperAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="size-4 mr-2" />
                        Panneau admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Découvrir link */}
              <Link
                href="/decouverte"
                className={`text-sm font-medium transition-colors ${discoverLinkClass}`}
              >
                Découvrir
              </Link>

              {/* Separator */}
              <div className={`h-6 w-px ${separatorClass}`} />

              {/* Connexion */}
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className={connexionBtnClass}
                >
                  Connexion
                </Button>
              </Link>

              {/* Inscription */}
              <Link href="/register">
                <Button
                  size="sm"
                  className={inscriptionBtnClass}
                >
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Controls ──────────────────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-1">
          {/* Cart icon for mobile (CLIENT only) */}
          {isLoggedIn && isClient && (
            <button
              type="button"
              className={`relative p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
              onClick={() => setPanierOpen(true)}
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart className={`size-5 ${cartIconClass}`} />
              {count > 0 && (
                <Badge className={`absolute -top-0.5 -right-0.5 h-5 min-w-5 justify-center rounded-full text-[10px] px-1.5 font-bold ${isDark ? 'bg-[#F4A226] text-white border-[#1B4332]' : 'bg-[#1B4332] text-white border-white'} border-2`}>
                  {count}
                </Badge>
              )}
            </button>
          )}

          {/* Hamburger menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={menuBtnClass}
              >
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-white">
              {/* Header */}
              <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E5E7EB]">
                <SheetTitle className="flex items-center gap-2.5 text-[#1B4332]">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1B4332]">
                    <ShoppingCart className="size-4 text-white" />
                  </div>
                  FAHAFA Market
                </SheetTitle>
              </SheetHeader>

              {/* User info card */}
              {isLoggedIn && (
                <div className="mx-4 mt-4 p-3 bg-[#F0FFF4] rounded-xl border border-[#1B4332]/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-full bg-[#1B4332]">
                      <User className="size-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <Badge className={`text-[9px] h-5 px-2 rounded-md font-medium border-0 ${getRoleBadgeColor(role)}`}>
                      {getRoleLabel(role)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="flex flex-col gap-0.5 px-3 mt-4">
                <MobileNavLink
                  href="/decouverte"
                  icon={<Store className="size-4" />}
                  label="Découvrir"
                  isActive={pathname === '/decouverte'}
                  onClose={() => setMobileOpen(false)}
                />

                {isLoggedIn && isClient && (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors text-muted-foreground hover:bg-[#F3F4F6] hover:text-foreground"
                      onClick={() => {
                        setMobileOpen(false);
                        setPanierOpen(true);
                      }}
                    >
                      <ShoppingCart className="size-4" />
                      <span>Panier</span>
                      {count > 0 && (
                        <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-[#1B4332] text-white text-[10px] px-1.5">
                          {count}
                        </Badge>
                      )}
                    </button>
                    <MobileNavLink
                      href="/commandes"
                      icon={<Package className="size-4" />}
                      label="Mes commandes"
                      isActive={pathname === '/commandes' || pathname.startsWith('/commandes/')}
                      onClose={() => setMobileOpen(false)}
                    />
                  </>
                )}

                {isLoggedIn && isSupermarcheAdmin && (
                  <MobileNavLink
                    href="/dashboard"
                    icon={<LayoutDashboard className="size-4" />}
                    label="Dashboard"
                    isActive={pathname === '/dashboard' || pathname.startsWith('/dashboard/')}
                    onClose={() => setMobileOpen(false)}
                  />
                )}

                {isLoggedIn && isSuperAdmin && (
                  <MobileNavLink
                    href="/admin"
                    icon={<ShieldCheck className="size-4" />}
                    label="Admin"
                    isActive={pathname === '/admin' || pathname.startsWith('/admin/')}
                    onClose={() => setMobileOpen(false)}
                  />
                )}

                <div className="my-3 border-t border-[#E5E7EB]" />

                {isLoggedIn ? (
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors text-destructive hover:bg-destructive/5"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Déconnexion
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors text-muted-foreground hover:bg-[#F3F4F6] hover:text-foreground">
                        <LogIn className="size-4" />
                        Connexion
                      </div>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center justify-center gap-2 w-full mt-2 px-3 py-2.5 text-sm rounded-full bg-[#1B4332] text-white font-medium transition-colors hover:bg-[#2D6A4F]">
                        <User className="size-4" />
                        Inscription
                      </div>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Panier Drawer */}
      <PanierDrawer open={panierOpen} onOpenChange={setPanierOpen} />
    </header>
  );
}

// ─── NavLink (desktop) ──────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  isActive,
  navLinkClass,
  activeLinkClass,
}: {
  href: string;
  label: string;
  isActive: boolean;
  navLinkClass: string;
  activeLinkClass: string;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
        isActive ? activeLinkClass : navLinkClass
      }`}
    >
      <span>{label}</span>
    </Link>
  );
}

// ─── Mobile Nav Link helper ─────────────────────────────────────────────────────

function MobileNavLink({
  href,
  icon,
  label,
  isActive,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <Link href={href} onClick={onClose}>
      <div
        className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${
          isActive
            ? 'text-[#1B4332] font-semibold bg-[#1B4332]/5'
            : 'text-muted-foreground hover:bg-[#F3F4F6] hover:text-foreground'
        }`}
      >
        {icon}
        <span>{label}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1B4332]" />
        )}
      </div>
    </Link>
  );
}

export default Navbar;
