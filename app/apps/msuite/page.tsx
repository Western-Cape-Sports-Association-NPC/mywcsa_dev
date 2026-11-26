import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MsuitePage() {
  redirect("https://m365.cloud.microsoft/apps");
}
