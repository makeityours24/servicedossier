"use client";

import Image from "next/image";
import Link from "next/link";
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
  presetSuccess?: string;
  dictionary: {
    title: string;
    subtitle: string;
    salonCodeLabel: string;
    salonCodePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    loginLabel: string;
    loginBusy: string;
    salonLoginTitle: string;
    salonLoginText: string;
    platformLoginTitle: string;
    platformLoginText: string;
    tenantActiveTitle: string;
    tenantActiveText: string;
    noSalonHint: string;
    forgotPasswordLabel: string;
    forgotPasswordHref: string;
    madeBy: string;
  };
};

export function LoginForm({
  salonSlug,
  salonNaam,
  logoUrl,
  tenantGedetecteerd,
  presetError,
  presetSuccess,
  dictionary
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
      <h1 className="pagina-titel">{dictionary.title}</h1>
      <p className="subtitel">{dictionary.subtitle}</p>

      <form action={formAction} className="formulier">
        <input type="hidden" name="salonSlug" value={salonSlug ?? ""} />
        <FormMessage error={state.error ?? presetError} success={presetSuccess} />

        {!tenantGedetecteerd ? (
          <div className="veld">
            <label htmlFor="salonCode">{dictionary.salonCodeLabel}</label>
            <input
              id="salonCode"
              name="salonCode"
              placeholder={dictionary.salonCodePlaceholder}
              defaultValue={salonSlug ?? ""}
            />
          </div>
        ) : null}

        <div className="veld">
          <label htmlFor="email">{dictionary.emailLabel}</label>
          <input id="email" name="email" type="email" placeholder={dictionary.emailPlaceholder} required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">{dictionary.passwordLabel}</label>
          <input id="wachtwoord" name="wachtwoord" type="password" required />
        </div>

        <Link href={dictionary.forgotPasswordHref} className="link-tekst">
          {dictionary.forgotPasswordLabel}
        </Link>

        <SubmitButton label={dictionary.loginLabel} bezigLabel={dictionary.loginBusy} />
      </form>

      <div className="info-grid" style={{ marginTop: 20 }}>
        <article className="info-kaart">
          <h3>{dictionary.salonLoginTitle}</h3>
          <p className="meta">
            {dictionary.salonLoginText}
            <br />
            <strong>admin@salonluna.nl</strong>
            <br />
            <strong>Welkom123!</strong>
          </p>
        </article>

        {!tenantGedetecteerd ? (
          <article className="info-kaart">
            <h3>{dictionary.platformLoginTitle}</h3>
            <p className="meta">{dictionary.platformLoginText}</p>
          </article>
        ) : (
          <article className="info-kaart">
            <h3>{dictionary.tenantActiveTitle}</h3>
            <p className="meta">
              {dictionary.tenantActiveText.replace("{salonNaam}", salonNaam)}
            </p>
          </article>
        )}
      </div>

      {!tenantGedetecteerd ? (
        <p className="subtitel" style={{ marginTop: 12 }}>{dictionary.noSalonHint}</p>
      ) : null}

      <p className="maker">
        {dictionary.madeBy} <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
      </p>
    </section>
  );
}
