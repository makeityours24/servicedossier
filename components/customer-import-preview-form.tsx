"use client";

import { useActionState } from "react";
import {
  importCustomersFromTemplateAction,
  previewCustomerImportAction,
  type CustomerImportPreviewState,
  type CustomerImportState
} from "@/app/(dashboard)/klanten/customer-actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: CustomerImportPreviewState = {};
const initialImportState: CustomerImportState = {};

export function CustomerImportPreviewForm() {
  const [state, formAction] = useActionState(previewCustomerImportAction, initialState);
  const [importState, importAction] = useActionState(importCustomersFromTemplateAction, initialImportState);

  return (
    <div className="kaart">
      <h3 style={{ marginTop: 0 }}>Template controleren</h3>
      <p className="meta">
        Upload hier je ingevulde SalonDossier-template. We controleren eerst de rijen en laten zien
        wat goed staat en wat nog aandacht nodig heeft.
      </p>

      <form action={formAction} className="formulier">
        <FormMessage error={state.error} success={state.success} />

        <div className="veld-groot">
          <label htmlFor="customerImportFile">CSV-bestand</label>
          <input id="customerImportFile" name="customerImportFile" type="file" accept=".csv,text/csv" required />
        </div>

        <div className="knoppenrij">
          <SubmitButton label="Bestand controleren" bezigLabel="Controleren..." />
        </div>
      </form>

      {state.preview ? (
        <div className="import-preview">
          <div className="import-preview-summary">
            <article className="info-kaart">
              <h4>Totaal</h4>
              <strong>{state.preview.totalRows}</strong>
              <p className="meta">gevulde klantregels</p>
            </article>
            <article className="info-kaart">
              <h4>Goedgekeurd</h4>
              <strong>{state.preview.validRows}</strong>
              <p className="meta">rijen klaar voor import</p>
            </article>
            <article className="info-kaart">
              <h4>Aandacht nodig</h4>
              <strong>{state.preview.invalidRows}</strong>
              <p className="meta">rijen met fouten</p>
            </article>
          </div>

          {state.preview.previewRows.length > 0 ? (
            <div className="import-preview-table">
              <h4>Voorbeeld van geldige rijen</h4>
              <table className="tafel">
                <thead>
                  <tr>
                    <th>Rij</th>
                    <th>Naam</th>
                    <th>Telefoonnummer</th>
                    <th>Adres</th>
                  </tr>
                </thead>
                <tbody>
                  {state.preview.previewRows.map((row) => (
                    <tr key={`${row.rowNumber}-${row.telefoonnummer}`}>
                      <td>{row.rowNumber}</td>
                      <td>{row.naam}</td>
                      <td>{row.telefoonnummer}</td>
                      <td>{row.adres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {state.preview.errors.length > 0 ? (
            <div className="import-preview-errors">
              <h4>Fouten in het bestand</h4>
              <ul>
                {state.preview.errors.map((error) => (
                  <li key={`${error.rowNumber}-${error.message}`}>
                    <strong>Rij {error.rowNumber}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="kaart import-confirm-card">
            <h4>Bestand echt importeren</h4>
            <p className="meta">
              Als de controle goed is, kies dan hieronder hetzelfde CSV-bestand opnieuw. We maken
              daarna alleen klanten aan die nog niet bestaan op basis van telefoonnummer.
            </p>

            <form action={importAction} className="formulier">
              <FormMessage error={importState.error} success={importState.success} />

              <div className="veld-groot">
                <label htmlFor="customerImportFileConfirm">CSV-bestand opnieuw kiezen</label>
                <input
                  id="customerImportFileConfirm"
                  name="customerImportFile"
                  type="file"
                  accept=".csv,text/csv"
                  required
                />
              </div>

              <div className="knoppenrij">
                <SubmitButton label="Klanten importeren" bezigLabel="Importeren..." />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
