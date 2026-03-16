import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteProps = {
  params: Promise<{ photoId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const user = await getSessionUser();

  if (!user || user.isPlatformAdmin || !user.salonId) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 401 });
  }

  const { photoId } = await params;
  const parsedPhotoId = Number(photoId);

  if (!Number.isInteger(parsedPhotoId)) {
    return NextResponse.json({ error: "Ongeldige foto." }, { status: 400 });
  }

  const photo = await prisma.treatmentPhoto.findFirst({
    where: {
      id: parsedPhotoId,
      salonId: user.salonId
    },
    select: {
      blobPath: true,
      mimeType: true,
      bestandNaam: true
    }
  });

  if (!photo) {
    return NextResponse.json({ error: "Foto niet gevonden." }, { status: 404 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Foto-opslag is nog niet geconfigureerd." },
      { status: 500 }
    );
  }

  const blob = await get(photo.blobPath, {
    access: "private"
  });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return NextResponse.json({ error: "Blob niet gevonden." }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType || photo.mimeType,
      "Content-Disposition": `inline; filename="${photo.bestandNaam}"`,
      "Cache-Control": "private, max-age=60"
    }
  });
}
