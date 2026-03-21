"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";

const initialState: FormState = {};

type TreatmentFormProps = {
  customerId: number;
  medewerkerNaam: string;
  medewerkers: Array<{
    id: number;
    naam: string;
  }>;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  busyLabel?: string;
  dictionary?: {
    draftInfo: string;
    quickChoices: string;
    dateTime: string;
    stylist: string;
    chooseStylist: string;
    treatment: string;
    treatmentPlaceholder: string;
    recipe: string;
    recipePlaceholder: string;
    notesOptional: string;
    notesPlaceholder: string;
    deductPackageOptional: string;
    noPackage: string;
    stampCard: string;
    packageLabel: string;
    saveBusy: string;
    soldOutSuggestionText: string;
    soldOutSuggestionLabel: string;
  };
  treatment?: {
    id?: number;
    appointmentId?: number | null;
    behandelaarUserId?: number | null;
    datum: string;
    behandeling: string;
    recept: string;
    behandelaar: string;
    notities?: string | null;
    customerPackageId?: number | null;
  };
  helperText?: string;
  treatmentPresets?: readonly string[];
  activePackages?: Array<{
    id: number;
    naamSnapshot: string;
    weergaveTypeSnapshot?: "PAKKET" | "STEMPELKAART";
    resterendeBeurten: number;
    totaalBeurten: number;
  }>;
};

const defaultDictionary = {
  draftInfo: "Concept wordt lokaal bewaard zolang je bezig bent.",
  quickChoices: "Snelle keuze voor veelgebruikte behandelingen:",
  dateTime: "Datum en tijd",
  stylist: "Behandelaar",
  chooseStylist: "Kies een behandelaar",
  treatment: "Behandeling",
  treatmentPlaceholder: "Bijvoorbeeld uitgroei kleuren",
  recipe: "Recept",
  recipePlaceholder: "Bijvoorbeeld 7.0 + 7.1, 3% oxidatie, 25 minuten",
  notesOptional: "Notities (optioneel)",
  notesPlaceholder: "Extra opmerkingen of advies",
  deductPackageOptional: "Afboeken van pakket (optioneel)",
  noPackage: "Geen pakket gebruiken",
  stampCard: "stempelkaart",
  packageLabel: "pakket",
  saveBusy: "Opslaan...",
  soldOutSuggestionText: "Deze kaart is nu volledig gebruikt. Je kunt direct een nieuwe kaart toevoegen.",
  soldOutSuggestionLabel: "Nieuwe kaart toevoegen"
};

export function TreatmentForm({
  customerId,
  medewerkerNaam,
  medewerkers,
  action,
  submitLabel = "Behandeling opslaan",
  busyLabel,
  dictionary = defaultDictionary,
  treatment,
  helperText,
  treatmentPresets = [],
  activePackages = []
}: TreatmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const vandaag = new Date().toISOString().slice(0, 16);
  const [datum, setDatum] = useState(treatment?.datum ?? vandaag);
  const initialBehandelaarUserId =
    treatment?.behandelaarUserId ?? medewerkers.find((medewerker) => medewerker.naam === medewerkerNaam)?.id ?? null;
  const [behandelaarUserId, setBehandelaarUserId] = useState(
    initialBehandelaarUserId ? String(initialBehandelaarUserId) : ""
  );
  const [behandelaar, setBehandelaar] = useState(treatment?.behandelaar ?? medewerkerNaam);
  const [behandeling, setBehandeling] = useState(treatment?.behandeling ?? "");
  const [recept, setRecept] = useState(treatment?.recept ?? "");
  const [notities, setNotities] = useState(treatment?.notities ?? "");
  const [customerPackageId, setCustomerPackageId] = useState(
    treatment?.customerPackageId ? String(treatment.customerPackageId) : ""
  );
  const draftKey = `salondossier:treatment-form:${customerId}:${treatment?.id ?? treatment?.appointmentId ?? "new"}`;
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as {
          datum?: string;
          behandelaarUserId?: string;
          behandelaar?: string;
          behandeling?: string;
          recept?: string;
          notities?: string;
          customerPackageId?: string;
        };

        setDatum(parsed.datum ?? treatment?.datum ?? vandaag);
        setBehandelaarUserId(
          parsed.behandelaarUserId ??
            (treatment?.behandelaarUserId ? String(treatment.behandelaarUserId) : initialBehandelaarUserId ? String(initialBehandelaarUserId) : "")
        );
        setBehandelaar(parsed.behandelaar ?? treatment?.behandelaar ?? medewerkerNaam);
        setBehandeling(parsed.behandeling ?? treatment?.behandeling ?? "");
        setRecept(parsed.recept ?? treatment?.recept ?? "");
        setNotities(parsed.notities ?? treatment?.notities ?? "");
        setCustomerPackageId(
          parsed.customerPackageId ?? (treatment?.customerPackageId ? String(treatment.customerPackageId) : "")
        );
        return;
      } catch {
        window.sessionStorage.removeItem(draftKey);
      }
    }

    setDatum(treatment?.datum ?? vandaag);
    setBehandelaarUserId(
      treatment?.behandelaarUserId ? String(treatment.behandelaarUserId) : initialBehandelaarUserId ? String(initialBehandelaarUserId) : ""
    );
    setBehandelaar(treatment?.behandelaar ?? medewerkerNaam);
    setBehandeling(treatment?.behandeling ?? "");
    setRecept(treatment?.recept ?? "");
    setNotities(treatment?.notities ?? "");
    setCustomerPackageId(treatment?.customerPackageId ? String(treatment.customerPackageId) : "");
  }, [draftKey, initialBehandelaarUserId, medewerkerNaam, treatment, vandaag]);

  useEffect(() => {
    const geselecteerdeMedewerker = medewerkers.find(
      (medewerker) => String(medewerker.id) === behandelaarUserId
    );

    if (geselecteerdeMedewerker) {
      setBehandelaar(geselecteerdeMedewerker.naam);
      return;
    }

    if (!behandelaarUserId && !treatment?.behandelaar) {
      setBehandelaar(medewerkerNaam);
    }
  }, [behandelaarUserId, medewerkerNaam, medewerkers, treatment?.behandelaar]);

  useEffect(() => {
    window.sessionStorage.setItem(
      draftKey,
      JSON.stringify({
        datum,
        behandelaarUserId,
        behandelaar,
        behandeling,
        recept,
        notities,
        customerPackageId
      })
    );
    setHasDraft(
      Boolean(
        datum || behandelaarUserId || behandelaar || behandeling || recept || notities || customerPackageId
      )
    );
  }, [behandeling, behandelaar, behandelaarUserId, customerPackageId, datum, draftKey, notities, recept]);

  useEffect(() => {
    if (state.success) {
      window.sessionStorage.removeItem(draftKey);
      setHasDraft(false);
    }
  }, [draftKey, state.success]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasDraft || state.success) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDraft, state.success]);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      {treatment?.id ? <input type="hidden" name="treatmentId" value={treatment.id} /> : null}
      {treatment?.appointmentId ? (
        <input type="hidden" name="appointmentId" value={treatment.appointmentId} />
      ) : null}
      <FormMessage error={state.error} success={state.success} />
      {state.success && state.suggestionHref && state.suggestionLabel ? (
        <div className="melding-info" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{state.suggestionText ?? dictionary.soldOutSuggestionText}</span>
          <Link href={state.suggestionHref} className="knop-zacht">
            {state.suggestionLabel ?? dictionary.soldOutSuggestionLabel}
          </Link>
        </div>
      ) : null}
      {!state.error && !state.success && hasDraft ? (
        <p className="melding-info">{dictionary.draftInfo}</p>
      ) : null}
      {helperText ? <p className="subtitel" style={{ marginTop: 0 }}>{helperText}</p> : null}
      <div>
        <p className="meta" style={{ marginBottom: 12 }}>
          {dictionary.quickChoices}
        </p>
        <div className="acties">
          {treatmentPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={behandeling === preset ? "knop" : "knop-zacht"}
              onClick={() => setBehandeling(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="datum">{dictionary.dateTime}</label>
          <input
            id="datum"
            name="datum"
            type="datetime-local"
            value={datum}
            onChange={(event) => setDatum(event.target.value)}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="behandelaarUserId">{dictionary.stylist}</label>
          <select
            id="behandelaarUserId"
            name="behandelaarUserId"
            value={behandelaarUserId}
            onChange={(event) => setBehandelaarUserId(event.target.value)}
            required
          >
            <option value="" disabled>
              {dictionary.chooseStylist}
            </option>
            {medewerkers.map((medewerker) => (
              <option key={medewerker.id} value={medewerker.id}>
                {medewerker.naam}
              </option>
            ))}
          </select>
          <input type="hidden" name="behandelaar" value={behandelaar} />
        </div>

        <div className="veld-groot">
          <label htmlFor="behandeling">{dictionary.treatment}</label>
          <input
            id="behandeling"
            name="behandeling"
            placeholder={dictionary.treatmentPlaceholder}
            value={behandeling}
            onChange={(event) => setBehandeling(event.target.value)}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="recept">{dictionary.recipe}</label>
          <textarea
            id="recept"
            name="recept"
            placeholder={dictionary.recipePlaceholder}
            value={recept}
            onChange={(event) => setRecept(event.target.value)}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">{dictionary.notesOptional}</label>
          <textarea
            id="notities"
            name="notities"
            placeholder={dictionary.notesPlaceholder}
            value={notities}
            onChange={(event) => setNotities(event.target.value)}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="customerPackageId">{dictionary.deductPackageOptional}</label>
          <select
            id="customerPackageId"
            name="customerPackageId"
            value={customerPackageId}
            onChange={(event) => setCustomerPackageId(event.target.value)}
          >
            <option value="">{dictionary.noPackage}</option>
            {activePackages.map((customerPackage) => (
              <option key={customerPackage.id} value={customerPackage.id}>
                {customerPackage.naamSnapshot} - nog {customerPackage.resterendeBeurten} van{" "}
                {customerPackage.totaalBeurten} (
                {customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
                  ? dictionary.stampCard
                  : dictionary.packageLabel}
                )
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={busyLabel ?? dictionary.saveBusy} />
    </form>
  );
}
