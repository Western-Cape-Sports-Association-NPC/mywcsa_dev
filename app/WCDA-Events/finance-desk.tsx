"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import type {EmsInvoice,EmsReceipt} from "@/lib/ems/payments";
import styles from "./finance-desk.module.css";
import {exportWcdaInvoice} from "@/lib/ems/document-engine";
import PenaltiesCatalogue from "./penalties-catalogue";

const rand=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
const label=(s:string)=>s.replaceAll("_"," ").replace(/\b[a-z]/g,c=>c.toUpperCase());
const shortDate=(iso:string|null)=>iso?new Date(iso).toLocaleDateString("en-ZA",{dateStyle:"medium"}):"—";

export default function FinanceDesk({actor,events}:{actor:EmsActor;events:EmsEvent[]}){
 const isStaff=actor.mode==="staff";
 const mayPrepare=isStaff&&["finance","manager","super_admin","executive"].includes(actor.role||"");
 const mayApprove=isStaff&&["manager","super_admin","executive"].includes(actor.role||"");
 const[records,setRecords]=useState<EmsInvoice[]>([]);
 const[receipts,setReceipts]=useState<EmsReceipt[]>([]);
 const[busy,setBusy]=useState(false);
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[message,setMessage]=useState("");
 const[eventId,setEventId]=useState("");
 const[amount,setAmount]=useState("");
 const[description,setDescription]=useState("");
 const[items,setItems]=useState({eventFee:{on:true,amount:""},penalty:{on:false,amount:"",code:"P-05",reason:""},adminFee:{on:false,amount:""},inspection:{on:false,amount:""},lateFee:{on:false,amount:""},discount:{on:false,amount:""}});
 const selectedTotal=useMemo(()=>{const cents=(v:string)=>/^\d+(\.\d{1,2})?$/.test(v)?Math.round(Number(v)*100):0;const gross=Object.entries(items).filter(([k,v])=>k!=="discount"&&v.on).reduce((n,[,v])=>n+cents(v.amount),0);return Math.max(0,gross-(items.discount.on?cents(items.discount.amount):0));},[items]);
 const[reason,setReason]=useState("");
 const[activeInvoice,setActiveInvoice]=useState("");
 const[selectedInvoices,setSelectedInvoices]=useState<string[]>([]);
 const[bulkReason,setBulkReason]=useState("");
 const unbilled=useMemo(()=>events.filter(e=>!records.some(i=>i.event_id===e.id&&!i.is_pilot_test)),[events,records]);
 const byEvent=(id:string)=>events.find(e=>e.id===id);
 async function refresh(){
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/wcda-events/payments",{cache:"no-store"});
   const x=await r.json() as {invoices?:EmsInvoice[];receipts?:EmsReceipt[];error?:string};
   if(!r.ok)throw new Error(x.error||"Could not load billing records.");
   setRecords(x.invoices||[]);setReceipts(x.receipts||[]);
  }catch(e){setError(e instanceof Error?e.message:"Billing records unavailable.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh()},[]);
 async function execute(payload:Record<string,unknown>){
  setBusy(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/wcda-events/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const x=await r.json() as {invoice?:EmsInvoice;url?:string;paid?:boolean;error?:string};
   if(!r.ok)throw new Error(x.error||"Unable to complete the action.");
   if(payload.action==="checkout"){
    if(x.paid){setMessage("This invoice has already been paid.");await refresh();return;}
    if(typeof x.url!=="string"||!x.url.startsWith("https://checkout.paystack.com/"))throw new Error("The provider did not return a valid checkout address.");
    window.location.assign(x.url);
    return;
   }
   if(payload.action==="prepare"){setAmount("");setDescription("");setEventId("");setItems({eventFee:{on:true,amount:""},penalty:{on:false,amount:"",code:"P-05",reason:""},adminFee:{on:false,amount:""},inspection:{on:false,amount:""},lateFee:{on:false,amount:""},discount:{on:false,amount:""}});}
   setReason("");setActiveInvoice("");
   await refresh();
   setMessage(payload.action==="prepare"
     ?"Official event invoice prepared. The normal finance controls apply."
     :payload.action==="approve"?"Invoice approved for payment. The linked payer may proceed.":"Invoice cancelled before checkout.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to complete the action.");}
  finally{setBusy(false);}
 }
 async function bulkApprove(){
  if(!selectedInvoices.length||bulkReason.trim().length<8)return;
  setBusy(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/wcda-events/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulk_approve",invoiceIds:selectedInvoices,reason:bulkReason.trim()})});
   const x=await r.json() as {approved?:number;failed?:number;results?:{reference:string;error?:string}[];error?:string};
   if(!r.ok)throw new Error(x.error||"Bulk approval could not be completed.");
   const failures=(x.results||[]).filter(item=>item.error).map(item=>item.reference?item.reference+": "+item.error:item.error);
   setMessage((x.approved||0)+" invoice(s) approved. "+(x.failed||0)+" not approved."+(failures.length?" Reasons: "+failures.join(" | "):""));
   setSelectedInvoices([]);setBulkReason("");await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Bulk approval failed.");}
  finally{setBusy(false);}
 }
 function prepare(e:FormEvent){
  e.preventDefault();
  const money=(v:string)=>/^\d+(\.\d{1,2})?$/.test(v)?Math.round(Number(v)*100):0;
  const labels={eventFee:"Event fee",penalty:"Penalty / compliance charge",adminFee:"Administration fee",inspection:"Inspection / assessment fee",lateFee:"Late application fee"} as const;
  const lines:string[]=[];
  for(const key of Object.keys(labels) as Array<keyof typeof labels>){
   const item=items[key];if(!item.on)continue;
   const value=money(item.amount);if(value<100){setError("Enter at least R1.00 for every selected charge.");return;}
   const detail=key==="penalty"?" — "+items.penalty.code+" "+items.penalty.reason.trim():"";
   if(key==="penalty"&&items.penalty.reason.trim().length<5){setError("Add the specific penalty reason and code.");return;}
   lines.push(labels[key]+detail+" | "+rand(value));
  }
  const discount=items.discount.on?money(items.discount.amount):0;
  if(items.discount.on&&discount<1){setError("Enter a valid discount amount.");return;}
  if(items.discount.on)lines.push("Approved discount | -"+rand(discount));
  const gross=(Object.keys(labels) as Array<keyof typeof labels>).reduce((n,k)=>n+(items[k].on?money(items[k].amount):0),0);
  const total=gross-discount;
  if(total<100||total>100000000){setError("Select charges and ensure the final total is between R1.00 and R1,000,000.00.");return;}
  const note=description.trim()? "\nNote: "+description.trim():"";
  const detail="ITEMISED INVOICE\n"+lines.join("\n")+"\nTOTAL DUE | "+rand(total)+note;
  if(detail.length>500){setError("Shorten the additional note or penalty reason so the invoice description fits.");return;}
  void execute({action:"prepare",eventId,amountCents:total,description:detail});
 }
 async function receiptPdf(invoice:EmsInvoice,receipt:EmsReceipt){
  try{
   const {jsPDF}=await import("jspdf");
   const pdf=new jsPDF();
   pdf.setFillColor(0,20,132);pdf.rect(0,0,210,36,"F");
   pdf.setFont("helvetica","bold");pdf.setFontSize(17);pdf.setTextColor(255,255,255);
   pdf.text("MyEventDesk",16,22);
   pdf.setTextColor(30,48,83);pdf.setFontSize(17);pdf.text("PAYMENT CONFIRMATION",16,56);
   pdf.setFont("helvetica","normal");pdf.setFontSize(10);
   const lines=[
    "Payment confirmation: "+receipt.receipt_reference,
    "Event: "+(byEvent(invoice.event_id)?.name||invoice.event_id),
    "EMS reference: "+(byEvent(invoice.event_id)?.reference||"See event registry"),
    "Invoice reference: "+invoice.reference,
    "Amount confirmed: "+rand(invoice.amount_cents),
    "Currency: ZAR",
    "Provider: Paystack",
    "Transaction ID: "+receipt.provider_transaction_id,
    "Date: "+shortDate(receipt.paid_at),
    "Gateway environment: "+receipt.payment_mode.toUpperCase(),
    "",
    "This acknowledges a gateway-verified payment only.",
    "It is NOT an event endorsement, operating licence, permit or tax invoice.",
    "For billing enquiries: finances@wcsports.co.za"
   ];
   let y=73;
   for(const line of lines){for(const wrapped of pdf.splitTextToSize(line,176) as string[]){pdf.text(wrapped,16,y);y+=8;}}
   pdf.save("MyWCDA-Payment-"+receipt.receipt_reference+".pdf");
  }catch{setError("Could not create the payment confirmation document.");}
 }
 return <section className={styles.root}>
  <div className={styles.heading}><div><span className={styles.overline}>MYEVENTDESK · SECURE FINANCIAL SERVICES</span><h2>{isStaff?"Event billing & payment control":"Your invoices & payments"}</h2><p>{isStaff?"Manage approved official event charges, independent finance approvals and verified Paystack settlements.":"Review approved event charges and pay safely through Paystack. Charges cannot be changed in your browser."}</p></div><button type="button" onClick={()=>void refresh()} disabled={loading||busy}>↻ Refresh</button></div>
  <PenaltiesCatalogue mode={isStaff?"system":"paywall"}/>
  {error&&<p className={styles.alert} role="alert">{error}</p>}
  {message&&<p className={styles.success} role="status">{message}</p>}
  {mayPrepare&&<form className={styles.card+" "+styles.prepare} onSubmit={prepare}>
   <div className={styles.cardTitle}><h3>Prepare an event invoice</h3><span>Finance authorisation</span></div>
   <p className={styles.muted}>Only approved, documented fees should be entered. No automatic charge is applied to event applications.</p>
   <div className={styles.formGrid}>
    <label className={styles.wide}>Registered event<select required value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">Select an unbilled event</option>{unbilled.map(e=><option key={e.id} value={e.id}>{e.reference} · {e.name}</option>)}</select></label>
   </div>
   <div className={styles.itemBuilder}>
    <strong>Choose the items to show on the invoice</strong>
    <div className={styles.chargeRow}><label><input type="checkbox" checked={items.eventFee.on} onChange={e=>setItems(old=>({...old,eventFee:{...old.eventFee,on:e.target.checked}}))}/> Event fee</label><input inputMode="decimal" placeholder="Amount (R)" value={items.eventFee.amount} onChange={e=>setItems(old=>({...old,eventFee:{...old.eventFee,amount:e.target.value}}))}/></div>
    <div className={styles.chargeRow}><label><input type="checkbox" checked={items.penalty.on} onChange={e=>setItems(old=>({...old,penalty:{...old.penalty,on:e.target.checked}}))}/> Penalty / compliance charge</label><input inputMode="decimal" placeholder="Amount (R)" value={items.penalty.amount} onChange={e=>setItems(old=>({...old,penalty:{...old.penalty,amount:e.target.value}}))}/></div>
    {items.penalty.on&&<div className={styles.penaltyFields}><label>Penalty code<select value={items.penalty.code} onChange={e=>setItems(old=>({...old,penalty:{...old.penalty,code:e.target.value}}))}>{Array.from({length:12},(_,i)=>"P-"+String(i+1).padStart(2,"0")).map(code=><option key={code}>{code}</option>)}</select></label><label>Specific breach / reason<input value={items.penalty.reason} onChange={e=>setItems(old=>({...old,penalty:{...old.penalty,reason:e.target.value}}))} placeholder="Documented breach / reason"/></label></div>}
    {([{key:"adminFee",label:"Administration fee"},{key:"inspection",label:"Inspection / assessment fee"},{key:"lateFee",label:"Late application fee"}] as const).map(row=><div className={styles.chargeRow} key={row.key}><label><input type="checkbox" checked={items[row.key].on} onChange={e=>setItems(old=>({...old,[row.key]:{...old[row.key],on:e.target.checked}}))}/> {row.label}</label><input inputMode="decimal" placeholder="Amount (R)" value={items[row.key].amount} onChange={e=>setItems(old=>({...old,[row.key]:{...old[row.key],amount:e.target.value}}))}/></div>)}
    <div className={styles.chargeRow+" "+styles.discountRow}><label><input type="checkbox" checked={items.discount.on} onChange={e=>setItems(old=>({...old,discount:{...old.discount,on:e.target.checked}}))}/> Discount</label><input inputMode="decimal" placeholder="Discount (R)" value={items.discount.amount} onChange={e=>setItems(old=>({...old,discount:{...old.discount,amount:e.target.value}}))}/></div>
    <div className={styles.totalPreview}><span>Invoice total</span><strong>{rand(selectedTotal)}</strong></div>
    <label className={styles.wide}>Additional invoice note (optional)<input maxLength={150} placeholder="Fee basis / supporting approval reference" value={description} onChange={e=>setDescription(e.target.value)}/></label>
   </div>
   <div className={styles.formFoot}><small>Use only documented and authorised charges. Discounts need approval. A different manager or executive must independently approve this invoice.</small><button type="submit" disabled={busy||!eventId}>{busy?"Saving…":"Prepare invoice"}</button></div>
  </form>}
  <div className={styles.card}>
   <div className={styles.cardTitle}><h3>{isStaff?"Official event invoices":"Invoices linked to your events"}</h3><span>{records.length} record(s)</span></div>
   {mayApprove&&<div className={styles.bulkBar}>
    <div className={styles.bulkTop}><strong>Approval queue · bulk actions</strong><button type="button" className={styles.ghost} onClick={()=>setSelectedInvoices(records.filter(i=>i.status==="pending_approval"&&!i.is_pilot_test&&i.prepared_by_email!==actor.email).map(i=>i.id))}>Select all eligible</button><button type="button" className={styles.ghost} onClick={()=>setSelectedInvoices([])}>Clear selection</button></div>
    <label>Shared approval rationale (recorded against each selected invoice)<textarea rows={2} minLength={8} maxLength={500} value={bulkReason} onChange={e=>setBulkReason(e.target.value)} placeholder="Explain the independent review basis, tariff reference and supporting checks."/></label>
    <div className={styles.bulkBottom}><span>{selectedInvoices.length} invoice(s) selected · own-prepared invoices excluded</span><button type="button" disabled={busy||!selectedInvoices.length||bulkReason.trim().length<8} onClick={()=>void bulkApprove()}>{busy?"Processing approvals…":"Approve selected invoices"}</button></div>
   </div>}
   {loading?<p className={styles.muted}>Loading secured event finance records…</p>:records.length===0?<div className={styles.empty}><strong>No event invoices yet.</strong><p>{isStaff?"Prepare an invoice only when a legitimate fee has been authorised.":"Once WCDA Finance issues and independently approves a charge, the invoice will appear here."}</p></div>:
   <div className={styles.list}>{records.map(i=>{
    const receipt=receipts.find(x=>x.invoice_id===i.id);
    const canReview=mayApprove&&!i.is_pilot_test&&i.status==="pending_approval"&&i.prepared_by_email!==actor.email;
    return <article key={i.id} className={styles.invoice}>
     {canReview&&<label className={styles.selectInvoice}><input type="checkbox" checked={selectedInvoices.includes(i.id)} onChange={e=>setSelectedInvoices(old=>e.target.checked?[...old,i.id]:old.filter(id=>id!==i.id))}/> Select for bulk approval</label>}
     <div className={styles.invoiceTop}><div><small>{byEvent(i.event_id)?.reference||"WCDA EVENT"}</small><h4>{byEvent(i.event_id)?.name||"Event invoice"}</h4><p>{i.description}</p></div><strong className={styles.amount}>{rand(i.amount_cents)}</strong></div>
     <div className={styles.details}>{i.is_pilot_test&&<span className={styles.legacyTestLabel}>LEGACY TEST · DISABLED</span>}<span>Invoice {i.reference}</span><span>Issued {shortDate(i.created_at)}</span><span className={styles.status} data-status={i.status}>{label(i.status)}</span></div>
     <div className={styles.invoiceTools}><button type="button" onClick={()=>exportWcdaInvoice(i,byEvent(i.event_id),receipt)}>Download invoice template PDF ↓</button></div>
     {i.status==="pending_approval"&&!i.is_pilot_test&&<p className={styles.hint}>Official event charge: finance review pending before checkout.</p>}
     {i.status==="approved_for_payment"&&!i.is_pilot_test&&i.approved_by_email&&<p className={styles.hint}>Approved by {isStaff?i.approved_by_email:"WCDA Finance"} on {shortDate(i.approved_at)}.</p>}
     {i.status==="paid"&&receipt&&<div className={styles.receipt}><strong>✓ Paystack payment verified</strong><span>Confirmation: {receipt.receipt_reference}</span><button type="button" onClick={()=>void receiptPdf(i,receipt)}>Download confirmation PDF ↓</button></div>}
     {!isStaff&&!i.is_pilot_test&&
      (i.status==="approved_for_payment"||i.status==="checkout_pending")&&
       <button className={styles.pay} type="button" disabled={busy}
        onClick={()=>void execute({action:"checkout",invoiceId:i.id})}>
        {busy?"Opening secure checkout…":i.status==="checkout_pending"?"Resume Paystack checkout ↗":"Pay "+rand(i.amount_cents)+" securely ↗"}
       </button>}
     {!isStaff&&i.status==="checkout_pending"&&
      <p className={styles.hint}>If the previous checkout was interrupted, use Resume checkout. The server prevents duplicate requests while an initialization is in progress (up to two minutes).</p>}
     {canReview&&<div className={styles.review}>
      {activeInvoice===i.id?<><label>Approval or cancellation reason<textarea required rows={2} minLength={8} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Record the documented basis for your decision"/></label><div className={styles.buttons}><button type="button" disabled={busy||reason.trim().length<8} onClick={()=>void execute({action:"approve",invoiceId:i.id,reason})}>Approve for payment</button><button type="button" className={styles.danger} disabled={busy||reason.trim().length<8} onClick={()=>void execute({action:"cancel",invoiceId:i.id,reason})}>Cancel invoice</button><button type="button" className={styles.ghost} onClick={()=>{setActiveInvoice("");setReason("")}}>Close</button></div></>:
       <button type="button" onClick={()=>{setActiveInvoice(i.id);setReason("")}}>Review invoice →</button>}
     </div>}
     {i.status==="paid"&&<p className={styles.hint}>Payment verification is separate from event assessment and endorsement. A settled invoice does not grant approval.</p>}
    </article>
   })}</div>}
  </div>
  <p className={styles.footNote}>Payments are processed on Paystack’s secure checkout. Financial records and acknowledgements are retained in the EMS database. For discrepancies contact <a href="mailto:finances@wcsports.co.za">finances@wcsports.co.za</a>.</p>
 </section>;
}
