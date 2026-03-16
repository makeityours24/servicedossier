"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { packageTypeSchema, packageTypeUpdateSchema } from "@/lib/validation";

function hasPakketBeheerRechten(rol: "OWNER" | "ADMIN" | "MEDEWERKER") {
  return rol === "OWNER" || rol === "ADMIN";
}

function euroToCents(value: number) {
  return Math.round(value * 100);
}

export async function createPackageTypeAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasPakketBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen pakketten beheren." };
  }

  const parsed = packageTypeSchema.safeParse({
    naam: formData.get("naam"),
    omschrijving: formData.get("omschrijving") || undefined,
    totaalBeurten: formData.get("totaalBeurten"),
    pakketPrijs: formData.get("pakketPrijs"),
    lossePrijs: formData.get("lossePrijs"),
    standaardBehandeling: formData.get("standaardBehandeling"),
    isActief: formData.get("isActief") || "true"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de pakketgegevens." };
  }

  try {
    const bestaandPakket = await prisma.packageType.findFirst({
      where: {
        salonId: user.salonId,
        naam: parsed.data.naam
      },
      select: { id: true }
    });

    if (bestaandPakket) {
      return { error: "Er bestaat al een pakket met deze naam in deze salon." };
    }

    await prisma.packageType.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        omschrijving: parsed.data.omschrijving || null,
        totaalBeurten: parsed.data.totaalBeurten,
        pakketPrijsCents: euroToCents(parsed.data.pakketPrijs),
        lossePrijsCents: euroToCents(parsed.data.lossePrijs),
        standaardBehandeling: parsed.data.standaardBehandeling,
        isActief: parsed.data.isActief === "true"
      }
    });

    revalidatePath("/pakketten");
    return { success: "Pakkettype is toegevoegd." };
  } catch {
    return { error: "Opslaan van het pakkettype is mislukt." };
  }
}

export async function updatePackageTypeAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasPakketBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen pakketten beheren." };
  }

  const parsed = packageTypeUpdateSchema.safeParse({
    packageTypeId: formData.get("packageTypeId"),
    naam: formData.get("naam"),
    omschrijving: formData.get("omschrijving") || undefined,
    totaalBeurten: formData.get("totaalBeurten"),
    pakketPrijs: formData.get("pakketPrijs"),
    lossePrijs: formData.get("lossePrijs"),
    standaardBehandeling: formData.get("standaardBehandeling"),
    isActief: formData.get("isActief") || "true"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de pakketgegevens." };
  }

  try {
    const bestaandPakket = await prisma.packageType.findFirst({
      where: {
        id: parsed.data.packageTypeId,
        salonId: user.salonId
      },
      select: { id: true }
    });

    if (!bestaandPakket) {
      return { error: "Dit pakkettype hoort niet bij deze salon." };
    }

    const duplicate = await prisma.packageType.findFirst({
      where: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        NOT: { id: parsed.data.packageTypeId }
      },
      select: { id: true }
    });

    if (duplicate) {
      return { error: "Er bestaat al een ander pakket met deze naam in deze salon." };
    }

    await prisma.packageType.update({
      where: { id: parsed.data.packageTypeId },
      data: {
        naam: parsed.data.naam,
        omschrijving: parsed.data.omschrijving || null,
        totaalBeurten: parsed.data.totaalBeurten,
        pakketPrijsCents: euroToCents(parsed.data.pakketPrijs),
        lossePrijsCents: euroToCents(parsed.data.lossePrijs),
        standaardBehandeling: parsed.data.standaardBehandeling,
        isActief: parsed.data.isActief === "true"
      }
    });

    revalidatePath("/pakketten");
    revalidatePath(`/pakketten/${parsed.data.packageTypeId}/bewerken`);
    return { success: "Pakkettype is bijgewerkt." };
  } catch {
    return { error: "Bijwerken van het pakkettype is mislukt." };
  }
}

export async function deactivatePackageTypeAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();

  if (!hasPakketBeheerRechten(user.rol)) {
    throw new Error("Alleen eigenaren en admins kunnen pakketten beheren.");
  }

  const packageTypeId = Number(formData.get("packageTypeId"));

  if (!Number.isInteger(packageTypeId)) {
    throw new Error("Ongeldig pakkettype geselecteerd.");
  }

  const packageType = await prisma.packageType.findFirst({
    where: {
      id: packageTypeId,
      salonId: user.salonId
    },
    select: {
      id: true,
      naam: true,
      isActief: true,
      _count: {
        select: {
          customerPackages: true
        }
      }
    }
  });

  if (!packageType) {
    throw new Error("Pakkettype niet gevonden.");
  }

  if (!packageType.isActief) {
    redirect("/pakketten");
  }

  await prisma.packageType.update({
    where: { id: packageTypeId },
    data: { isActief: false }
  });

  await prisma.auditLog.create({
    data: {
      salonId: user.salonId,
      actorUserId: user.id,
      action: "PACKAGE_TYPE_DEACTIVATED",
      entityType: "PackageType",
      entityId: String(packageTypeId),
      message:
        packageType._count.customerPackages > 0
          ? `Pakkettype ${packageType.naam} is gedeactiveerd na gebruik in klantpakketten.`
          : `Pakkettype ${packageType.naam} is gedeactiveerd.`,
      metadata: {
        naam: packageType.naam,
        linkedCustomerPackages: packageType._count.customerPackages
      }
    }
  });

  revalidatePath("/pakketten");
  redirect("/pakketten");
}

export async function reactivatePackageTypeAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();

  if (!hasPakketBeheerRechten(user.rol)) {
    throw new Error("Alleen eigenaren en admins kunnen pakketten beheren.");
  }

  const packageTypeId = Number(formData.get("packageTypeId"));

  if (!Number.isInteger(packageTypeId)) {
    throw new Error("Ongeldig pakkettype geselecteerd.");
  }

  const packageType = await prisma.packageType.findFirst({
    where: {
      id: packageTypeId,
      salonId: user.salonId
    },
    select: {
      id: true,
      naam: true,
      isActief: true
    }
  });

  if (!packageType) {
    throw new Error("Pakkettype niet gevonden.");
  }

  if (packageType.isActief) {
    redirect("/pakketten");
  }

  await prisma.packageType.update({
    where: { id: packageTypeId },
    data: { isActief: true }
  });

  await prisma.auditLog.create({
    data: {
      salonId: user.salonId,
      actorUserId: user.id,
      action: "PACKAGE_TYPE_REACTIVATED",
      entityType: "PackageType",
      entityId: String(packageTypeId),
      message: `Pakkettype ${packageType.naam} is opnieuw geactiveerd.`,
      metadata: { naam: packageType.naam }
    }
  });

  revalidatePath("/pakketten");
  redirect("/pakketten");
}
