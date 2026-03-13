import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateRecipeTemplateAction } from "@/app/(dashboard)/recepten/actions";
import { RecipeTemplateForm } from "@/components/recipe-template-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BewerkReceptPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkReceptPage({ params }: BewerkReceptPageProps) {
  const user = await requireSalonSession();

  if (user.rol === "MEDEWERKER") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const templateId = Number(id);

  if (!Number.isInteger(templateId)) {
    notFound();
  }

  const template = await prisma.recipeTemplate.findFirst({
    where: {
      id: templateId,
      salonId: user.salonId
    },
    select: {
      id: true,
      naam: true,
      behandeling: true,
      recept: true,
      notities: true
    }
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Receptsjablonen</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Sjabloon bewerken
          </h2>
          <p className="subtitel">
            Werk dit receptsjabloon bij zodat het team het direct opnieuw kan gebruiken.
          </p>
        </div>

        <Link href="/recepten" className="knop-secundair">
          Terug naar sjablonen
        </Link>
      </section>

      <section className="kaart">
        <RecipeTemplateForm
          action={updateRecipeTemplateAction}
          submitLabel="Sjabloon opslaan"
          template={template}
        />
      </section>
    </div>
  );
}
