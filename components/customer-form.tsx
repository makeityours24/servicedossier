"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { formatDateInput } from "@/lib/utils";

export type FormState = {
  error?: string;
  success?: string;
  createdCustomerId?: number;
  createdCustomerName?: string;
};

const initialState: FormState = {};

type CustomerFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  busyLabel?: string;
  dictionary?: {
    draftInfo: string;
    name: string;
    phone: string;
    birthDate: string;
    hairType: string;
    hairTypePlaceholder: string;
    hairColor: string;
    hairColorPlaceholder: string;
    address: string;
    allergies: string;
    allergiesPlaceholder: string;
    stylistNotes: string;
    stylistNotesPlaceholder: string;
    saveBusy: string;
    cancel: string;
  };
  customer?: {
    id?: number;
    naam: string;
    adres: string;
    telefoonnummer: string;
    geboortedatum?: Date | string | null;
    allergieen?: string | null;
    haartype?: string | null;
    haarkleur?: string | null;
    stylistNotities?: string | null;
  };
};

const defaultDictionary = {
  draftInfo: "Concept wordt lokaal bewaard zolang je bezig bent.",
  name: "Naam",
  phone: "Telefoonnummer",
  birthDate: "Geboortedatum",
  hairType: "Haartype",
  hairTypePlaceholder: "Bijvoorbeeld krullend, fijn, dik",
  hairColor: "Haarkleur",
  hairColorPlaceholder: "Bijvoorbeeld donkerblond, koper, zwart",
  address: "Adres",
  allergies: "Allergieen",
  allergiesPlaceholder: "Bijvoorbeeld gevoelig voor blondering, parfum of specifieke producten",
  stylistNotes: "Notities stylist",
  stylistNotesPlaceholder: "Bijvoorbeeld aandachtspunten, voorkeuren of belangrijke observaties",
  saveBusy: "Opslaan...",
  cancel: "Annuleren"
};

export function CustomerForm({
  action,
  submitLabel,
  busyLabel,
  dictionary = defaultDictionary,
  customer
}: CustomerFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const storageKey = useMemo(
    () => `salondossier:customer-form:${customer?.id ?? "new"}`,
    [customer?.id]
  );
  const [naam, setNaam] = useState(customer?.naam ?? "");
  const [telefoonnummer, setTelefoonnummer] = useState(customer?.telefoonnummer ?? "");
  const [geboortedatum, setGeboortedatum] = useState(
    customer?.geboortedatum ? formatDateInput(customer.geboortedatum) : ""
  );
  const [haartype, setHaartype] = useState(customer?.haartype ?? "");
  const [haarkleur, setHaarkleur] = useState(customer?.haarkleur ?? "");
  const [adres, setAdres] = useState(customer?.adres ?? "");
  const [allergieen, setAllergieen] = useState(customer?.allergieen ?? "");
  const [stylistNotities, setStylistNotities] = useState(customer?.stylistNotities ?? "");
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem(storageKey);
    if (!savedDraft) {
      setNaam(customer?.naam ?? "");
      setTelefoonnummer(customer?.telefoonnummer ?? "");
      setGeboortedatum(customer?.geboortedatum ? formatDateInput(customer.geboortedatum) : "");
      setHaartype(customer?.haartype ?? "");
      setHaarkleur(customer?.haarkleur ?? "");
      setAdres(customer?.adres ?? "");
      setAllergieen(customer?.allergieen ?? "");
      setStylistNotities(customer?.stylistNotities ?? "");
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as {
        naam?: string;
        telefoonnummer?: string;
        geboortedatum?: string;
        haartype?: string;
        haarkleur?: string;
        adres?: string;
        allergieen?: string;
        stylistNotities?: string;
      };

      setNaam(parsed.naam ?? customer?.naam ?? "");
      setTelefoonnummer(parsed.telefoonnummer ?? customer?.telefoonnummer ?? "");
      setGeboortedatum(
        parsed.geboortedatum ?? (customer?.geboortedatum ? formatDateInput(customer.geboortedatum) : "")
      );
      setHaartype(parsed.haartype ?? customer?.haartype ?? "");
      setHaarkleur(parsed.haarkleur ?? customer?.haarkleur ?? "");
      setAdres(parsed.adres ?? customer?.adres ?? "");
      setAllergieen(parsed.allergieen ?? customer?.allergieen ?? "");
      setStylistNotities(parsed.stylistNotities ?? customer?.stylistNotities ?? "");
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [customer, storageKey]);

  useEffect(() => {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        naam,
        telefoonnummer,
        geboortedatum,
        haartype,
        haarkleur,
        adres,
        allergieen,
        stylistNotities
      })
    );
    setHasDraft(
      Boolean(
        naam ||
          telefoonnummer ||
          geboortedatum ||
          haartype ||
          haarkleur ||
          adres ||
          allergieen ||
          stylistNotities
      )
    );
  }, [
    adres,
    allergieen,
    geboortedatum,
    haarkleur,
    haartype,
    naam,
    storageKey,
    stylistNotities,
    telefoonnummer
  ]);

  useEffect(() => {
    if (state.success) {
      window.sessionStorage.removeItem(storageKey);
      setHasDraft(false);
    }
  }, [state.success, storageKey]);

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
      {customer?.id ? <input type="hidden" name="customerId" value={customer.id} /> : null}
      <FormMessage error={state.error} success={state.success} />
      {!state.error && !state.success && hasDraft ? (
        <p className="melding-info">{dictionary.draftInfo}</p>
      ) : null}

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">{dictionary.name}</label>
          <input id="naam" name="naam" value={naam} onChange={(event) => setNaam(event.target.value)} required />
        </div>

        <div className="veld">
          <label htmlFor="telefoonnummer">{dictionary.phone}</label>
          <input
            id="telefoonnummer"
            name="telefoonnummer"
            value={telefoonnummer}
            onChange={(event) => setTelefoonnummer(event.target.value)}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="geboortedatum">{dictionary.birthDate}</label>
          <input
            id="geboortedatum"
            name="geboortedatum"
            type="date"
            value={geboortedatum}
            onChange={(event) => setGeboortedatum(event.target.value)}
          />
        </div>

        <div className="veld">
          <label htmlFor="haartype">{dictionary.hairType}</label>
          <input
            id="haartype"
            name="haartype"
            value={haartype}
            onChange={(event) => setHaartype(event.target.value)}
            placeholder={dictionary.hairTypePlaceholder}
          />
        </div>

        <div className="veld">
          <label htmlFor="haarkleur">{dictionary.hairColor}</label>
          <input
            id="haarkleur"
            name="haarkleur"
            value={haarkleur}
            onChange={(event) => setHaarkleur(event.target.value)}
            placeholder={dictionary.hairColorPlaceholder}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">{dictionary.address}</label>
          <textarea id="adres" name="adres" value={adres} onChange={(event) => setAdres(event.target.value)} required />
        </div>

        <div className="veld-groot">
          <label htmlFor="allergieen">{dictionary.allergies}</label>
          <textarea
            id="allergieen"
            name="allergieen"
            value={allergieen}
            onChange={(event) => setAllergieen(event.target.value)}
            placeholder={dictionary.allergiesPlaceholder}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="stylistNotities">{dictionary.stylistNotes}</label>
          <textarea
            id="stylistNotities"
            name="stylistNotities"
            value={stylistNotities}
            onChange={(event) => setStylistNotities(event.target.value)}
            placeholder={dictionary.stylistNotesPlaceholder}
          />
        </div>
      </div>

      <div className="knoppenrij">
        <SubmitButton label={submitLabel} bezigLabel={busyLabel ?? dictionary.saveBusy} />
        <Link href="/klanten" className="knop-secundair">
          {dictionary.cancel}
        </Link>
      </div>
    </form>
  );
}
