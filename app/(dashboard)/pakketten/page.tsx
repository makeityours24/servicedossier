import Link from "next/link";
import {
  createPackageTypeAction,
  deactivatePackageTypeAction,
  reactivatePackageTypeAction
} from "@/app/(dashboard)/pakketten/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { PackageTypeForm } from "@/components/package-type-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describePackagePrice, formatCurrencyFromCents } from "@/lib/utils";

export default async function PakkettenPage() {
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
          <span className="logo-label">Pakketten</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Digitale stempelkaarten
          </h2>
          <p className="subtitel">
            Beheer hier pakkettypes zoals 5x epileren of 6x toner. Deze vormen later de basis voor klantbundels en automatische afboeking per bezoek.
          </p>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Pakkettypes van deze salon</h3>
          <div className="info-kaart" style={{ marginTop: 18 }}>
            <strong>Architectuur</strong>
            <p style={{ marginTop: 10 }}>
              In deze eerste fase beheren we alleen de pakkettypes. Klantverkoop en afboeken per behandeling bouwen we daarna bovenop deze basis.
            </p>
          </div>

          <div className="lijst" style={{ marginTop: 18 }}>
            {packageTypes.length === 0 ? (
              <div className="leeg">Er zijn nog geen pakkettypes voor deze salon.</div>
            ) : (
              <>
                {actievePakketten.map((packageType) => (
                  <div className="lijst-item" key={packageType.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4>{packageType.naam}</h4>
                        <p className="meta">
                          <strong>Standaardbehandeling:</strong> {packageType.standaardBehandeling}
                          <br />
                          <strong>Pakket:</strong> {describePackagePrice(packageType.pakketPrijsCents, packageType.lossePrijsCents, packageType.totaalBeurten)}
                          <br />
                          <strong>Losse prijs:</strong> {formatCurrencyFromCents(packageType.lossePrijsCents)} per behandeling
                          <br />
                          <strong>Gekoppelde klantpakketten:</strong> {packageType._count.customerPackages}
                          {packageType.omschrijving ? (
                            <>
                              <br />
                              <strong>Omschrijving:</strong> {packageType.omschrijving}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span className="status-badge">Actief</span>
                    </div>

                    <div className="acties" style={{ marginTop: 16 }}>
                      <Link href={`/pakketten/${packageType.id}/bewerken`} className="knop-secundair">
                        Bewerken
                      </Link>
                      <form action={deactivatePackageTypeAction}>
                        <input type="hidden" name="packageTypeId" value={packageType.id} />
                        <DeleteCustomerButton
                          naam={packageType.naam}
                          label="Uitschakelen"
                          confirmMessage="Weet je zeker dat je pakkettype {naam} wilt uitschakelen? Het blijft wel bewaard voor bestaande klantpakketten."
                        />
                      </form>
                    </div>
                  </div>
                ))}

                {inactievePakketten.length > 0 ? (
                  <div className="kaart" style={{ marginTop: 12, padding: 20 }}>
                    <h4>Inactieve pakkettypes</h4>
                    <p className="subtitel" style={{ marginTop: 8 }}>
                      Deze pakketten zijn niet meer verkoopbaar, maar blijven zichtbaar voor historie en bestaande klantbundels.
                    </p>
                    <div className="lijst" style={{ marginTop: 16 }}>
                      {inactievePakketten.map((packageType) => (
                        <div className="lijst-item" key={packageType.id}>
                          <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4>{packageType.naam}</h4>
                              <p className="meta">
                                <strong>Standaardbehandeling:</strong> {packageType.standaardBehandeling}
                                <br />
                                <strong>Pakket:</strong> {describePackagePrice(packageType.pakketPrijsCents, packageType.lossePrijsCents, packageType.totaalBeurten)}
                                <br />
                                <strong>Gekoppelde klantpakketten:</strong> {packageType._count.customerPackages}
                              </p>
                            </div>
                            <span className="status-badge" data-inactive="true">
                              Inactief
                            </span>
                          </div>

                          <div className="acties" style={{ marginTop: 16 }}>
                            <Link href={`/pakketten/${packageType.id}/bewerken`} className="knop-secundair">
                              Bewerken
                            </Link>
                            <form action={reactivatePackageTypeAction}>
                              <input type="hidden" name="packageTypeId" value={packageType.id} />
                              <button type="submit" className="knop-secundair">
                                Opnieuw activeren
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
          <h3>Nieuw pakkettype</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Definieer hier eerst het pakket dat deze salon verkoopt. Daarna kunnen we het aan klanten koppelen en later per behandeling afboeken.
          </p>
          <PackageTypeForm action={createPackageTypeAction} submitLabel="Pakkettype toevoegen" />
        </aside>
      </section>
    </div>
  );
}
