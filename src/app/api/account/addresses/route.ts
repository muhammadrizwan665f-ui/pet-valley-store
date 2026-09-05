import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const addresses = await prisma.address.findMany({ where: { userId: (session.user as any).id } });
  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const address = await prisma.address.create({
    data: { userId: (session.user as any).id, ...body },
  });
  return NextResponse.json(address, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await req.json();
  await prisma.address.deleteMany({ where: { id, userId: (session.user as any).id } });
  return NextResponse.json({ ok: true });
}
