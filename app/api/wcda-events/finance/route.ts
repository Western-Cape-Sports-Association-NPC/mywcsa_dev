import {randomInt} from "node:crypto";
import {EmsError,requireEmsActor,listEmsEvents,emsDatabase} from "@/lib/ems/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const privileged=(r:string|undefined)=>["finance","manager","super_admin","executive"].includes(r||"");
const managers=(r:string|undefined)=>["manager","super_admin","executive"].includes(r||"");
const uuid=(v:unknown)=>typeof v==="string"&&/^[0-9a-f-]{36}$/i.test(v);
const headers={"Cache-Control":"no-store"};
function fail(e:unknown){return Response.json({error:e instanceof EmsError?e.message:"Finance register unavailable."},{status:e instanceof EmsError?e.status:503,headers});}
async function audit(entity_type:"catalogue"|"quotation",entity_id:string,actor:string,action:string,reason:string,details:Record<string,unknown>={}){
 await emsDatabase("wcda_ems_finance_audit",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({entity_type,entity_id,actor_email:actor,action,reason,details})});
}
export async function GET(){
 try{
  const actor=await requireEmsActor();
  if(actor.mode!=="staff"||!privileged(actor.role))throw new EmsError(403,"Finance register access is restricted to authorised WCDA finance staff.");
  const [catalog,quotes,events]=await Promise.all([
   emsDatabase<any[]>("wcda_ems_finance_catalog?select=*&order=category.asc,name.asc"),
   emsDatabase<any[]>("wcda_ems_quotations?select=*&order=created_at.desc&limit=100"),
   listEmsEvents(actor)
  ]);
  return Response.json({catalog,quotes,events},{headers});
 }catch(e){return fail(e);}
}
export async function POST(req:Request){
 try{
  const origin=req.headers.get("origin");
  if(!origin||origin!==new URL(req.url).origin)throw new EmsError(403,"Open WCDA Events from the authorised GovApps address.");
  const actor=await requireEmsActor();
  if(actor.mode!=="staff"||!privileged(actor.role))throw new EmsError(403,"Finance register access is restricted.");
  const raw=await req.text();if(raw.length>30000)throw new EmsError(413,"Finance request is too large.");
  let b:Record<string,any>;try{b=JSON.parse(raw)}catch{throw new EmsError(400,"Invalid finance request.");}
  if(!b||typeof b!=="object"||Array.isArray(b))throw new EmsError(400,"Invalid finance request.");
  if(b.action==="catalog_status"){
   if(!managers(actor.role))throw new EmsError(403,"Only a manager or executive may approve or activate tariffs and incentives.");
   const id=String(b.id||""),status=String(b.status||"");
   if(!uuid(id)||!["approved","active","inactive","pending_approval"].includes(status))throw new EmsError(400,"Invalid catalogue decision.");
   const before=await emsDatabase<any[]>("wcda_ems_finance_catalog?id=eq."+id+"&limit=1");
   if(!before.length)throw new EmsError(404,"Finance catalogue item not found.");
   const rows=await emsDatabase<any[]>("wcda_ems_finance_catalog?id=eq."+id,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
   await audit("catalogue",id,actor.email,"catalogue."+status,"Management-authorised status change",{previous_status:before[0].status,new_status:status,code:before[0].code});
   return Response.json({item:rows[0]},{headers});
  }
  if(b.action==="bulk_catalog_status"){
   if(!managers(actor.role))throw new EmsError(403,"Management authority is required for bulk tariff decisions.");
   if(!Array.isArray(b.ids)||b.ids.length<1||b.ids.length>100||b.ids.some((id:unknown)=>!uuid(id))||new Set(b.ids).size!==b.ids.length)throw new EmsError(400,"Select between 1 and 100 unique catalogue entries.");
   const status=String(b.status||"");if(!["approved","active","inactive"].includes(status))throw new EmsError(400,"Choose a valid bulk status.");
   const results=[];
   for(const id of b.ids as string[]){
    try{
     const old=await emsDatabase<any[]>("wcda_ems_finance_catalog?id=eq."+id+"&limit=1");
     if(!old.length)throw new EmsError(404,"Catalogue item not found.");
     const rows=await emsDatabase<any[]>("wcda_ems_finance_catalog?id=eq."+id,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
     await audit("catalogue",id,actor.email,"catalogue."+status,"Bulk management decision",{previous_status:old[0].status,new_status:status,code:old[0].code});
     results.push({id,status:rows[0]?.status||status});
    }catch(e){results.push({id,status:"not_updated",error:e instanceof EmsError?e.message:"Update failed."});}
   }
   return Response.json({updated:results.filter(x=>x.status===status).length,failed:results.filter(x=>x.status==="not_updated").length,results},{headers});
  }
  if(b.action==="quote_create"){
   if(!Array.isArray(b.items)||b.items.length<1||b.items.length>40)throw new EmsError(400,"Add at least one and no more than 40 quotation line items.");
   const events=await listEmsEvents(actor);
   const event=events.find(e=>e.id===b.eventId);if(!event)throw new EmsError(404,"Select an event in your authorised register.");
   const catalogue=await emsDatabase<any[]>("wcda_ems_finance_catalog?select=id,code,name,amount_cents,status,category&status=in.(approved,active)");
   const byId=new Map(catalogue.map(x=>[x.id,x]));
   let subtotal=0;
   const items=b.items.map((x:any)=>{
    const item=byId.get(String(x.catalogId));const qty=Number(x.quantity);
    if(!item||!Number.isSafeInteger(qty)||qty<1||qty>1000||item.amount_cents==null)throw new EmsError(400,"Quotation items must use approved fixed-fee catalogue entries.");
    const amount=Number(item.amount_cents)*qty;if(!Number.isSafeInteger(amount)||amount<0)throw new EmsError(400,"Invalid quotation calculation.");
    subtotal+=amount;return {catalog_id:item.id,code:item.code,description:item.name,quantity:qty,unit_amount_cents:Number(item.amount_cents),line_total_cents:amount};
   });
   if(!Number.isSafeInteger(subtotal)||subtotal>1000000000)throw new EmsError(400,"Quotation total exceeds the permitted limit.");
   const discountPct=Number(b.discountPercent||0);
   if(!Number.isFinite(discountPct)||discountPct<0||discountPct>100)throw new EmsError(400,"Discount must be between 0 and 100 percent.");
   const discount=Math.round(subtotal*discountPct/100);
   const external=Number(b.externalCostsCents||0);
   if(!Number.isSafeInteger(external)||external<0||external>1000000000)throw new EmsError(400,"External costs must be a valid amount.");
   const total=subtotal-discount+external;
   const quoteNumber="WCDA-Q-"+randomInt(100000,1000000);
   const validUntil=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
   const rows=await emsDatabase<any[]>("wcda_ems_quotations",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({
    quote_number:quoteNumber,event_id:event.id,organiser_name:event.organiser_name,event_name:event.name,event_start:event.start_date,event_end:event.end_date,
    attendance:event.estimated_attendance??null,line_items:items,subtotal_cents:subtotal,discount_cents:discount,grant_cents:0,external_costs_cents:external,vat_cents:0,total_cents:total,
    terms:{validity_days:14,initial_payment_percent:50,discount_percent:discountPct,vat_note:"VAT treatment subject to registration and applicable law",municipal_and_third_party_costs_separate:true},
    status:"pending_approval",valid_until:validUntil,prepared_by_email:actor.email
   })});
   await audit("quotation",rows[0].id,actor.email,"quotation.created","Quotation prepared and submitted for independent approval",{quote_number:quoteNumber,event_id:event.id,total_cents:total});
   return Response.json({quote:rows[0]},{status:201,headers});
  }
  if(b.action==="quote_decision"||b.action==="bulk_quote_decision"){
   if(!managers(actor.role))throw new EmsError(403,"An independent manager or executive must review quotations.");
   const ids=b.action==="quote_decision"?[b.id]:b.ids;
   const status=String(b.status||"");
   const reason=String(b.reason||"").trim();
   if(!Array.isArray(ids)||ids.length<1||ids.length>50||ids.some((id:unknown)=>!uuid(id))||new Set(ids).size!==ids.length||!["approved","rejected","cancelled"].includes(status)||reason.length<8||reason.length>500)throw new EmsError(400,"Provide unique quotation references, a valid decision and a reason of at least 8 characters.");
   const results=[];
   for(const id of ids as string[]){
    try{
     const old=await emsDatabase<any[]>("wcda_ems_quotations?id=eq."+id+"&status=eq.pending_approval&limit=1");
     if(!old.length)throw new EmsError(409,"Quotation is no longer awaiting approval.");
     if(old[0].prepared_by_email===actor.email)throw new EmsError(403,"The preparer cannot approve their own quotation.");
     const rows=await emsDatabase<any[]>("wcda_ems_quotations?id=eq."+id+"&status=eq.pending_approval",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status,approved_by_email:actor.email,approval_reason:reason,updated_at:new Date().toISOString()})});
     if(!rows.length)throw new EmsError(409,"Quotation was updated by another reviewer.");
     await audit("quotation",id,actor.email,"quotation."+status,reason,{quote_number:old[0].quote_number,total_cents:old[0].total_cents});
     results.push({id,quote_number:old[0].quote_number,status});
    }catch(e){results.push({id,status:"not_updated",error:e instanceof EmsError?e.message:"Decision failed."});}
   }
   const updated=results.filter(x=>x.status===status).length;
   return Response.json({updated,failed:results.length-updated,results},{headers});
  }
  throw new EmsError(400,"Unsupported finance action.");
 }catch(e){return fail(e);}
}
