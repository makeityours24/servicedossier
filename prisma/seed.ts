import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const medewerker = await prisma.user.upsert({
    where: { email: "admin@salonluna.nl" },
    update: {},
    create: {
      naam: "Sanne de Vries",
      email: "admin@salonluna.nl",
      wachtwoord: hashPassword("Welkom123!")
    }
  });

  const klanten = await Promise.all([
    prisma.customer.upsert({
      where: { telefoonnummer: "0612345678" },
      update: {},
      create: {
        naam: "Eva Jansen",
        adres: "Bloemstraat 12, Amsterdam",
        telefoonnummer: "0612345678"
      }
    }),
    prisma.customer.upsert({
      where: { telefoonnummer: "0622334455" },
      update: {},
      create: {
        naam: "Mila Bakker",
        adres: "Havenweg 44, Haarlem",
        telefoonnummer: "0622334455"
      }
    }),
    prisma.customer.upsert({
      where: { telefoonnummer: "0633445566" },
      update: {},
      create: {
        naam: "Noor Visser",
        adres: "Lindelaan 3, Utrecht",
        telefoonnummer: "0633445566"
      }
    })
  ]);

  const bestaandAantal = await prisma.treatment.count();

  if (bestaandAantal === 0) {
    await prisma.treatment.createMany({
      data: [
        {
          customerId: klanten[0].id,
          userId: medewerker.id,
          datum: new Date("2026-02-10T10:00:00.000Z"),
          behandeling: "Volledige kleuring",
          recept: "7.3 + 8.1, 6% oxidatie, 35 minuten",
          behandelaar: medewerker.naam,
          notities: "Warme goudtoon, advies voor kleurshampoo gegeven."
        },
        {
          customerId: klanten[0].id,
          userId: medewerker.id,
          datum: new Date("2026-03-01T13:30:00.000Z"),
          behandeling: "Uitgroei bijwerken",
          recept: "7.0 + 7.1, 3% oxidatie, 25 minuten",
          behandelaar: medewerker.naam,
          notities: "Lengtes opgefrist met toner."
        },
        {
          customerId: klanten[1].id,
          userId: medewerker.id,
          datum: new Date("2026-02-19T09:15:00.000Z"),
          behandeling: "Balayage",
          recept: "Blondeerpoeder + 6%, toner 9.12",
          behandelaar: medewerker.naam,
          notities: "Koele blondtint behouden."
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
