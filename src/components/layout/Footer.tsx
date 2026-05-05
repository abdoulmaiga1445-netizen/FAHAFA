import { Mail, MapPin, Phone, ShoppingBag, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0D2B1E] text-white">
      <div className="mx-auto max-w-7xl px-4 pt-[60px] pb-[30px] sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                FAHAFA Market
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Votre marché digital à Abidjan, Côte d&apos;Ivoire
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              <a href="#" aria-label="X (Twitter)" className="text-white/50 transition-colors hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-white/50 transition-colors hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" className="text-white/50 transition-colors hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-white/50 transition-colors hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Pour les clients */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Pour les clients
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/decouverte"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Découvrir
              </Link>
              <Link
                href="/decouverte"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Commander
              </Link>
              <Link
                href="/decouverte"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Click &amp; Collect
              </Link>
              <Link
                href="/login"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Mon compte
              </Link>
            </nav>
          </div>

          {/* Column 3: Pour les supermarchés */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Pour les supermarchés
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/register-supermarche"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Inscrire
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Tarifs
              </Link>
              <Link
                href="#"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Support
              </Link>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Contact
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:contact@fahafa.market"
                className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                contact@fahafa.market
              </a>
              <a
                href="tel:+2250700000000"
                className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +225 07 00 00 00 00
              </a>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 shrink-0" />
                Abidjan, Côte d&apos;Ivoire
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                <ShieldCheck className="size-3.5" />
                Paiement sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-white/50">
            &copy; 2024 FAHAFA Market &middot; Fait avec amour à Abidjan, Côte d&apos;Ivoire
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
