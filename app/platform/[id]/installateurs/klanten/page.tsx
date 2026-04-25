import {
  createAssetAction,
  createCustomerAccountAction,
  createServiceLocationAction
} from "@/app/platform/[id]/installateurs/actions";
import { loadInstallateursData, isMissingInstallateurSchemaError } from "@/app/platform/[id]/installateurs/data";
import { InstallateurAssetForm } from "@/components/installateur-asset-form";
import { InstallateurCustomerAccountForm } from "@/components/installateur-customer-account-form";
import { InstallateurServiceLocationForm } from "@/components/installateur-service-location-form";
import { InstallateursModuleShell } from "@/components/installateurs-module-shell";
import { InstallateursSchemaFallback } from "@/components/installateurs-schema-fallback";
import { formatDate, formatDateOnly } from "@/lib/utils";
import Link from "next/link";

type PlatformInstallateursKlantenPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ zoek?: string }>;
};

export default async function PlatformInstallateursKlantenPage({
  params,
  searchParams
}: PlatformInstallateursKlantenPageProps) {
  const { id } = await params;
  const salonId = Number(id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const zoekterm = resolvedSearchParams?.zoek?.trim() ?? "";

  try {
    const data = await loadInstallateursData(salonId, zoekterm);

    return (
      <InstallateursModuleShell salonId={salonId} salonNaam={data.salonNaam} active="klanten">
        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Klanten</h3>
            <strong>{data.customerAccounts.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Locaties</h3>
            <strong>{data.totalLocations}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Installaties</h3>
            <strong>{data.totalAssets}</strong>
          </article>
        </section>

        <section className="kaart">
          <form className="acties" method="get" style={{ alignItems: "end", gap: 12 }}>
            <div className="veld" style={{ flex: 1, minWidth: 280 }}>
              <label htmlFor="zoek">Zoeken</label>
              <input
                id="zoek"
                name="zoek"
                defaultValue={zoekterm}
                placeholder="Zoek op naam, telefoon, adres, postcode of plaats"
              />
            </div>
            <button type="submit" className="knop">
              Zoek
            </button>
            {zoekterm ? (
              <a href={`/platform/${salonId}/installateurs/klanten`} className="knop-zacht">
                Wis filter
              </a>
            ) : null}
          </form>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Nieuwe installateurklant</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Gebruik deze klantstructuur voor bedrijven en particulieren. Servicelocaties en installaties worden daarna aan dezelfde klantketen gekoppeld.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurCustomerAccountForm salonId={salonId} action={createCustomerAccountAction} />
            </div>
          </article>

          <article className="kaart">
            <h3>Nieuwe servicelocatie</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Locaties zijn los van de klant, zodat zoeken op postcode en adres net zo logisch voelt als zoeken op naam.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurServiceLocationForm
                salonId={salonId}
                customers={data.customerOptions}
                action={createServiceLocationAction}
              />
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Nieuwe installatie</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Koppel installaties aan een servicelocatie zodat werkbonnen en servicehistorie straks op objectniveau zichtbaar worden.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurAssetForm salonId={salonId} customers={data.customerOptions} action={createAssetAction} />
          </div>
        </section>

        <section className="kaart">
          <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Klantenoverzicht</h3>
              <p className="meta" style={{ marginTop: 8 }}>
                {zoekterm
                  ? `Resultaten voor "${zoekterm}".`
                  : "Overzicht van bedrijven, locaties en gekoppelde installaties binnen deze tenant."}
              </p>
            </div>
            <span className="badge">{data.customerAccounts.length} klantaccounts</span>
          </div>

          <div className="lijst" style={{ marginTop: 18 }}>
            {data.customerAccounts.length === 0 ? (
              <div className="leeg">
                {zoekterm
                  ? "Geen installateurklanten gevonden met deze zoekterm."
                  : "Er zijn nog geen installateurklanten toegevoegd aan deze tenant."}
              </div>
            ) : (
              data.customerAccounts.map((customer) => (
                <div className="lijst-item" key={customer.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4>{customer.naam}</h4>
                      <p className="meta">
                        {customer.type === "BEDRIJF" ? "Bedrijf" : "Particulier"}
                        {customer.telefoon ? ` · ${customer.telefoon}` : ""}
                        {customer.email ? ` · ${customer.email}` : ""}
                        {customer.klantnummer ? ` · ${customer.klantnummer}` : ""}
                      </p>
                    </div>
                    <div className="acties" style={{ gap: 10 }}>
                      <span className="badge">{customer.locations.length} locatie(s) · {customer.assets.length} installatie(s)</span>
                      <Link href={`/platform/${salonId}/installateurs/klanten/${customer.id}`} className="knop-zacht">
                        Open klant
                      </Link>
                    </div>
                  </div>

                  {customer.locations.length === 0 ? (
                    <p className="meta" style={{ marginTop: 12 }}>
                      Nog geen servicelocaties gekoppeld.
                    </p>
                  ) : (
                    <div className="lijst" style={{ marginTop: 14 }}>
                      {customer.locations.map((location) => (
                        <div className="lijst-item" key={location.id}>
                          <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                            <h4>{location.naam ?? `${location.adresregel1}, ${location.plaats}`}</h4>
                            <Link
                              href={`/platform/${salonId}/installateurs/klanten/${customer.id}/locaties/${location.id}`}
                              className="knop-zacht"
                            >
                              Open locatie
                            </Link>
                          </div>
                          <p className="meta">
                            {location.adresregel1}
                            {location.adresregel2 ? `, ${location.adresregel2}` : ""}
                            <br />
                            {location.postcode} {location.plaats} · {location.land}
                            <br />
                            Toegevoegd op {formatDateOnly(location.createdAt)}
                          </p>
                          {location.assets.length > 0 ? (
                            <div className="lijst" style={{ marginTop: 12 }}>
                              {location.assets.map((asset) => (
                                <div className="lijst-item" key={asset.id}>
                                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <h4>
                                      {asset.type}
                                      {asset.merk || asset.model ? ` · ${[asset.merk, asset.model].filter(Boolean).join(" ")}` : ""}
                                    </h4>
                                    <Link
                                      href={`/platform/${salonId}/installateurs/klanten/${customer.id}/installaties/${asset.id}`}
                                      className="knop-zacht"
                                    >
                                      Open installatie
                                    </Link>
                                  </div>
                                  <p className="meta">
                                    Status: {asset.status}
                                    {asset.serienummer ? ` · Serienummer: ${asset.serienummer}` : ""}
                                    {asset.plaatsingsDatum ? ` · Geplaatst op ${formatDateOnly(asset.plaatsingsDatum)}` : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="meta" style={{ marginTop: 12 }}>
                    Laatst bijgewerkt: {formatDate(customer.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </InstallateursModuleShell>
    );
  } catch (error) {
    if (!isMissingInstallateurSchemaError(error)) {
      throw error;
    }

    return <InstallateursSchemaFallback />;
  }
}
