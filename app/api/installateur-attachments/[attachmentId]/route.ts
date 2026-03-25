import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = {
  params: Promise<{ attachmentId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 401 });
  }

  const { attachmentId } = await params;
  const parsedAttachmentId = Number(attachmentId);

  if (!Number.isInteger(parsedAttachmentId)) {
    return NextResponse.json({ error: "Ongeldige bijlage." }, { status: 400 });
  }

  const attachment = await prisma.installateurAttachment.findFirst({
    where: {
      id: parsedAttachmentId,
      salonId: user.isPlatformAdmin ? undefined : user.salonId ?? -1
    },
    select: {
      salonId: true,
      blobPath: true,
      mimeType: true,
      bestandNaam: true
    }
  });

  if (!attachment) {
    return NextResponse.json({ error: "Bijlage niet gevonden." }, { status: 404 });
  }

  if (!user.isPlatformAdmin && user.salonId !== attachment.salonId) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Media-opslag is nog niet geconfigureerd." },
      { status: 500 }
    );
  }

  const blob = await get(attachment.blobPath, {
    access: "private"
  });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return NextResponse.json({ error: "Blob niet gevonden." }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType || attachment.mimeType,
      "Content-Disposition": `inline; filename="${attachment.bestandNaam}"`,
      "Cache-Control": "private, max-age=60"
    }
  });
}
