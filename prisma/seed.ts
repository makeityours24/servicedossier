import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const platformPasswordHash = await hashPassword("Platform123!");
  const ownerPasswordHash = await hashPassword("Welkom123!");

  await prisma.user.upsert({
    where: { email: "platform@miy24.nl" },
    update: {},
    create: {
      naam: "Platform Beheer",
      email: "platform@miy24.nl",
      wachtwoord: platformPasswordHash,
      moetWachtwoordWijzigen: false,
      isPlatformAdmin: true,
      rol: "ADMIN",
      status: "ACTIEF"
    }
  });

  const salon = await prisma.salon.upsert({
    where: { slug: "my-style" },
    update: {
      naam: "SalonDossier Demo",
      email: "info@salondossier-demo.nl",
      telefoonnummer: "0316240237",
      adres: "Marktstraat 35, 6901 AK Zevenaar",
      instellingen: {
        upsert: {
          update: {
            weergavenaam: "SalonDossier Demo",
            branchType: "HAIR",
            primaireKleur: "#b42323",
            contactEmail: "info@salondossier-demo.nl",
            contactTelefoon: "0316240237",
            adres: "Marktstraat 35, 6901 AK Zevenaar",
            treatmentPresets: [
              "Uitgroei kleuren",
              "Volledige kleuring",
              "Toner",
              "Balayage",
              "Highlights",
              "Kleurcorrectie"
            ]
          },
          create: {
            weergavenaam: "SalonDossier Demo",
            branchType: "HAIR",
            primaireKleur: "#b42323",
            contactEmail: "info@salondossier-demo.nl",
            contactTelefoon: "0316240237",
            adres: "Marktstraat 35, 6901 AK Zevenaar",
            treatmentPresets: [
              "Uitgroei kleuren",
              "Volledige kleuring",
              "Toner",
              "Balayage",
              "Highlights",
              "Kleurcorrectie"
            ]
          }
        }
      }
    },
    create: {
      naam: "SalonDossier Demo",
      slug: "my-style",
      email: "info@salondossier-demo.nl",
      telefoonnummer: "0316240237",
      adres: "Marktstraat 35, 6901 AK Zevenaar",
      instellingen: {
        create: {
          weergavenaam: "SalonDossier Demo",
          branchType: "HAIR",
          primaireKleur: "#b42323",
          contactEmail: "info@salondossier-demo.nl",
          contactTelefoon: "0316240237",
          adres: "Marktstraat 35, 6901 AK Zevenaar",
          treatmentPresets: [
            "Uitgroei kleuren",
            "Volledige kleuring",
            "Toner",
            "Balayage",
            "Highlights",
            "Kleurcorrectie"
          ]
        }
      }
    }
  });

  const medewerker = await prisma.user.upsert({
    where: { email: "admin@salonluna.nl" },
    update: {},
    create: {
      salonId: salon.id,
      naam: "Sanne de Vries",
      email: "admin@salonluna.nl",
      wachtwoord: ownerPasswordHash,
      moetWachtwoordWijzigen: false,
      isPlatformAdmin: false,
      rol: "OWNER",
      status: "ACTIEF"
    },
    select: {
      id: true,
      naam: true,
      salonId: true
    }
  });

  const klanten = await Promise.all([
    prisma.customer.upsert({
      where: {
        salonId_telefoonnummer: {
          salonId: salon.id,
          telefoonnummer: "0612345678"
        }
      },
      update: {},
      create: {
        salonId: salon.id,
        naam: "Eva Jansen",
        adres: "Bloemstraat 12, Amsterdam",
        telefoonnummer: "0612345678"
      }
    }),
    prisma.customer.upsert({
      where: {
        salonId_telefoonnummer: {
          salonId: salon.id,
          telefoonnummer: "0622334455"
        }
      },
      update: {},
      create: {
        salonId: salon.id,
        naam: "Mila Bakker",
        adres: "Havenweg 44, Haarlem",
        telefoonnummer: "0622334455"
      }
    }),
    prisma.customer.upsert({
      where: {
        salonId_telefoonnummer: {
          salonId: salon.id,
          telefoonnummer: "0633445566"
        }
      },
      update: {},
      create: {
        salonId: salon.id,
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
          salonId: salon.id,
          customerId: klanten[0].id,
          userId: medewerker.id,
          datum: new Date("2026-02-10T10:00:00.000Z"),
          behandeling: "Volledige kleuring",
          recept: "7.3 + 8.1, 6% oxidatie, 35 minuten",
          behandelaar: medewerker.naam,
          notities: "Warme goudtoon, advies voor kleurshampoo gegeven."
        },
        {
          salonId: salon.id,
          customerId: klanten[0].id,
          userId: medewerker.id,
          datum: new Date("2026-03-01T13:30:00.000Z"),
          behandeling: "Uitgroei bijwerken",
          recept: "7.0 + 7.1, 3% oxidatie, 25 minuten",
          behandelaar: medewerker.naam,
          notities: "Lengtes opgefrist met toner."
        },
        {
          salonId: salon.id,
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

  const bestaandAantalSjablonen = await prisma.recipeTemplate.count({
    where: { salonId: salon.id }
  });

  if (bestaandAantalSjablonen === 0) {
    await prisma.recipeTemplate.createMany({
      data: [
        {
          salonId: salon.id,
          naam: "Uitgroei basis blond",
          behandeling: "Uitgroei kleuren",
          recept: "7.0 + 7.1, 3% oxidatie, 25 minuten",
          notities: "Geschikt voor neutrale koele dekking bij uitgroei."
        },
        {
          salonId: salon.id,
          naam: "Warme volledige kleuring",
          behandeling: "Volledige kleuring",
          recept: "7.3 + 8.1, 6% oxidatie, 35 minuten",
          notities: "Voor zachte warme goudtoon met extra glans."
        },
        {
          salonId: salon.id,
          naam: "Balayage toner koel",
          behandeling: "Balayage met toner",
          recept: "Blondeerpoeder + 6%, toner 9.12",
          notities: "Koele blondtint behouden, lengtes goed bewaken."
        }
      ]
    });
  }

  const bestaandAantalPakketten = await prisma.packageType.count({
    where: { salonId: salon.id }
  });

  if (bestaandAantalPakketten === 0) {
    await prisma.packageType.createMany({
      data: [
        {
          salonId: salon.id,
          naam: "5x epileren",
          omschrijving: "Voordelig bundelpakket voor terugkerende epilatie-afspraken.",
          totaalBeurten: 5,
          pakketPrijsCents: 3000,
          lossePrijsCents: 750,
          standaardBehandeling: "Epileren",
          weergaveType: "STEMPELKAART",
          isActief: true
        },
        {
          salonId: salon.id,
          naam: "6x toner",
          omschrijving: "Onderhoudspakket voor kleurverfrissing tussen grotere behandelingen door.",
          totaalBeurten: 6,
          pakketPrijsCents: 4800,
          lossePrijsCents: 900,
          standaardBehandeling: "Toner",
          weergaveType: "PAKKET",
          isActief: true
        },
        {
          salonId: salon.id,
          naam: "10x wenkbrauwen",
          omschrijving: "Digitale stempelkaart voor vaste wenkbrauwbehandelingen.",
          totaalBeurten: 10,
          pakketPrijsCents: 6500,
          lossePrijsCents: 750,
          standaardBehandeling: "Wenkbrauwen",
          weergaveType: "STEMPELKAART",
          isActief: true
        }
      ]
    });
  }

  const bestaandAantalAfspraken = await prisma.appointment.count({
    where: { salonId: salon.id }
  });

  if (bestaandAantalAfspraken === 0) {
    await prisma.appointment.createMany({
      data: [
        {
          salonId: salon.id,
          customerId: klanten[0].id,
          userId: medewerker.id,
          datumStart: new Date("2026-03-17T09:00:00.000Z"),
          datumEinde: new Date("2026-03-17T09:30:00.000Z"),
          behandeling: "Uitgroei kleuren",
          notities: "Controleer of het pakket nog actief is.",
          status: "GEPLAND"
        },
        {
          salonId: salon.id,
          customerId: klanten[1].id,
          userId: medewerker.id,
          datumStart: new Date("2026-03-17T10:00:00.000Z"),
          datumEinde: new Date("2026-03-17T10:45:00.000Z"),
          behandeling: "Balayage toner",
          notities: "Koele toner klaarzetten.",
          status: "GEPLAND"
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
