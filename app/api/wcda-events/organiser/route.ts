import {NextResponse} from "next/server";
import {getEmsActor,emsDatabase} from "@/lib/ems/server";
export const dynamic="force-dynamic";
async function actorOrResponse(){const actor=await getEmsActor();if(!actor||actor.mode!=="organiser")return {error:NextResponse.json({error:"Authorised organiser access is required."},{status:403})};return {actor};}
export async function GET(){
 const gate=await actorOrResponse();if(gate.error)return gate.error;const owner=encodeURIComponent(gate.actor!.id);
 try{
  const [profiles,team,requests,documents]=await Promise.all([
   emsDatabase<any[]>(`wcda_organiser_profiles?select=*&owner_id=eq.${owner}&limit=1`),
   emsDatabase<any[]>(`wcda_organiser_team?select=id,member_name,email,telephone,role_title,responsibility,access_level,account_linked,status,created_at&owner_id=eq.${owner}&order=created_at.desc`),
   emsDatabase<any[]>(`wcda_organiser_requests?select=id,reference,request_type,title,amount_requested,status,submitted_at,decision_notes&owner_id=eq.${owner}&order=submitted_at.desc`),
   emsDatabase<any[]>(`wcda_organiser_documents?select=id,document_type,file_name,content_type,size_bytes,expiry_date,verification_status,created_at&owner_id=eq.${owner}&order=created_at.desc`)
  ]);
  return NextResponse.json({profile:profiles[0]||null,team,requests,documents});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not load organiser workspace."},{status:503});}
}
export async function PUT(request:Request){
 const gate=await actorOrResponse();if(gate.error)return gate.error;
 try{
  const raw=await request.json();const text=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
  const profile={
   owner_id:gate.actor!.id,
   account_type:(gate.actor!.email?((await emsDatabase<any[]>(`govapps_accounts?select=account_type&id=eq.${encodeURIComponent(gate.actor!.id)}&limit=1`))[0]?.account_type):"external_user")==="business_partner"?"business-partner":"external-user",
   legal_name:text(raw.legal_name,200),trading_name:text(raw.trading_name,200),entity_type:text(raw.entity_type,80),
   registration_number:text(raw.registration_number,80),tax_number:text(raw.tax_number,40),vat_number:text(raw.vat_number,40),
   website:text(raw.website,250),email:gate.actor!.email,telephone:text(raw.telephone,40),
   address:raw.address&&typeof raw.address==="object"?raw.address:{},
   sectors:Array.isArray(raw.sectors)?raw.sectors.filter((x:unknown)=>typeof x==="string").slice(0,20).map((x:string)=>x.slice(0,60)):[],
   organisation_summary:text(raw.organisation_summary,2000),updated_at:new Date().toISOString()
  };
  if(profile.legal_name.length<2)return NextResponse.json({error:"Enter the registered or legal organisation name."},{status:400});
  const saved=await emsDatabase<any[]>( "wcda_organiser_profiles?on_conflict=owner_id",{
   method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(profile)
  });
  await emsDatabase("wcda_organiser_audit",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({owner_id:gate.actor!.id,actor_id:gate.actor!.id,action:"profile_saved",entity_type:"organiser_profile",metadata:{legal_name:profile.legal_name}})});
  return NextResponse.json({profile:saved[0]||profile});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save organisation profile."},{status:400});}
}
export async function POST(request:Request){
 const gate=await actorOrResponse();if(gate.error)return gate.error;
 try{
  const raw=await request.json();const name=String(raw.member_name||"").trim(),email=String(raw.email||"").trim().toLowerCase();
  if(name.length<2||name.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Enter a valid team member name and email address."},{status:400});
  const rows=await emsDatabase<any[]>("wcda_organiser_team?on_conflict=owner_id,email",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify({owner_id:gate.actor!.id,member_name:name,email,telephone:String(raw.telephone||"").slice(0,40),role_title:String(raw.role_title||"").slice(0,100),responsibility:String(raw.responsibility||"").slice(0,500),access_level:["view","contributor","manager"].includes(raw.access_level)?raw.access_level:"view"})});
  return NextResponse.json({member:rows[0]},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save team member."},{status:400});}
}
