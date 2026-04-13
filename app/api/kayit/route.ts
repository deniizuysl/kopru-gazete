import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kayitSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = kayitSchema.parse(body);

    const mevcutKullanici = await prisma.user.findUnique({ where: { email } });
    if (mevcutKullanici) {
      return NextResponse.json(
        { error: "Bu email ile kayıtlı hesap zaten var" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const kullanici = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role:
          email === process.env.ADMIN_EMAIL ? ("ADMIN" as const) : ("USER" as const),
      },
    });

    return NextResponse.json(
      { message: "Hesap oluşturuldu", id: kullanici.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
