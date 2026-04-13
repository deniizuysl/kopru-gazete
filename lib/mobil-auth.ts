import * as jose from "jose";

export async function mobilTokenDogrula(authHeader: string | null): Promise<{
  id: string; email: string; name: string; role: string; image?: string;
} | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      id: payload.sub!,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      image: payload.image as string | undefined,
    };
  } catch {
    return null;
  }
}
