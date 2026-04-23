import { NextResponse } from "next/server";
import { BOLGELER } from "@/lib/bolgeler";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({ bolgeler: BOLGELER });
}
