import { PasswordChangeForm } from "@/components/password-change-form";
import { changePasswordAction } from "@/app/account/wachtwoord/actions";
import { requireSession } from "@/lib/auth";

export default async function WachtwoordPage() {
  const user = await requireSession({ allowPasswordChange: true });

  return (
    <main className="inlog-scherm">
      <section className="inlog-kaart">
        <span className="logo-label">
          {user.moetWachtwoordWijzigen ? "Eerste login" : "Account"}
        </span>
        <h1 className="pagina-titel">
          {user.moetWachtwoordWijzigen ? "Stel eerst een nieuw wachtwoord in" : "Wachtwoord wijzigen"}
        </h1>
        <p className="subtitel">
          {user.moetWachtwoordWijzigen
            ? "Voor je verdergaat, stel je eerst een persoonlijk wachtwoord in voor dit account."
            : "Wijzig je wachtwoord om je account veilig te houden."}
        </p>

        <PasswordChangeForm
          action={changePasswordAction}
          eersteLogin={user.moetWachtwoordWijzigen}
        />
      </section>
    </main>
  );
}
