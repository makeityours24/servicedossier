"use client";

export function TesterFeedbackForm() {
  return (
    <div className="feedback-sheet kaart">
      <div className="feedback-actions">
        <button type="button" className="knop-secundair" onClick={() => window.print()}>
          Afdrukken
        </button>
        <button type="button" className="knop-zacht" onClick={() => window.location.reload()}>
          Formulier leegmaken
        </button>
      </div>

      <form className="formulier" onSubmit={(event) => event.preventDefault()}>
        <section className="feedback-section">
          <h3>Basisgegevens</h3>
          <div className="formulier-grid">
            <div className="veld">
              <label htmlFor="salonNaam">Salonnaam</label>
              <input id="salonNaam" name="salonNaam" />
            </div>
            <div className="veld">
              <label htmlFor="testerNaam">Naam tester</label>
              <input id="testerNaam" name="testerNaam" />
            </div>
            <div className="veld">
              <label htmlFor="functie">Functie</label>
              <input id="functie" name="functie" placeholder="Bijvoorbeeld eigenaar, stylist of baliemedewerker" />
            </div>
            <div className="veld">
              <label htmlFor="datum">Datum</label>
              <input id="datum" name="datum" type="date" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Algemene indruk</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="eersteIndruk">Wat was je eerste indruk van het systeem?</label>
              <textarea id="eersteIndruk" name="eersteIndruk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="onduidelijk">Waar liep je vast of wat voelde onduidelijk?</label>
              <textarea id="onduidelijk" name="onduidelijk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="logisch">Wat voelde juist logisch of prettig in gebruik?</label>
              <textarea id="logisch" name="logisch" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Klantdossier</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="klantInfoMist">Mis je nog klantinformatie in het dossier?</label>
              <textarea id="klantInfoMist" name="klantInfoMist" />
            </div>
            <div className="veld-groot">
              <label htmlFor="profielDuidelijk">Is duidelijk waar je profielgegevens kunt aanpassen?</label>
              <textarea id="profielDuidelijk" name="profielDuidelijk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="dossierSneller">Zou je hiermee sneller werken dan nu? Waarom wel of niet?</label>
              <textarea id="dossierSneller" name="dossierSneller" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Behandelingen en recepten</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="behandelingDuidelijk">Is het invoeren van een behandeling duidelijk genoeg?</label>
              <textarea id="behandelingDuidelijk" name="behandelingDuidelijk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="receptHerbruik">Werkt het hergebruiken van recepten logisch voor jullie?</label>
              <textarea id="receptHerbruik" name="receptHerbruik" />
            </div>
            <div className="veld-groot">
              <label htmlFor="fotosNuttig">Zijn behandelfoto&apos;s nuttig voor jullie? Waarom wel of niet?</label>
              <textarea id="fotosNuttig" name="fotosNuttig" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Pakketten en stempelkaarten</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="pakketDuidelijk">Is dit duidelijk genoeg voor de salon?</label>
              <textarea id="pakketDuidelijk" name="pakketDuidelijk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="stempelkaartGebruik">Zou je dit echt gebruiken in plaats van papier?</label>
              <textarea id="stempelkaartGebruik" name="stempelkaartGebruik" />
            </div>
            <div className="veld-groot">
              <label htmlFor="pakketMist">Mis je nog iets in het afboeken of overzicht?</label>
              <textarea id="pakketMist" name="pakketMist" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Agenda</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="agendaDuidelijk">Is de agenda duidelijk genoeg in dagelijks gebruik?</label>
              <textarea id="agendaDuidelijk" name="agendaDuidelijk" />
            </div>
            <div className="veld-groot">
              <label htmlFor="teamWeergave">Is de teamweergave bruikbaar bij meerdere behandelaars?</label>
              <textarea id="teamWeergave" name="teamWeergave" />
            </div>
            <div className="veld-groot">
              <label htmlFor="agendaMist">Mis je iets bij het maken of aanpassen van afspraken?</label>
              <textarea id="agendaMist" name="agendaMist" />
            </div>
          </div>
        </section>

        <section className="feedback-section">
          <h3>Praktisch en commercieel</h3>
          <div className="formulier-grid">
            <div className="veld-groot">
              <label htmlFor="dagelijksGebruik">Zou je hier dagelijks mee kunnen werken?</label>
              <textarea id="dagelijksGebruik" name="dagelijksGebruik" />
            </div>
            <div className="veld-groot">
              <label htmlFor="eersteVerbetering">Wat zou je als eerste verbeterd willen zien?</label>
              <textarea id="eersteVerbetering" name="eersteVerbetering" />
            </div>
            <div className="veld-groot">
              <label htmlFor="betaalBereidheid">Zou je hiervoor willen betalen? Waarom wel of niet?</label>
              <textarea id="betaalBereidheid" name="betaalBereidheid" />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
