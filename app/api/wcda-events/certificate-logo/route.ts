import { EmsError, requireEmsActor } from "@/lib/ems/server";
import { supabaseConfig } from "@/lib/ams/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
type Asset = {storage_path:string;mime_type:string;file_name:string};

export async function GET() {
  try {
    const actor = await requireEmsActor();
    if (actor.mode !== "staff" || !actor.role || ["auditor","viewer","intake"].includes(actor.role))
      throw new EmsError(403,"A verified WCDA staff appointment is required.");
    const config = supabaseConfig();
    const query = "govapps_brand_assets?select=storage_path,mime_type,file_name&asset_type=eq.primary_logo&is_default=eq.true&order=created_at.desc&limit=1";
    const rows = await fetch(config.origin+"/rest/v1/"+query,{
      headers:{apikey:config.secret,Authorization:"Bearer "+config.secret},
      cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)
    });
    if (!rows.ok) throw new EmsError(503,"The certificate branding library is unavailable.");
    const assets = await rows.json() as Asset[];
    const asset = assets[0];
    if (!asset) throw new EmsError(404,"No primary certificate logo has been selected.");
    const file = await fetch(config.origin+"/storage/v1/object/govapps-brand-assets/"+asset.storage_path,{
      headers:{apikey:config.secret,Authorization:"Bearer "+config.secret},
      cache:"no-store",redirect:"error",signal:AbortSignal.timeout(16000)
    });
    if (!file.ok) throw new EmsError(502,"The selected certificate logo could not be loaded.");
    const bytes = await file.arrayBuffer();
    return new Response(bytes,{headers:{
      ...headers,"Content-Type":asset.mime_type,"Content-Length":String(bytes.byteLength),
      "Content-Disposition":"inline; filename*=UTF-8''"+encodeURIComponent(asset.file_name),
      "Content-Security-Policy":"default-src 'none'; sandbox"
    }});
  } catch (error) {
    const status = error instanceof EmsError ? error.status : 503;
    return Response.json({error:error instanceof Error?error.message:"Certificate logo service is unavailable."},{status,headers});
  }
}
