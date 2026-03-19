"use server";

import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { customerPackageSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { getPackageStatusForRemainingSessions } from "@/lib/treatment-workflows";

export async function createCustomerPackageAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = customerPackageSchema.safeParse({
    customerId: formData.get("customerId"),
    packageTypeId: formData.get("packageTypeId"),
    invoerType: formData.get("invoerType"),
    resterendeBeurten: formData.get("resterendeBeurten"),
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

    const resterendeBeurten =
      parsed.data.invoerType === "OVERNAME"
        ? parsed.data.resterendeBeurten
        : packageType.totaalBeurten;

    if (parsed.data.invoerType === "OVERNAME" && resterendeBeurten === null) {
      return { error: "Vul in hoeveel beurten nog over zijn op de bestaande kaart." };
    }

    if (resterendeBeurten === null || resterendeBeurten < 0) {
      return { error: "Gebruik een geldig aantal resterende beurten." };
    }

    if (resterendeBeurten > packageType.totaalBeurten) {
      return {
        error: `Een ${packageType.naam} heeft maximaal ${packageType.totaalBeurten} beurten.`
      };
    }

    const overnameNotitie =
      parsed.data.invoerType === "OVERNAME" && !parsed.data.notities
        ? "Overgenomen van bestaande kaart."
        : null;

    const customerPackage = await prisma.customerPackage.create({
      data: {
        salonId: user.salonId,
        customerId: customer.id,
        packageTypeId: packageType.id,
        naamSnapshot: packageType.naam,
        standaardBehandelingSnapshot: packageType.standaardBehandeling,
        weergaveTypeSnapshot: packageType.weergaveType,
        totaalBeurten: packageType.totaalBeurten,
        resterendeBeurten,
        pakketPrijsCents: packageType.pakketPrijsCents,
        lossePrijsCents: packageType.lossePrijsCents,
        status: getPackageStatusForRemainingSessions(resterendeBeurten),
        notities: parsed.data.notities || overnameNotitie
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
        totalSessions: packageType.totaalBeurten,
        remainingSessions: resterendeBeurten,
        invoerType: parsed.data.invoerType
      }
    });

    revalidatePath(`/klanten/${customer.id}`);
    return {
      success:
        parsed.data.invoerType === "OVERNAME"
          ? "Bestaande kaart is met de huidige stand overgenomen."
          : "Pakket is aan de klant toegevoegd."
    };
  } catch {
    return { error: "Opslaan van het klantpakket is mislukt." };
  }
}
