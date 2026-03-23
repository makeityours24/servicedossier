import test from "node:test";
import assert from "node:assert/strict";
import { getCustomerImportTemplate } from "../lib/customer-import";

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
