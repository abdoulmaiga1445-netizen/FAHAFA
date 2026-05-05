import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100, "Le nom est trop long"),
    email: z.string().email("Adresse email invalide"),
    phone: z
      .string()
      .min(8, "Numéro de téléphone invalide")
      .regex(
        /^[0-9+.\s-]{8,}$/,
        "Entrez un numéro de téléphone valide"
      ),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string(),
    role: z
      .enum(["CLIENT", "SUPERMARCHE_ADMIN"])
      .default("CLIENT"),
    supermarketName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.role !== "SUPERMARCHE_ADMIN" ||
      (data.supermarketName && data.supermarketName.trim().length >= 2),
    {
      message:
        "Le nom du supermarché est requis et doit contenir au moins 2 caractères",
      path: ["supermarketName"],
    }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues || [];
      const firstError = issues[0];
      return NextResponse.json(
        {
          error: firstError?.message || "Données invalides",
          field: firstError?.path?.[0] || null,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role, supermarketName } =
      result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà", field: "email" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await hashPassword(password);

    // Create user with appropriate role
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      },
    });

    // Only create cart for CLIENT users (SUPERMARCHE_ADMIN doesn't need one)
    if (role === "CLIENT") {
      await db.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        role === "SUPERMARCHE_ADMIN"
          ? "Compte gérant créé avec succès ! Connectez-vous pour configurer votre supermarché."
          : "Compte créé avec succès ! Connectez-vous maintenant.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        supermarketName: role === "SUPERMARCHE_ADMIN" ? supermarketName : undefined,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
