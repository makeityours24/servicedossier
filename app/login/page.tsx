"use client";

import Image from "next/image";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="inlog-scherm">
      <section className="inlog-kaart">
        <div className="logo-blok">
          <Image
            src="/logo-salon.svg"
            alt="Salon logo"
            width={64}
            height={64}
            className="logo-afbeelding"
          />
          <span className="logo-label">My Style</span>
        </div>
        <h1 className="pagina-titel">Inloggen voor medewerkers</h1>
        <p className="subtitel">
          Registreer klanten, bewaar kleurrecepten en houd de volledige behandelgeschiedenis centraal bij.
        </p>

        <form action={formAction} className="formulier">
          <FormMessage error={state.error} />

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

        <p className="subtitel" style={{ marginTop: 20 }}>
          Voorbeeldgebruiker: <strong>admin@salonluna.nl</strong> met wachtwoord <strong>Welkom123!</strong>
        </p>

        <p className="maker">
          Gemaakt door <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
        </p>
      </section>
    </main>
  );
}
