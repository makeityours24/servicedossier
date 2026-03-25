# Installateurs Foundation

Dit document markeert de eerste technische scheiding tussen gedeelde platformcode en salon-specifieke domeinlogica.

## Doel

De codebase voorbereiden op drie logische lagen:

- `core`
- `salon`
- `installateurs`

## Huidige stap

De eerste refactor heeft de validatielaag opgesplitst in:

- `lib/core/validation/*`
- `lib/salon/validation.ts`

De bestaande `lib/validation.ts` blijft tijdelijk bestaan als compatibele barrel.

## Richtlijnen voor nieuwe code

- Gedeelde login-, sessie-, platform- en permissievalidaties gaan in `lib/core`.
- Salonregels voor klanten, behandelingen, pakketten en agenda gaan in `lib/salon`.
- Nieuwe installateursregels komen niet in `lib/validation.ts`, maar straks in `lib/installateurs`.

## Eerstvolgende technische stap

1. Gedeelde infrastructuur logisch onder `lib/core` samenbrengen.
2. Salonhelpers explicieter onder `lib/salon` plaatsen.
3. Daarna pas het eerste installateursdomein toevoegen.
