import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { firstName, lastName, phone } = await req.json();
  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { firstName, lastName, phone },
  });
  return NextResponse.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone });
}
