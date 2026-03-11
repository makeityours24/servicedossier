import { logoutAction } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <SubmitButton label="Uitloggen" bezigLabel="Afmelden..." className="knop-secundair" />
    </form>
  );
}
