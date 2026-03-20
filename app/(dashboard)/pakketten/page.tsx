import Link from "next/link";
import {
  createPackageTypeAction,
  deactivatePackageTypeAction,
  reactivatePackageTypeAction
} from "@/app/(dashboard)/pakketten/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { PackageTypeForm } from "@/components/package-type-form";
import { requireSalonSession } from "@/lib/auth";
import { getCurrentLocale, managementDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { describePackagePrice, formatCurrencyFromCents } from "@/lib/utils";

export default async function PakkettenPage() {
  const locale = await getCurrentLocale();
  const copy = managementDictionary[locale].packages;
  const user = await requireSalonSession();

  const packageTypes = await prisma.packageType.findMany({
    where: { salonId: user.salonId },
    orderBy: [{ isActief: "desc" }, { naam: "asc" }],
    include: {
      _count: {
        select: {
          customerPackages: true
        }
      }
    }
  });

  const actievePakketten = packageTypes.filter((packageType) => packageType.isActief);
  const inactievePakketten = packageTypes.filter((packageType) => !packageType.isActief);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{copy.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {copy.title}
          </h2>
          <p className="subtitel">{copy.subtitle}</p>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>{copy.packageTypesTitle}</h3>
          <div className="info-kaart" style={{ marginTop: 18 }}>
            <strong>{copy.architectureTitle}</strong>
            <p style={{ marginTop: 10 }}>{copy.architectureText}</p>
          </div>

          <div className="lijst" style={{ marginTop: 18 }}>
            {packageTypes.length === 0 ? (
              <div className="leeg">{copy.empty}</div>
            ) : (
              <>
                {actievePakketten.map((packageType) => (
                  <div className="lijst-item" key={packageType.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4>{packageType.naam}</h4>
                        <p className="meta">
                          <strong>{copy.defaultTreatment}:</strong> {packageType.standaardBehandeling}
                          <br />
                          <strong>{copy.type}:</strong>{" "}
                          {packageType.weergaveType === "STEMPELKAART" ? copy.stampCard : copy.bundlePackage}
                          <br />
                          <strong>{copy.packagePrice}:</strong>{" "}
                          {describePackagePrice(packageType.pakketPrijsCents, packageType.lossePrijsCents, packageType.totaalBeurten)}
                          <br />
                          <strong>{copy.singlePrice}:</strong> {formatCurrencyFromCents(packageType.lossePrijsCents)} {copy.perTreatment}
                          <br />
                          <strong>{copy.linkedCustomerPackages}:</strong> {packageType._count.customerPackages}
                          {packageType.omschrijving ? (
                            <>
                              <br />
                              <strong>{copy.description}:</strong> {packageType.omschrijving}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span className="status-badge">{copy.active}</span>
                    </div>

                    <div className="acties" style={{ marginTop: 16 }}>
                      <Link href={`/pakketten/${packageType.id}/bewerken`} className="knop-secundair">
                        {copy.edit}
                      </Link>
                      <form action={deactivatePackageTypeAction}>
                        <input type="hidden" name="packageTypeId" value={packageType.id} />
                        <DeleteCustomerButton
                          naam={packageType.naam}
                          label={copy.deactivate}
                          busyLabel={copy.deactivating}
                          confirmMessage={copy.deactivateConfirm}
                        />
                      </form>
                    </div>
                  </div>
                ))}

                {inactievePakketten.length > 0 ? (
                  <div className="kaart" style={{ marginTop: 12, padding: 20 }}>
                    <h4>{copy.inactivePackageTypes}</h4>
                    <p className="subtitel" style={{ marginTop: 8 }}>
                      {copy.inactiveText}
                    </p>
                    <div className="lijst" style={{ marginTop: 16 }}>
                      {inactievePakketten.map((packageType) => (
                        <div className="lijst-item" key={packageType.id}>
                          <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4>{packageType.naam}</h4>
                              <p className="meta">
                                <strong>{copy.defaultTreatment}:</strong> {packageType.standaardBehandeling}
                                <br />
                                <strong>{copy.type}:</strong>{" "}
                                {packageType.weergaveType === "STEMPELKAART" ? copy.stampCard : copy.bundlePackage}
                                <br />
                                <strong>{copy.packagePrice}:</strong>{" "}
                                {describePackagePrice(packageType.pakketPrijsCents, packageType.lossePrijsCents, packageType.totaalBeurten)}
                                <br />
                                <strong>{copy.linkedCustomerPackages}:</strong> {packageType._count.customerPackages}
                              </p>
                            </div>
                            <span className="status-badge" data-inactive="true">
                              {copy.inactive}
                            </span>
                          </div>

                          <div className="acties" style={{ marginTop: 16 }}>
                            <Link href={`/pakketten/${packageType.id}/bewerken`} className="knop-secundair">
                              {copy.edit}
                            </Link>
                            <form action={reactivatePackageTypeAction}>
                              <input type="hidden" name="packageTypeId" value={packageType.id} />
                              <button type="submit" className="knop-secundair">
                                {copy.reactivate}
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </article>

        <aside className="kaart">
          <h3>{copy.newPackageType}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {copy.newPackageTypeText}
          </p>
          <PackageTypeForm
            action={createPackageTypeAction}
            submitLabel={copy.addPackageType}
            dictionary={copy.form}
          />
        </aside>
      </section>
    </div>
  );
}
