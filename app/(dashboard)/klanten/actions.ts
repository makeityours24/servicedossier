"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { customerPackageSchema, customerSchema, treatmentSchema } from "@/lib/validation";

function getPackageStatusForRemainingSessions(resterendeBeurten: number) {
  return resterendeBeurten <= 0 ? "VOLLEDIG_GEBRUIKT" : "ACTIEF";
}

async function rollbackTreatmentPackageUsage(params: {
  treatmentId: number;
  salonId: number;
}) {
  const existingUsage = await prisma.customerPackageUsage.findFirst({
    where: {
      treatmentId: params.treatmentId,
      salonId: params.salonId
    },
    select: {
      id: true,
      aantalAfgeboekt: true,
      customerPackageId: true,
      customerPackage: {
        select: {
          resterendeBeurten: true
        }
      }
    }
  });

  if (!existingUsage) {
    return null;
  }

  const nieuweResterendeBeurten =
    existingUsage.customerPackage.resterendeBeurten + existingUsage.aantalAfgeboekt;

  await prisma.customerPackage.update({
    where: { id: existingUsage.customerPackageId },
    data: {
      resterendeBeurten: nieuweResterendeBeurten,
      status: getPackageStatusForRemainingSessions(nieuweResterendeBeurten)
    }
  });

  await prisma.customerPackageUsage.delete({
    where: { id: existingUsage.id }
  });

  return existingUsage;
}

async function attachTreatmentPackageUsage(params: {
  salonId: number;
  customerId: number;
  treatmentId: number;
  customerPackageId: number | null;
  userId: number;
  datum: Date;
}) {
  if (!params.customerPackageId) {
    return;
  }

  const customerPackage = await prisma.customerPackage.findFirst({
    where: {
      id: params.customerPackageId,
      salonId: params.salonId,
      customerId: params.customerId,
      status: "ACTIEF"
    },
    select: {
      id: true,
      naamSnapshot: true,
      resterendeBeurten: true
    }
  });

  if (!customerPackage) {
    throw new Error("Het gekozen pakket hoort niet bij deze klant of is niet actief.");
  }

  if (customerPackage.resterendeBeurten < 1) {
    throw new Error("Dit pakket heeft geen resterende beurten meer.");
  }

  const nieuweResterendeBeurten = customerPackage.resterendeBeurten - 1;

  await prisma.customerPackageUsage.create({
    data: {
      salonId: params.salonId,
      customerPackageId: customerPackage.id,
      customerId: params.customerId,
      treatmentId: params.treatmentId,
      userId: params.userId,
      datum: params.datum,
      aantalAfgeboekt: 1
    }
  });

  await prisma.customerPackage.update({
    where: { id: customerPackage.id },
    data: {
      resterendeBeurten: nieuweResterendeBeurten,
      status: getPackageStatusForRemainingSessions(nieuweResterendeBeurten)
    }
  });
}

export async function createCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  let klantId: number;

  try {
    const klant = await prisma.customer.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        adres: parsed.data.adres,
        telefoonnummer: parsed.data.telefoonnummer
      }
    });

    klantId = klant.id;
  } catch {
    return { error: "Opslaan is mislukt. Controleer of het telefoonnummer al bestaat." };
  }

  revalidatePath("/klanten");
  redirect(`/klanten/${klantId}`);
}

export async function updateCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const customerId = Number(formData.get("customerId"));
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer")
  });

  if (!Number.isInteger(customerId)) {
    return { error: "Ongeldige klant geselecteerd." };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  try {
    const bestaandeKlant = await prisma.customer.findFirst({
      where: {
        id: customerId,
        salonId: user.salonId
      },
      select: { id: true }
    });

    if (!bestaandeKlant) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: parsed.data
    });

    revalidatePath("/klanten");
    revalidatePath(`/klanten/${customerId}`);
    return { success: "Klantgegevens zijn bijgewerkt." };
  } catch {
    return { error: "Bijwerken is mislukt. Controleer of het telefoonnummer uniek is." };
  }
}

export async function deleteCustomerAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const customerId = Number(formData.get("customerId"));

  if (!Number.isInteger(customerId)) {
    throw new Error("Ongeldige klant geselecteerd.");
  }

  const bestaandeKlant = await prisma.customer.findFirst({
    where: {
      id: customerId,
      salonId: user.salonId
    },
    select: { id: true }
  });

  if (!bestaandeKlant) {
    throw new Error("Deze klant hoort niet bij deze salon.");
  }

  await prisma.customer.delete({
    where: { id: customerId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "CUSTOMER_DELETED",
    entityType: "CUSTOMER",
    entityId: customerId,
    message: "Klant verwijderd.",
    ipAddress
  });

  revalidatePath("/klanten");
  revalidatePath("/dashboard");
  redirect("/klanten");
}

export async function createTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined,
    customerPackageId: formData.get("customerPackageId")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    const datum = new Date(parsed.data.datum);

    const treatment = await prisma.treatment.create({
      data: {
        salonId: user.salonId,
        customerId: parsed.data.customerId,
        userId: user.id,
        datum,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    await attachTreatmentPackageUsage({
      salonId: user.salonId,
      customerId: parsed.data.customerId,
      treatmentId: treatment.id,
      customerPackageId: parsed.data.customerPackageId,
      userId: user.id,
      datum
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath("/dashboard");
    return { success: "Behandeling is opgeslagen." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Opslaan van de behandeling is mislukt."
    };
  }
}

export async function createCustomerPackageAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = customerPackageSchema.safeParse({
    customerId: formData.get("customerId"),
    packageTypeId: formData.get("packageTypeId"),
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de pakketgegevens." };
  }

  try {
    const [customer, packageType] = await Promise.all([
      prisma.customer.findFirst({
        where: {
          id: parsed.data.customerId,
          salonId: user.salonId
        },
        select: {
          id: true,
          naam: true
        }
      }),
      prisma.packageType.findFirst({
        where: {
          id: parsed.data.packageTypeId,
          salonId: user.salonId,
          isActief: true
        },
        select: {
          id: true,
          naam: true,
          standaardBehandeling: true,
          totaalBeurten: true,
          pakketPrijsCents: true,
          lossePrijsCents: true
        }
      })
    ]);

    if (!customer) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    if (!packageType) {
      return { error: "Dit pakkettype is niet actief of hoort niet bij deze salon." };
    }

    const customerPackage = await prisma.customerPackage.create({
      data: {
        salonId: user.salonId,
        customerId: customer.id,
        packageTypeId: packageType.id,
        naamSnapshot: packageType.naam,
        standaardBehandelingSnapshot: packageType.standaardBehandeling,
        totaalBeurten: packageType.totaalBeurten,
        resterendeBeurten: packageType.totaalBeurten,
        pakketPrijsCents: packageType.pakketPrijsCents,
        lossePrijsCents: packageType.lossePrijsCents,
        notities: parsed.data.notities || null
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "CUSTOMER_PACKAGE_CREATED",
      entityType: "CustomerPackage",
      entityId: customerPackage.id,
      message: `Pakket ${packageType.naam} verkocht aan ${customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customer.id,
        customerName: customer.naam,
        packageTypeId: packageType.id,
        packageName: packageType.naam,
        totalSessions: packageType.totaalBeurten
      }
    });

    revalidatePath(`/klanten/${customer.id}`);
    return { success: "Pakket is aan de klant toegevoegd." };
  } catch {
    return { error: "Opslaan van het klantpakket is mislukt." };
  }
}

export async function updateTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const treatmentId = Number(formData.get("treatmentId"));

  if (!Number.isInteger(treatmentId)) {
    return { error: "Ongeldige behandeling geselecteerd." };
  }

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined,
    customerPackageId: formData.get("customerPackageId")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    const bestaandeBehandeling = await prisma.treatment.findFirst({
      where: {
        id: treatmentId,
        salonId: user.salonId,
        customerId: parsed.data.customerId
      },
      select: { id: true }
    });

    if (!bestaandeBehandeling) {
      return { error: "Deze behandeling hoort niet bij deze salon of klant." };
    }

    await rollbackTreatmentPackageUsage({
      treatmentId,
      salonId: user.salonId
    });

    const datum = new Date(parsed.data.datum);

    await prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        datum,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    await attachTreatmentPackageUsage({
      salonId: user.salonId,
      customerId: parsed.data.customerId,
      treatmentId,
      customerPackageId: parsed.data.customerPackageId,
      userId: user.id,
      datum
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath(`/klanten/${parsed.data.customerId}/print`);
    return { success: "Behandeling is bijgewerkt." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Bijwerken van de behandeling is mislukt."
    };
  }
}

export async function deleteTreatmentAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const treatmentId = Number(formData.get("treatmentId"));
  const customerId = Number(formData.get("customerId"));

  if (!Number.isInteger(treatmentId) || !Number.isInteger(customerId)) {
    throw new Error("Ongeldige behandeling geselecteerd.");
  }

  const behandeling = await prisma.treatment.findFirst({
    where: {
      id: treatmentId,
      salonId: user.salonId,
      customerId
    },
    select: { id: true }
  });

  if (!behandeling) {
    throw new Error("Behandeling niet gevonden.");
  }

  await rollbackTreatmentPackageUsage({
    treatmentId,
    salonId: user.salonId
  });

  await prisma.treatment.delete({
    where: { id: treatmentId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "TREATMENT_DELETED",
    entityType: "TREATMENT",
    entityId: treatmentId,
    message: "Behandeling verwijderd.",
    ipAddress,
    metadata: {
      customerId
    }
  });

  revalidatePath(`/klanten/${customerId}`);
  revalidatePath(`/klanten/${customerId}/print`);
  revalidatePath("/dashboard");
  redirect(`/klanten/${customerId}`);
}
