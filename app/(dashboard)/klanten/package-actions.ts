"use server";

import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { customerPackageSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

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
          weergaveType: true,
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
        weergaveTypeSnapshot: packageType.weergaveType,
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
