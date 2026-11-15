import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isMicrosoftStaff } from "@/lib/govapps/staff-app-access";
import MsuiteIncidentCentre from "./incident-centre";

export const dynamic = "force-dynamic";
export const metadata = { title: "MSuite Incident & Recovery Centre | MyWCSA GovApps", robots: { index: false, follow: false } };

export default async function MsuiteIncidentPage() {
  const session = await auth();
  const user = session?.user as ({ email?: string | null; authProvider?: string; staffMustChange?: boolean } | undefined);
  if (!session?.user || !isMicrosoftStaff(user)) redirect("/login/staff?returnTo=%2Fapps%2Fmsuite");
  if (user?.staffMustChange) redirect("/staff/password");
  return <MsuiteIncidentCentre />;
}
