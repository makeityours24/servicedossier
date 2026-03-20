import { logoutAction } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";

type LogoutFormProps = {
  label: string;
  busyLabel: string;
};

export function LogoutForm({ label, busyLabel }: LogoutFormProps) {
  return (
    <form action={logoutAction}>
      <SubmitButton label={label} bezigLabel={busyLabel} className="knop-secundair" />
    </form>
  );
}
