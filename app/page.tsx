import { redirect } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (!user.isPlatformAdmin && user.salon?.status === "GEPAUZEERD") {
    await clearSession();
    redirect(`/login?salon=${user.salon.slug}&fout=gepauzeerd`);
  }

  if (user.moetWachtwoordWijzigen) {
    redirect("/account/wachtwoord");
  }

  redirect(user.isPlatformAdmin ? "/platform" : "/dashboard");
}
