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
  variant?: "salon" | "platform";
  presetError?: string;
  presetSuccess?: string;
  dictionary: {
    title: string;
    subtitle: string;
    tenantActiveTitle?: string;
    tenantActiveText?: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    loginLabel: string;
    loginBusy: string;
    formHint?: string;
    forgotPasswordLabel: string;
    forgotPasswordHref: string;
    madeBy?: string;
  };
};

export function LoginForm({
  salonSlug,
  salonNaam,
  logoUrl,
  tenantGedetecteerd,
  variant = "salon",
  presetError,
  presetSuccess,
  dictionary
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const isPlatformVariant = variant === "platform";

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

      {tenantGedetecteerd && dictionary.tenantActiveTitle && dictionary.tenantActiveText ? (
        <div className="auth-context-kaart" aria-live="polite">
          <h2>{dictionary.tenantActiveTitle.replace("{salonNaam}", salonNaam)}</h2>
          <p>{dictionary.tenantActiveText.replace("{salonNaam}", salonNaam)}</p>
        </div>
      ) : null}

      <form action={formAction} className="formulier">
        <input type="hidden" name="salonSlug" value={salonSlug ?? ""} />
        <FormMessage error={state.error ?? presetError} success={presetSuccess} />

        <div className="veld">
          <label htmlFor="email">{dictionary.emailLabel}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={dictionary.emailPlaceholder}
            autoComplete="username"
            className="auth-input"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">{dictionary.passwordLabel}</label>
          <input
            id="wachtwoord"
            name="wachtwoord"
            type="password"
            autoComplete="current-password"
            className="auth-input"
            required
          />
        </div>

        {dictionary.formHint ? <p className="auth-form-hint">{dictionary.formHint}</p> : null}

        <Link href={dictionary.forgotPasswordHref} className="link-tekst">
          {dictionary.forgotPasswordLabel}
        </Link>

        <SubmitButton label={dictionary.loginLabel} bezigLabel={dictionary.loginBusy} />
      </form>

      {!isPlatformVariant && dictionary.madeBy ? (
        <p className="maker">
          {dictionary.madeBy} <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
        </p>
      ) : null}
    </section>
  );
}
