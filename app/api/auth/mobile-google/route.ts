import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    // Google'dan kullanıcı bilgilerini al
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      return NextResponse.json({ error: "Geçersiz Google token" }, { status: 401 });
    }

    const googleUser = await googleRes.json();
    const { email, name, picture, id: googleId } = googleUser;

    if (!email) {
      return NextResponse.json({ error: "Email alınamadı" }, { status: 400 });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email,
          image: picture,
          role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER",
        },
      });
    } else if (email === process.env.ADMIN_EMAIL && user.role !== "ADMIN") {
      user = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
    }

    // Basit JWT token oluştur (7 gün geçerli)
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new jose.SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
