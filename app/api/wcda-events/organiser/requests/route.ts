import {NextResponse} from "next/server";
import {getEmsActor,emsDatabase} from "@/lib/ems/server";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 const actor=await getEmsActor();if(!actor||actor.mode!=="organiser")return NextResponse.json({error:"Authorised organiser access is required."},{status:403});
 try{
  const p=await request.json();const type=String(p.request_type||"");
  if(!["grant","discount","venue","seat_reservation"].includes(type))return NextResponse.json({error:"Choose a valid request type."},{status:400});
  const title=String(p.title||"").trim(),purpose=String(p.purpose||"").trim();
  if(title.length<3||title.length>180||purpose.length<15||purpose.length>5000)return NextResponse.json({error:"Enter a title and a meaningful request motivation (at least 15 characters)."}, {status:400});
  let amount:null|number=null;if(p.amount_requested!==""&&p.amount_requested!=null){amount=Number(p.amount_requested);if(!Number.isFinite(amount)||amount<0||amount>100000000)return NextResponse.json({error:"Enter a valid amount in rand."},{status:400});}
  const details={purpose,period:String(p.period||"").slice(0,120),beneficiaries:String(p.beneficiaries||"").slice(0,500),outcomes:String(p.outcomes||"").slice(0,1000)};
  const rows=await emsDatabase<any[]>("wcda_organiser_requests",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({owner_id:actor.id,request_type:type,title,amount_requested:amount,details,status:"submitted"})});
  await emsDatabase("wcda_organiser_audit",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({owner_id:actor.id,actor_id:actor.id,action:"request_submitted",entity_type:type,entity_id:rows[0]?.id,metadata:{reference:rows[0]?.reference}})});
  return NextResponse.json({request:rows[0]},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not submit your request."},{status:400});}
}
