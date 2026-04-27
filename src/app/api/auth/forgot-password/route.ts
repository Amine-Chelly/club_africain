import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  locale: z.string().optional().default("en"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email, locale } = parsed.data;
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Always return success to avoid email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (user) {
    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate a secure random token (hex, 64 chars)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${origin}/${locale}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Club Africain — Réinitialisation de mot de passe / Password reset",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#c8102e">Club Africain</h2>
          <p>A password reset was requested for your account. Click below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <p>Une réinitialisation de mot de passe a été demandée pour votre compte. Cliquez ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.</p>
          <p style="margin:24px 0">
            <a href="${resetUrl}" style="background:#c8102e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
              Reset password / Réinitialiser
            </a>
          </p>
          <p style="color:#666;font-size:12px">If you did not request this, ignore this email. / Si vous n'avez pas demandé cela, ignorez cet email.</p>
        </div>
      `,
    });
  }

  // Always return success (prevents email enumeration)
  return NextResponse.json({ ok: true });
}
