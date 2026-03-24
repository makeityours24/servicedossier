"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";
import { getDefaultTreatmentPresets, type BranchType } from "@/lib/branch-profile";
import { getSalonThemeStyle } from "@/lib/salon-theme";

const initialState: FormState = {};

type SalonSettingsFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  dictionary?: {
    salonName: string;
    branchType: string;
    branchHelp: string;
    branchHair: string;
    branchMassage: string;
    branchBeauty: string;
    primaryColor: string;
    primaryColorHelp: string;
    colorPreviewTitle: string;
    colorPreviewText: string;
    previewButton: string;
    previewSoft: string;
    email: string;
    phone: string;
    address: string;
    logoUrl: string;
    logoUrlPlaceholder: string;
    logoUpload: string;
    logoUploadHelp: string;
    logoPreviewHelp: string;
    quickTreatments: string;
    quickTreatmentsPlaceholder: string;
    loadBranchDefaults: string;
    saving: string;
  };
  settings: {
    weergavenaam: string;
    branchType: "HAIR" | "MASSAGE" | "BEAUTY";
    contactEmail: string;
    contactTelefoon: string;
    adres: string;
    primaireKleur: string;
    logoUrl: string;
    logoBlobPath?: string;
    treatmentPresets: string;
  };
};

const defaultDictionary = {
  salonName: "Salonnaam",
  branchType: "Branche",
  branchHelp: "Deze keuze bepaalt de terminologie en profielaccenten in klantdossiers en formulieren.",
  branchHair: "Kapsalon",
  branchMassage: "Massagesalon",
  branchBeauty: "Schoonheidssalon",
  primaryColor: "Primaire kleur",
  primaryColorHelp: "Deze kleur wordt gebruikt voor knoppen en accentdelen in de dashboardomgeving van deze salon.",
  colorPreviewTitle: "Live kleurpreview",
  colorPreviewText: "Zo zien de hoofdaccenten eruit zodra je de instellingen opslaat.",
  previewButton: "Primaire knop",
  previewSoft: "Zacht accent",
  email: "E-mailadres",
  phone: "Telefoonnummer",
  address: "Adres",
  logoUrl: "Logo URL",
  logoUrlPlaceholder: "Bijvoorbeeld /logo-salon.svg of https://...",
  logoUpload: "Logo uploaden",
  logoUploadHelp: "Gebruik bij voorkeur een vierkant logo in JPG, PNG, WEBP of SVG tot 2 MB.",
  logoPreviewHelp: "Dit logo wordt gebruikt in de login en in de zijbalk. Een eigen logo is dus juist handig voor herkenning.",
  quickTreatments: "Snelle behandelingen",
  quickTreatmentsPlaceholder:
    "Eén behandeling per regel\nUitgroei kleuren\nVolledige kleuring\nToner",
  loadBranchDefaults: "Laad standaardbehandelingen van deze branche",
  saving: "Opslaan..."
};

export function SalonSettingsForm({
  action,
  submitLabel = "Instellingen opslaan",
  dictionary = defaultDictionary,
  settings
}: SalonSettingsFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, initialState);
  const [branchType, setBranchType] = useState<BranchType>(settings.branchType);
  const [treatmentPresets, setTreatmentPresets] = useState(settings.treatmentPresets);
  const [treatmentPresetsTouched, setTreatmentPresetsTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(settings.primaireKleur);
  const previewLogo = settings.logoUrl?.trim() || "/logo-salon.svg";
  const previewThemeStyle = getSalonThemeStyle(primaryColor);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  useEffect(() => {
    setBranchType(settings.branchType);
    setTreatmentPresets(settings.treatmentPresets);
    setTreatmentPresetsTouched(false);
    setPrimaryColor(settings.primaireKleur);
  }, [settings.branchType, settings.treatmentPresets]);

  function getDefaultPresetText(nextBranchType: BranchType) {
    return getDefaultTreatmentPresets(nextBranchType).join("\n");
  }

  function handleBranchTypeChange(nextBranchType: BranchType) {
    const currentDefaultPresetText = getDefaultPresetText(branchType);
    const nextDefaultPresetText = getDefaultPresetText(nextBranchType);

    setBranchType(nextBranchType);
    setTreatmentPresets((currentValue) => {
      if (!treatmentPresetsTouched || normalizePresetText(currentValue) === normalizePresetText(currentDefaultPresetText)) {
        return nextDefaultPresetText;
      }

      return currentValue;
    });
  }

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="weergavenaam">{dictionary.salonName}</label>
          <input id="weergavenaam" name="weergavenaam" defaultValue={settings.weergavenaam} required />
        </div>

        <div className="veld">
          <label htmlFor="branchType">{dictionary.branchType}</label>
          <select
            id="branchType"
            name="branchType"
            value={branchType}
            onChange={(event) => handleBranchTypeChange(event.target.value as BranchType)}
          >
            <option value="HAIR">{dictionary.branchHair}</option>
            <option value="MASSAGE">{dictionary.branchMassage}</option>
            <option value="BEAUTY">{dictionary.branchBeauty}</option>
          </select>
          <p className="meta" style={{ margin: 0 }}>
            {dictionary.branchHelp}
          </p>
        </div>

        <div className="veld">
          <label htmlFor="primaireKleur">{dictionary.primaryColor}</label>
          <input
            id="primaireKleur"
            name="primaireKleur"
            value={primaryColor}
            onChange={(event) => setPrimaryColor(event.target.value)}
            required
          />
          <p className="meta" style={{ margin: 0 }}>
            {dictionary.primaryColorHelp}
          </p>
        </div>

        <div className="veld">
          <label htmlFor="contactEmail">{dictionary.email}</label>
          <input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
        </div>

        <div className="veld">
          <label htmlFor="contactTelefoon">{dictionary.phone}</label>
          <input id="contactTelefoon" name="contactTelefoon" defaultValue={settings.contactTelefoon} />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">{dictionary.address}</label>
          <textarea id="adres" name="adres" defaultValue={settings.adres} />
        </div>

        <div className="veld-groot">
          <div className="kleur-preview-kaart" style={previewThemeStyle}>
            <div className="kleur-preview-kop">
              <div>
                <h3>{dictionary.colorPreviewTitle}</h3>
                <p className="meta" style={{ margin: 0 }}>
                  {dictionary.colorPreviewText}
                </p>
              </div>
              <span className="kleur-chip" style={{ backgroundColor: primaryColor }} aria-hidden="true" />
            </div>
            <div className="acties">
              <span className="knop kleur-preview-knop">{dictionary.previewButton}</span>
              <span className="knop-zacht kleur-preview-knop">{dictionary.previewSoft}</span>
            </div>
          </div>
        </div>

        <div className="veld-groot">
          <label htmlFor="logoUrl">{dictionary.logoUrl}</label>
          <input
            id="logoUrl"
            name="logoUrl"
            defaultValue={settings.logoUrl}
            placeholder={dictionary.logoUrlPlaceholder}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="logoBestand">{dictionary.logoUpload}</label>
          <input
            id="logoBestand"
            name="logoBestand"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
          />
          <p className="meta" style={{ margin: 0 }}>
            {dictionary.logoUploadHelp}
          </p>
          <div className="instellingen-logo-preview">
            <Image
              src={previewLogo}
              alt="Logo preview"
              width={64}
              height={64}
              className="logo-afbeelding logo-afbeelding-klein"
            />
            <p className="meta" style={{ margin: 0 }}>
              {dictionary.logoPreviewHelp}
            </p>
          </div>
        </div>

        <div className="veld-groot">
          <label htmlFor="treatmentPresets">{dictionary.quickTreatments}</label>
          <textarea
            id="treatmentPresets"
            name="treatmentPresets"
            value={treatmentPresets}
            onChange={(event) => {
              setTreatmentPresets(event.target.value);
              setTreatmentPresetsTouched(true);
            }}
            placeholder={dictionary.quickTreatmentsPlaceholder}
          />
          <div className="acties">
            <button
              type="button"
              className="knop-zacht"
              onClick={() => {
                setTreatmentPresets(getDefaultPresetText(branchType));
                setTreatmentPresetsTouched(false);
              }}
            >
              {dictionary.loadBranchDefaults}
            </button>
          </div>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={dictionary.saving} />
    </form>
  );
}

function normalizePresetText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}
