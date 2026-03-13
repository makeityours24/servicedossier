"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { PlatformSalonFormState } from "@/app/platform/actions";

const initialState: PlatformSalonFormState = {};

type PlatformSalonFormProps = {
  action: (
    state: PlatformSalonFormState,
    formData: FormData
  ) => Promise<PlatformSalonFormState>;
  submitLabel?: string;
  salon?: {
    id: number;
    naam: string;
    status?: "ACTIEF" | "GEPAUZEERD";
    email?: string | null;
    telefoonnummer?: string | null;
    adres?: string | null;
  };
  showOwnerFields?: boolean;
};

export function PlatformSalonForm({
  action,
  submitLabel = "Salon en eigenaar aanmaken",
  salon,
  showOwnerFields = true
}: PlatformSalonFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {salon ? <input type="hidden" name="salonId" value={salon.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">Salonnaam</label>
          <input id="naam" name="naam" defaultValue={salon?.naam} required />
        </div>

        <div className="veld">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" defaultValue={salon?.email ?? ""} />
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={salon?.status ?? "ACTIEF"}>
            <option value="ACTIEF">Actief</option>
            <option value="GEPAUZEERD">Gepauzeerd</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="telefoonnummer">Telefoonnummer</label>
          <input
            id="telefoonnummer"
            name="telefoonnummer"
            defaultValue={salon?.telefoonnummer ?? ""}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">Adres</label>
          <textarea id="adres" name="adres" defaultValue={salon?.adres ?? ""} />
        </div>

        {showOwnerFields ? (
          <>
            <div className="veld">
              <label htmlFor="eigenaarNaam">Naam eigenaar</label>
              <input id="eigenaarNaam" name="eigenaarNaam" required />
            </div>

            <div className="veld">
              <label htmlFor="eigenaarEmail">E-mailadres eigenaar</label>
              <input id="eigenaarEmail" name="eigenaarEmail" type="email" required />
            </div>

            <div className="veld-groot">
              <label htmlFor="eigenaarWachtwoord">Wachtwoord eigenaar</label>
              <input
                id="eigenaarWachtwoord"
                name="eigenaarWachtwoord"
                type="password"
                required
              />
            </div>
          </>
        ) : null}
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />

      {state.onboarding ? (
        <section className="onboarding-paneel">
          <div className="onboarding-kop">
            <span className="logo-label">Klaar om te delen</span>
            <h3>Onboardinggegevens</h3>
          </div>

          <div className="info-grid">
            <article className="info-kaart">
              <h3>Salon</h3>
              <p className="meta">
                <strong>{state.onboarding.salonNaam}</strong>
                <br />
                Saloncode: {state.onboarding.salonSlug}
              </p>
            </article>

            <article className="info-kaart">
              <h3>Eerste gebruiker</h3>
              <p className="meta">
                <strong>{state.onboarding.eigenaarEmail}</strong>
                <br />
                Deze gebruiker stelt bij eerste login direct een nieuw wachtwoord in.
              </p>
            </article>
          </div>

          <div className="onboarding-link">
            <strong>Loginlink</strong>
            <a href={state.onboarding.loginUrl} target="_blank" rel="noreferrer">
              {state.onboarding.loginUrl}
            </a>
          </div>
        </section>
      ) : null}
    </form>
  );
}
