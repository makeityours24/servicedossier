export function InstallateursSchemaFallback() {
  return (
    <div className="rooster">
      <section className="kaart">
        <h2 className="pagina-titel" style={{ fontSize: "2rem" }}>
          Installateursmodule nog niet actief
        </h2>
        <p className="meta" style={{ marginTop: 14 }}>
          De eerste installateurstabellen staan al in de code, maar de database is nog niet bijgewerkt. Voer eerst de Prisma database-update uit voordat je klanten, werkbonnen en portalgebruikers kunt beheren.
        </p>
      </section>
    </div>
  );
}
