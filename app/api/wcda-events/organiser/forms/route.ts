import {NextResponse} from "next/server";
import {getEmsActor,emsDatabase} from "@/lib/ems/server";
export const dynamic="force-dynamic";
export async function GET(){
 const actor=await getEmsActor();if(!actor||actor.mode!=="organiser")return NextResponse.json({error:"Authorised organiser access is required."},{status:403});
 try{const forms=await emsDatabase<any[]>("wcda_form_templates?select=form_key,title,description,version,form_schema&active=eq.true&order=title.asc");return NextResponse.json({forms});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Form catalogue unavailable."},{status:503});}
}
export async function POST(request:Request){
 const actor=await getEmsActor();if(!actor||actor.mode!=="organiser")return NextResponse.json({error:"Authorised organiser access is required."},{status:403});
 try{
  const body=await request.json(),key=String(body.form_key||"");
  const templates=await emsDatabase<any[]>( "wcda_form_templates?select=form_key,version,form_schema&form_key=eq."+encodeURIComponent(key)+"&active=eq.true&limit=1");
  if(!templates.length)return NextResponse.json({error:"This form is not available."},{status:404});
  const schema=templates[0].form_schema||{},fields=(schema.sections||[]).flatMap((s:any)=>s.fields||[]),data=body.data&&typeof body.data==="object"?body.data:{};
  for(const field of fields){const value=data[field.name];if(field.required&&(value===undefined||value===null||String(value).trim()===""))return NextResponse.json({error:"Complete the required field: "+field.label},{status:400});if(value!==undefined&&String(value).length>5000)return NextResponse.json({error:"A form answer is too long."},{status:400});}
  const allowed=new Set(fields.map((f:any)=>f.name)),clean=Object.fromEntries(Object.entries(data).filter(([k,v])=>allowed.has(k)&&["string","number","boolean"].includes(typeof v)));
  const rows=await emsDatabase<any[]>("wcda_form_submissions",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({owner_id:actor.id,form_key:key,form_version:templates[0].version,submission_data:clean,status:"submitted"})});
  await emsDatabase("wcda_organiser_audit",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({owner_id:actor.id,actor_id:actor.id,action:"generated_form_submitted",entity_type:key,entity_id:rows[0]?.id,metadata:{reference:rows[0]?.reference}})});
  return NextResponse.json({submission:rows[0]},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Form submission failed."},{status:400});}
}