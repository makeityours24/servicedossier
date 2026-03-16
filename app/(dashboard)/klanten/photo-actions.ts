"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { treatmentPhotoSchema } from "@/lib/validation";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildBlobPath(params: {
  salonId: number;
  customerId: number;
  treatmentId: number;
  originalName: string;
}) {
  const sanitized = sanitizeFileName(params.originalName || "treatment-photo");
  return `salons/${params.salonId}/customers/${params.customerId}/treatments/${params.treatmentId}/${Date.now()}-${sanitized}`;
}

function humanPhotoTypeLabel(soort: "VOOR" | "NA" | "ALGEMEEN") {
  if (soort === "VOOR") return "Voor";
  if (soort === "NA") return "Na";
  return "Algemeen";
}

export async function uploadTreatmentPhotoAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = treatmentPhotoSchema.safeParse({
    customerId: formData.get("customerId"),
    treatmentId: formData.get("treatmentId"),
    soort: formData.get("soort") || "ALGEMEEN",
    notitie: formData.get("notitie") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de foto-invoer." };
  }

  const file = formData.get("bestand");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Kies eerst een foto om te uploaden." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Gebruik alleen JPG, PNG of WEBP voor behandelfoto's." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "De foto is te groot. Gebruik een bestand tot maximaal 5 MB." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Foto-opslag is nog niet geconfigureerd. Voeg eerst Vercel Blob toe en zet BLOB_READ_WRITE_TOKEN in je omgeving."
    };
  }

  try {
    const treatment = await prisma.treatment.findFirst({
      where: {
        id: parsed.data.treatmentId,
        customerId: parsed.data.customerId,
        salonId: user.salonId
      },
      select: {
        id: true,
        customerId: true,
        behandeling: true
      }
    });

    if (!treatment) {
      return { error: "Deze behandeling hoort niet bij deze klant of salon." };
    }

    const blob = await put(
      buildBlobPath({
        salonId: user.salonId,
        customerId: parsed.data.customerId,
        treatmentId: parsed.data.treatmentId,
        originalName: file.name
      }),
      file,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: file.type
      }
    );

    const photo = await prisma.treatmentPhoto.create({
      data: {
        salonId: user.salonId,
        customerId: parsed.data.customerId,
        treatmentId: parsed.data.treatmentId,
        uploadedByUserId: user.id,
        url: blob.url,
        blobPath: blob.pathname,
        bestandNaam: file.name,
        mimeType: file.type,
        soort: parsed.data.soort,
        notitie: parsed.data.notitie || null
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "TREATMENT_PHOTO_UPLOADED",
      entityType: "TreatmentPhoto",
      entityId: photo.id,
      message: `Behandelfoto toegevoegd aan behandeling ${treatment.behandeling}.`,
      ipAddress,
      metadata: {
        treatmentId: treatment.id,
        customerId: treatment.customerId,
        soort: parsed.data.soort,
        bestandNaam: file.name
      }
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath(
      `/klanten/${parsed.data.customerId}/behandelingen/${parsed.data.treatmentId}/bewerken`
    );

    return { success: `${humanPhotoTypeLabel(parsed.data.soort)}-foto is toegevoegd.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Uploaden van de behandelfoto is mislukt."
    };
  }
}

export async function deleteTreatmentPhotoAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const customerId = Number(formData.get("customerId"));
  const treatmentId = Number(formData.get("treatmentId"));
  const photoId = Number(formData.get("photoId"));

  if (!Number.isInteger(customerId) || !Number.isInteger(treatmentId) || !Number.isInteger(photoId)) {
    throw new Error("Ongeldige foto geselecteerd.");
  }

  const photo = await prisma.treatmentPhoto.findFirst({
    where: {
      id: photoId,
      customerId,
      treatmentId,
      salonId: user.salonId
    },
    select: {
      id: true,
      url: true,
      blobPath: true,
      bestandNaam: true,
      soort: true
    }
  });

  if (!photo) {
    throw new Error("Foto niet gevonden.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Foto-opslag is nog niet geconfigureerd.");
  }

  await del(photo.blobPath);

  await prisma.treatmentPhoto.delete({
    where: { id: photo.id }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "TREATMENT_PHOTO_DELETED",
    entityType: "TreatmentPhoto",
    entityId: photo.id,
    message: `Behandelfoto ${photo.bestandNaam} verwijderd.`,
    ipAddress,
    metadata: {
      treatmentId,
      customerId,
      soort: photo.soort,
      blobPath: photo.blobPath
    }
  });

  revalidatePath(`/klanten/${customerId}`);
  revalidatePath(`/klanten/${customerId}/behandelingen/${treatmentId}/bewerken`);
  redirect(`/klanten/${customerId}/behandelingen/${treatmentId}/bewerken`);
}
