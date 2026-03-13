import Link from "next/link";
import { createRecipeTemplateAction, deleteRecipeTemplateAction } from "@/app/(dashboard)/recepten/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { RecipeTemplateForm } from "@/components/recipe-template-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReceptenPage() {
  const user = await requireSalonSession();

  const templates = await prisma.recipeTemplate.findMany({
    where: { salonId: user.salonId },
    orderBy: { naam: "asc" }
  });

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Receptsjablonen</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Receptsjablonen
          </h2>
          <p className="subtitel">
            Bewaar veelgebruikte kleurrecepten per salon en laad ze later met één klik in een klantdossier.
          </p>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Bestaande sjablonen</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {templates.length === 0 ? (
              <div className="leeg">Er zijn nog geen receptsjablonen voor deze salon.</div>
            ) : (
              templates.map((template) => (
                <div className="lijst-item" key={template.id}>
                  <h4>{template.naam}</h4>
                  <p className="meta">
                    <strong>Behandeling:</strong> {template.behandeling}
                    <br />
                    <strong>Recept:</strong> {template.recept}
                    {template.notities ? (
                      <>
                        <br />
                        <strong>Notities:</strong> {template.notities}
                      </>
                    ) : null}
                  </p>
                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link href={`/recepten/${template.id}/bewerken`} className="knop-secundair">
                      Bewerken
                    </Link>
                    <form action={deleteRecipeTemplateAction}>
                      <input type="hidden" name="templateId" value={template.id} />
                      <DeleteCustomerButton
                        naam={template.naam}
                        confirmMessage="Weet je zeker dat je receptsjabloon {naam} wilt verwijderen?"
                      />
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="kaart">
          <h3>Nieuw receptsjabloon</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Voeg een veelgebruikt recept toe, zodat je het later direct in een klantdossier kunt laden.
          </p>
          <RecipeTemplateForm action={createRecipeTemplateAction} submitLabel="Sjabloon toevoegen" />
        </aside>
      </section>
    </div>
  );
}
