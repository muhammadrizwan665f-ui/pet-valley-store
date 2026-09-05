import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "STAFF";
}

export async function GET() {
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const category = await prisma.category.create({ data: body });
  return NextResponse.json(category, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id, ...rest } = await req.json();
  const category = await prisma.category.update({ where: { id }, data: rest });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  const prisma = await getPrisma();
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await req.json();
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
