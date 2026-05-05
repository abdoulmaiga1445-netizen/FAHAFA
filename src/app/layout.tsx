import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FAHAFA Market — Votre marché digital à Abidjan",
  description:
    "Commandez vos produits alimentaires auprès des meilleurs supermarchés d'Abidjan. Livraison rapide dans toutes les communes.",
  keywords: [
    "FAHAFA Market",
    "Abidjan",
    "Côte d'Ivoire",
    "supermarché",
    "livraison",
    "courses",
    "alimentation",
  ],
  authors: [{ name: "FAHAFA Market" }],
  icons: {
    icon: "/logo-supermarche.png",
  },
  openGraph: {
    title: "FAHAFA Market — Votre marché digital à Abidjan",
    description:
      "Commandez vos produits alimentaires auprès des meilleurs supermarchés d'Abidjan.",
    type: "website",
    locale: "fr_CI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
