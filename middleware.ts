import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes publiques accessibles sans connexion
const publicRoutes = [
  "/",
  "/api/auth",
  "/api/seed",
  "/api/categories",
  "/api/supermarkets",
  "/api/products",
];

// Routes réservées aux CLIENT connectés
const clientRoutes = ["/api/cart", "/api/orders"];

// Routes réservées aux SUPERMARCHE_ADMIN
const supermarcheAdminRoutes = ["/api/supermarche"];

// Routes réservées aux SUPER_ADMIN
const superAdminRoutes = ["/api/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Autoriser les assets statiques et les routes internes de NextAuth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Vérifier le JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "supermarche-ci-dev-secret-key-2024",
  });

  // Routes publiques — autoriser sans auth
  const isPublicRoute =
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    ) || pathname === "/";

  if (isPublicRoute && !pathname.startsWith("/api/cart") && !pathname.startsWith("/api/orders")) {
    return NextResponse.next();
  }

  // ─── Protection des API routes ──────────────────────────────────────────

  // /api/cart et /api/orders → CLIENT connecté requis
  if (
    clientRoutes.some((route) => pathname.startsWith(route))
  ) {
    if (!token) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // /api/supermarche/* → SUPERMARCHE_ADMIN requis
  if (
    supermarcheAdminRoutes.some((route) => pathname.startsWith(route))
  ) {
    if (!token || token.role !== "SUPERMARCHE_ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux gérants de supermarché" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // /api/admin/* → SUPER_ADMIN requis
  if (superAdminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || token.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
