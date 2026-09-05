import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, shipment: true, user: true, shippingAddress: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getPrisma();
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, paymentStatus, trackingCarrier, trackingNumber, internalNotes, note } = await req.json();

  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...data,
      ...(status && { statusHistory: { create: { status, note: note || "Updated by admin" } } }),
      ...((trackingCarrier || trackingNumber) && {
        shipment: {
          upsert: {
            create: { carrier: trackingCarrier, trackingNumber },
            update: { carrier: trackingCarrier, trackingNumber },
          },
        },
      }),
    },
  });

  return NextResponse.json(order);
}
