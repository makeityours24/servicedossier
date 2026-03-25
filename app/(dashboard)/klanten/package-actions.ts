"use server";

import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { customerPackageCorrectionSchema, customerPackageSchema } from "@/lib/salon/validation";
import { revalidatePath } from "next/cache";
import {
  applyPackageUsage,
  getPackageStatusForRemainingSessions
} from "@/lib/treatment-workflows";

function buildNewPackageSuggestion(customerId: number) {
  return {
    suggestionHref: `/klanten/${customerId}#pakket-toevoegen`,
    suggestionLabel: "Nieuwe kaart toevoegen"
  };
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
    const nextState: FormState = {
      success:
        parsed.data.invoerType === "OVERNAME"
          ? "Bestaande kaart is met de huidige stand overgenomen."
          : "Pakket is aan de klant toegevoegd."
    };

    if (resterendeBeurten === 0) {
      Object.assign(nextState, buildNewPackageSuggestion(customer.id));
    }

    return nextState;
  } catch {
    return { error: "Opslaan van het klantpakket is mislukt." };
  }
}

export async function correctCustomerPackageAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = customerPackageCorrectionSchema.safeParse({
    customerPackageId: formData.get("customerPackageId"),
    richting: formData.get("richting"),
    aantal: formData.get("aantal"),
    notitie: formData.get("notitie")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de correctie." };
  }

  try {
    const customerPackage = await prisma.customerPackage.findFirst({
      where: {
        id: parsed.data.customerPackageId,
        salonId: user.salonId
      },
      select: {
        id: true,
        customerId: true,
        naamSnapshot: true,
        totaalBeurten: true,
        resterendeBeurten: true,
        customer: {
          select: {
            naam: true
          }
        }
      }
    });

    if (!customerPackage) {
      return { error: "Dit pakket hoort niet bij deze salon." };
    }

    const isTerugzetten = parsed.data.richting === "TERUGZETTEN";
    let nieuweResterendeBeurten = customerPackage.resterendeBeurten;

    if (isTerugzetten) {
      nieuweResterendeBeurten = customerPackage.resterendeBeurten + parsed.data.aantal;

      if (nieuweResterendeBeurten > customerPackage.totaalBeurten) {
        return {
          error: `Je kunt maximaal terugzetten tot ${customerPackage.totaalBeurten} beurten.`
        };
      }
    } else {
      nieuweResterendeBeurten = applyPackageUsage({
        resterendeBeurten: customerPackage.resterendeBeurten,
        aantalAfgeboekt: parsed.data.aantal
      }).resterendeBeurten;
    }

    const status = getPackageStatusForRemainingSessions(nieuweResterendeBeurten);

    await prisma.$transaction([
      prisma.customerPackageUsage.create({
        data: {
          salonId: user.salonId,
          customerPackageId: customerPackage.id,
          customerId: customerPackage.customerId,
          userId: user.id,
          datum: new Date(),
          aantalAfgeboekt: isTerugzetten ? -parsed.data.aantal : parsed.data.aantal,
          notitie: parsed.data.notitie
        }
      }),
      prisma.customerPackage.update({
        where: { id: customerPackage.id },
        data: {
          resterendeBeurten: nieuweResterendeBeurten,
          status
        }
      })
    ]);

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "CUSTOMER_PACKAGE_CORRECTED",
      entityType: "CustomerPackage",
      entityId: customerPackage.id,
      message: `${isTerugzetten ? "Correctie teruggezet" : "Correctie afgeboekt"} voor ${customerPackage.customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customerPackage.customerId,
        customerName: customerPackage.customer.naam,
        packageName: customerPackage.naamSnapshot,
        richting: parsed.data.richting,
        aantal: parsed.data.aantal,
        resterendeBeurten: nieuweResterendeBeurten,
        notitie: parsed.data.notitie
      }
    });

    revalidatePath(`/klanten/${customerPackage.customerId}`);
    revalidatePath("/dashboard");
    const nextState: FormState = {
      success: isTerugzetten
        ? "Correctie opgeslagen. De beurt is teruggezet."
        : "Correctie opgeslagen. De beurt is afgeboekt."
    };

    if (!isTerugzetten && nieuweResterendeBeurten === 0) {
      Object.assign(nextState, buildNewPackageSuggestion(customerPackage.customerId));
    }

    return nextState;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Opslaan van de correctie is mislukt."
    };
  }
}
