import {EmsError,requireEmsActor,listEmsEvents,emsDatabase} from "@/lib/ems/server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const privileged=(r:string|undefined)=>["finance","manager","super_admin","executive"].includes(r||"");
const managers=(r:string|undefined)=>["manager","super_admin","executive"].includes(r||"");
const headers={"Cache-Control":"no-store"};
function fail(e:unknown){return Response.json({error:e instanceof EmsError?e.message:"Finance register unavailable."},{status:e instanceof EmsError?e.status:503,headers});}
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
  const b=JSON.parse(raw) as Record<string,any>;
  if(b.action==="catalog_status"){
   if(!managers(actor.role))throw new EmsError(403,"Only a manager or executive may approve or activate tariffs and incentives.");
   const id=String(b.id||"");const status=String(b.status||"");
   if(!/^[0-9a-f-]{36}$/i.test(id)||!["approved","active","inactive","pending_approval"].includes(status))throw new EmsError(400,"Invalid catalogue decision.");
   const rows=await emsDatabase<any[]>("wcda_ems_finance_catalog?id=eq."+id,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
   if(!rows.length)throw new EmsError(404,"Finance catalogue item not found.");
   return Response.json({item:rows[0]},{headers});
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
   const quoteNumber="WCDA-Q-"+new Date().getFullYear()+"-"+Date.now().toString().slice(-8);
   const validUntil=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
   const rows=await emsDatabase<any[]>("wcda_ems_quotations",{method:"POST",headers:{"Prefer":"return=representation"},body:JSON.stringify({
    quote_number:quoteNumber,event_id:event.id,organiser_name:event.organiser_name,event_name:event.name,event_start:event.start_date,event_end:event.end_date,
    attendance:null,line_items:items,subtotal_cents:subtotal,discount_cents:discount,grant_cents:0,external_costs_cents:external,vat_cents:0,total_cents:total,
    terms:{validity_days:14,initial_payment_percent:50,discount_percent:discountPct,vat_note:"VAT treatment subject to registration and applicable law",municipal_and_third_party_costs_separate:true},
    status:"pending_approval",valid_until:validUntil,prepared_by_email:actor.email
   })});
   return Response.json({quote:rows[0]},{status:201,headers});
  }
  if(b.action==="quote_decision"){
   if(!managers(actor.role))throw new EmsError(403,"An independent manager or executive must review quotations.");
   const id=String(b.id||""),status=String(b.status||""),reason=String(b.reason||"").trim();
   if(!/^[0-9a-f-]{36}$/i.test(id)||!["approved","rejected","cancelled"].includes(status)||reason.length<8||reason.length>500)throw new EmsError(400,"Provide a valid quotation decision and reason.");
   const rows=await emsDatabase<any[]>("wcda_ems_quotations?id=eq."+id+"&status=eq.pending_approval",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({status,approved_by_email:actor.email,approval_reason:reason,updated_at:new Date().toISOString()})});
   if(!rows.length)throw new EmsError(409,"Quotation is no longer awaiting approval.");
   return Response.json({quote:rows[0]},{headers});
  }
  throw new EmsError(400,"Unsupported finance action.");
 }catch(e){return fail(e);}
}
