"use client";

import Image from "next/image";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: LoginState = {};

type LoginFormProps = {
  salonSlug?: string;
  salonNaam: string;
  logoUrl?: string | null;
  tenantGedetecteerd: boolean;
  presetError?: string;
};

export function LoginForm({
  salonSlug,
  salonNaam,
  logoUrl,
  tenantGedetecteerd,
  presetError
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <section className="inlog-kaart">
      <div className="logo-blok">
        <Image
          src={logoUrl || "/logo-salon.svg"}
          alt="Salon logo"
          width={64}
          height={64}
          className="logo-afbeelding"
        />
        <span className="logo-label">{salonNaam}</span>
      </div>
      <h1 className="pagina-titel">Inloggen voor medewerkers</h1>
      <p className="subtitel">
        Registreer klanten, bewaar kleurrecepten en houd de volledige behandelgeschiedenis centraal bij.
      </p>

      <form action={formAction} className="formulier">
        <input type="hidden" name="salonSlug" value={salonSlug ?? ""} />
        <FormMessage error={state.error ?? presetError} />

        {!tenantGedetecteerd ? (
          <div className="veld">
            <label htmlFor="salonCode">Saloncode of subdomein (optioneel)</label>
            <input
              id="salonCode"
              name="salonCode"
              placeholder="Bijvoorbeeld my-style"
              defaultValue={salonSlug ?? ""}
            />
          </div>
        ) : null}

        <div className="veld">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" placeholder="naam@salon.nl" required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">Wachtwoord</label>
          <input id="wachtwoord" name="wachtwoord" type="password" required />
        </div>

        <SubmitButton label="Inloggen" bezigLabel="Controleren..." />
      </form>

      <div className="info-grid" style={{ marginTop: 20 }}>
        <article className="info-kaart">
          <h3>Salon login</h3>
          <p className="meta">
            Gebruik het medewerkeraccount van de salon. Voorbeeld:
            <br />
            <strong>admin@salonluna.nl</strong>
            <br />
            <strong>Welkom123!</strong>
          </p>
        </article>

        {!tenantGedetecteerd ? (
          <article className="info-kaart">
            <h3>Platform login</h3>
            <p className="meta">
              Log centraal in zonder saloncode voor platformbeheer en onboarding van nieuwe salons.
            </p>
          </article>
        ) : (
          <article className="info-kaart">
            <h3>Saloncontext actief</h3>
            <p className="meta">
              Je logt direct in voor <strong>{salonNaam}</strong>. De juiste saloncontext is al geselecteerd.
            </p>
          </article>
        )}
      </div>

      {!tenantGedetecteerd ? (
        <p className="subtitel" style={{ marginTop: 12 }}>
          Zonder saloncode log je centraal in. Met een saloncode of subdomein log je direct in voor die salon.
        </p>
      ) : null}

      <p className="maker">
        Gemaakt door <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
      </p>
    </section>
  );
}
