"use client";

import Image from "next/image";
import { useActionState } from "react";
import { portalLoginAction, type PortalLoginState } from "@/app/portaal/login/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: PortalLoginState = {};

type InstallateurPortalLoginFormProps = {
  salonSlug?: string;
  salonNaam: string;
  logoUrl?: string | null;
  presetError?: string;
};

export function InstallateurPortalLoginForm({
  salonSlug,
  salonNaam,
  logoUrl,
  presetError
}: InstallateurPortalLoginFormProps) {
  const [state, formAction] = useActionState(portalLoginAction, initialState);

  return (
    <section className="inlog-kaart">
      <div className="logo-blok">
        <Image
          src={logoUrl || "/logo-salon.svg"}
          alt="Portal logo"
          width={64}
          height={64}
          className="logo-afbeelding"
        />
        <span className="logo-label">{salonNaam}</span>
      </div>
      <h1 className="pagina-titel">Klantportaal</h1>
      <p className="subtitel">Log in om uw locaties, installaties en servicehistorie te bekijken.</p>

      <form action={formAction} className="formulier">
        <input type="hidden" name="salonSlug" value={salonSlug ?? ""} />
        <FormMessage error={state.error ?? presetError} />

        <div className="veld">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" autoComplete="username" className="auth-input" required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">Wachtwoord</label>
          <input id="wachtwoord" name="wachtwoord" type="password" autoComplete="current-password" className="auth-input" required />
        </div>

        <SubmitButton label="Inloggen" bezigLabel="Inloggen..." />
      </form>
    </section>
  );
}
