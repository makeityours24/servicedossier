import Link from "next/link";
import { TesterFeedbackForm } from "@/components/tester-feedback-form";

export default function TestformulierPage() {
  return (
    <main className="landing-pagina">
      <section className="container landing-sectie">
        <div className="bovenbalk">
          <div>
            <span className="logo-label">Tester feedback</span>
            <h1 className="pagina-titel" style={{ fontSize: "2.5rem" }}>
              Feedbackformulier voor salons
            </h1>
            <p className="subtitel">
              Gebruik dit formulier tijdens een demo of testmoment om gestructureerd feedback op te
              halen over dossier, behandelingen, agenda, pakketten en algemene bruikbaarheid.
            </p>
          </div>

          <div className="acties">
            <Link href="/" className="knop-secundair">
              Terug naar homepage
            </Link>
          </div>
        </div>

        <TesterFeedbackForm />
      </section>
    </main>
  );
}
