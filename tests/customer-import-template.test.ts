import test from "node:test";
import assert from "node:assert/strict";
import { buildCustomerImportPreview, getCustomerImportTemplate, parseCustomerImportFile } from "../lib/customer-import";

test("customer import template uses branch-specific column labels", () => {
  const massageTemplate = getCustomerImportTemplate("nl", "MASSAGE");
  const beautyTemplate = getCustomerImportTemplate("en", "BEAUTY");

  assert.deepEqual(massageTemplate.headers, [
    "Naam",
    "Telefoonnummer",
    "Adres",
    "Geboortedatum (YYYY-MM-DD)",
    "Allergieen",
    "Klachtengebied",
    "Drukvoorkeur",
    "Notities masseur"
  ]);

  assert.equal(beautyTemplate.headers[5], "Skin type");
  assert.equal(beautyTemplate.headers[6], "Skin condition");
  assert.equal(beautyTemplate.headers[7], "Specialist notes");
});

test("customer import template returns a csv with a header and example row", () => {
  const template = getCustomerImportTemplate("nl", "HAIR");
  const lines = template.csv.split("\n");

  assert.equal(lines.length, 2);
  assert.match(lines[0], /"Naam","Telefoonnummer","Adres"/);
  assert.match(lines[1], /"Eva Jansen","0612345678"/);
});

test("customer import preview validates rows from the template", async () => {
  const template = getCustomerImportTemplate("nl", "MASSAGE");
  const file = new File([template.csv], "klanten.csv", { type: "text/csv" });

  const preview = await buildCustomerImportPreview({
    file,
    locale: "nl",
    branchType: "MASSAGE"
  });

  assert.equal(preview.totalRows, 1);
  assert.equal(preview.validRows, 1);
  assert.equal(preview.invalidRows, 0);
  assert.equal(preview.previewRows[0]?.naam, "Eva Jansen");
});

test("customer import preview rejects duplicate phone numbers inside the same file", async () => {
  const template = getCustomerImportTemplate("nl", "HAIR");
  const csv = `${template.csv}\n"Test Klant","0612345678","Straat 2","1992-01-01","","Krullend","Bruin","Opmerking"`;
  const file = new File([csv], "klanten.csv", { type: "text/csv" });

  const preview = await buildCustomerImportPreview({
    file,
    locale: "nl",
    branchType: "HAIR"
  });

  assert.equal(preview.totalRows, 2);
  assert.equal(preview.validRows, 1);
  assert.equal(preview.invalidRows, 1);
  assert.match(preview.errors[0]?.message ?? "", /dubbel/);
});

test("customer import parser returns valid records for later bulk import", async () => {
  const template = getCustomerImportTemplate("nl", "HAIR");
  const file = new File([template.csv], "klanten.csv", { type: "text/csv" });

  const parsed = await parseCustomerImportFile({
    file,
    locale: "nl",
    branchType: "HAIR"
  });

  assert.equal(parsed.validRecords.length, 1);
  assert.equal(parsed.validRecords[0]?.telefoonnummer, "0612345678");
});
