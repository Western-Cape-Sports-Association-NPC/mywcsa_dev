import {EmsError,requireEmsActor,listEmsEvents} from "@/lib/ems/server";
import {eventPaymentReference,checkoutConfig,initializeEventCheckout,listEventInvoices,listReceipts,paymentAction,settleEms,verifiedCheckoutUrl,type EmsInvoice} from "@/lib/ems/payments";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const privileged=(role:string|undefined)=>["finance","manager","super_admin","executive"].includes(role||"");
function failure(e:unknown){
 return Response.json({error:e instanceof EmsError?e.message:"The EMS payment service is unavailable."},
  {status:e instanceof EmsError?e.status:503,headers});
}
async function context(){
 const actor=await requireEmsActor();
 if(actor.mode==="staff"&&!privileged(actor.role))throw new EmsError(403,"Your EMS role does not have access to event billing.");
 const events=await listEmsEvents(actor);
 return {actor,events};
}
async function currentInvoice(invoiceId:unknown, ids:string[]){
 if(!uuid(invoiceId))throw new EmsError(400,"Choose a valid event invoice.");
 const rows=await listEventInvoices(ids);
 const invoice=rows.find(x=>x.id===invoiceId);
 if(!invoice)throw new EmsError(404,"This invoice is not available to your account.");
 return invoice;
}
export async function GET(){
 try{
  const {events}=await context();
  const invoices=await listEventInvoices(events.map(x=>x.id));
  const receipts=await listReceipts(invoices.filter(x=>x.status==="paid").map(x=>x.id));
  return Response.json({invoices,receipts}, {headers});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)throw new EmsError(403,"Open MyWCDA Events on its authorised address.");
  const raw=await request.text();
  if(raw.length>5000)throw new EmsError(413,"Payment request is too large.");
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw);}catch{throw new EmsError(400,"Invalid billing request.");}
  if(!body||typeof body!=="object"||Array.isArray(body))throw new EmsError(400,"Invalid billing details.");
  const {actor,events}=await context();
  const ids=events.map(x=>x.id);
  const action=body.action;
  if(action==="prepare"){
   if(actor.mode!=="staff"||!privileged(actor.role))throw new EmsError(403,"Only an authorised finance officer may prepare an invoice.");
   if(!uuid(body.eventId)||!ids.includes(body.eventId))throw new EmsError(404,"Choose an authorised event record.");
   const amountCents=body.amountCents;
   const description=typeof body.description==="string"?body.description.trim():"";
   if(typeof amountCents!=="number"||!Number.isSafeInteger(amountCents)||amountCents<100||amountCents>100000000
      ||description.length<8||description.length>500)throw new EmsError(400,"Enter a valid charge and a description of at least 8 characters.");
   const result=await paymentAction("prepare",actor,null,body.eventId,{amountCents,description});
   return Response.json({invoice:result}, {status:201,headers});
  }
  if(action==="bulk_approve"){
   if(actor.mode!=="staff"||!["manager","super_admin","executive"].includes(actor.role||""))
    throw new EmsError(403,"An authorised independent manager is required for bulk approval.");
   if(!Array.isArray(body.invoiceIds)||body.invoiceIds.length<1||body.invoiceIds.length>50)
    throw new EmsError(400,"Select between 1 and 50 invoices for bulk approval.");
   const reason=typeof body.reason==="string"?body.reason.trim():"";
   if(reason.length<8||reason.length>500)throw new EmsError(400,"Record a bulk approval reason of at least 8 characters.");
   const unique=[...new Set(body.invoiceIds)];
   if(unique.length!==body.invoiceIds.length||unique.some(id=>!uuid(id)))
    throw new EmsError(400,"The selected invoice list contains duplicate or invalid references.");
   const results:Array<{invoiceId:string;reference:string;status:string;error?:string}>=[];
   for(const invoiceId of unique){
    try{
     const invoice=await currentInvoice(invoiceId,ids);
     if(invoice.status!=="pending_approval")throw new EmsError(409,"Invoice is no longer awaiting approval.");
     if(invoice.prepared_by_email===actor.email)throw new EmsError(403,"The preparer cannot approve their own invoice.");
     const result=await paymentAction("approve",actor,invoice.id,invoice.event_id,{reason});
     results.push({invoiceId,reference:invoice.reference,status:String(result.status||"approved_for_payment")});
    }catch(error){
     results.push({invoiceId,reference:"",status:"not_approved",error:error instanceof EmsError?error.message:"Approval failed."});
    }
   }
   const approved=results.filter(x=>x.status==="approved_for_payment").length;
   return Response.json({approved,failed:results.length-approved,results},{headers});
  }
  if(action==="approve"||action==="cancel"){
   if(actor.mode!=="staff"||!["manager","super_admin","executive"].includes(actor.role||""))
     throw new EmsError(403,"An authorised independent manager is required.");
   const invoice=await currentInvoice(body.invoiceId,ids);
   const reason=typeof body.reason==="string"?body.reason.trim():"";
   if(reason.length<8||reason.length>500)throw new EmsError(400,"Record a reason of at least 8 characters.");
   const result=await paymentAction(action,actor,invoice.id,invoice.event_id,{reason});
   return Response.json({invoice:result},{headers});
  }
  if(action==="checkout"){
   const invoice=await currentInvoice(body.invoiceId,ids);
   if(actor.mode!=="organiser")
    throw new EmsError(403,"Only the linked event organiser may pay this invoice.");
   if(invoice.is_pilot_test)
    throw new EmsError(403,"Legacy internal test invoices are disabled and cannot be paid.");
   if(invoice.status==="paid")return Response.json({paid:true},{headers});
   const cfg=checkoutConfig(invoice);
   if(origin!==cfg.origin)throw new EmsError(403,"Open checkout on the official GovApps website.");
   const state=await paymentAction("begin_checkout",actor,invoice.id,invoice.event_id,{mode:cfg.mode}) as EmsInvoice;
   if(state.status==="paid")return Response.json({paid:true},{headers});
   if(state.checkout_url)return Response.json({url:verifiedCheckoutUrl(state.checkout_url)},{headers});
   const url=await initializeEventCheckout(invoice);
   await paymentAction("store_checkout",actor,invoice.id,invoice.event_id,{mode:cfg.mode,url});
   return Response.json({url},{headers});
  }
  if(action==="verify"){
   if(!eventPaymentReference(body.reference))throw new EmsError(400,"Invalid event payment reference.");
   const invoices=await listEventInvoices(ids);
   if(!invoices.some(x=>x.reference===body.reference))throw new EmsError(404,"Payment is not associated with an authorised event.");
   const result=await settleEms(body.reference);
   return Response.json(result,{headers});
  }
  throw new EmsError(400,"Unsupported payment action.");
 }catch(e){return failure(e);}
}
