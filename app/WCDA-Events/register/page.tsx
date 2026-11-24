import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "MyEventDesk | Account access",
  description: "MyEventDesk accounts are provisioned by authorised WCDA staff.",
};

export default function WcdaOrganiserRegistrationPage() {
  redirect("/WCDA-Events/portal");
}
