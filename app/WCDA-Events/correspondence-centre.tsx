"use client";
import {useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import styles from "./microsoft-centre.module.css";
type CaseMessage={
 id:string;event_id:string;kind:string;recipient_email:string;
 subject:string;body:string;status:"draft"|"approved"|"dispatching"|"accepted"|"uncertain";
 prepared_by_email:string;approved_by_email:string|null;created_at:string;accepted_at:string|null;
};
const types=[
 {value:"status_update",label:"Status update"},
 {value:"documents_requested",label:"Supporting documents requested"},
 {value:"payment_notice",label:"Finance correspondence"},
 {value:"general",label:"General event correspondence"},
];
const title=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const templates=[
 {id:"billing",kind:"payment_notice",icon:"🧾",tone:"blue",name:"Billing & invoice",tag:"FINANCE",desc:"Issue an invoice with a clear amount, due date and payment reference.",subject:"Your WCDA Events invoice · {{reference}}"},
 {id:"approval",kind:"status_update",icon:"🎉",tone:"green",name:"Event approval",tag:"DECISION",desc:"Celebrate an approved event and clearly communicate its conditions.",subject:"Your event has been approved · {{reference}}"},
 {id:"settlement",kind:"payment_notice",icon:"✅",tone:"violet",name:"Account settlement",tag:"PAYMENTS",desc:"Confirm funds received, receipt details and the remaining balance.",subject:"Payment received · Account settlement · {{reference}}"},
 {id:"outstanding",kind:"payment_notice",icon:"⏰",tone:"amber",name:"Outstanding account",tag:"FINANCE",desc:"Send a courteous balance reminder with clear next steps.",subject:"Action required · Outstanding account · {{reference}}"},
];
function emailTemplate(id:string,event:EmsEvent){
 const ref=event.reference||"{{event_reference}}",name=event.name||"{{event_name}}",organiser=event.organiser_name||"{{organiser_name}}";
 const header="WCDA EVENTS  |  WESTERN CAPE DEVELOPMENT AUTHORITY\nUNITED IN SERVICE · CONNECTED IN ACTION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
 const footer="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWCDA EVENTS  •  Western Cape Sports Association NPC\nWCDA.Events@govapps.wcsports.co.za\nThis is an official case communication. Please quote "+ref+" in all replies.";
 const sign="Kind regards,\nWCDA Events Team\n";
 const common="Event: "+name+"\nCase reference: "+ref+"\nOrganiser: "+organiser+"\n";
 const content:Record<string,{subject:string;body:string}>={
  billing:{subject:"Your WCDA Events invoice · "+ref,body:"Dear "+organiser+",\n\nThank you for working with WCDA Events. Your invoice is ready.\n\n📋 EVENT DETAILS\n"+common+"Invoice number: {{invoice_number}}\nInvoice date: {{invoice_date}}\nDue date: {{due_date}}\n\n💳 PAYMENT SUMMARY\nInvoice amount: {{invoice_amount}}\nAmount payable: {{amount_due}}\nPayment reference: {{payment_reference}}\n\nPlease use the approved payment instructions on the attached invoice and quote the payment reference exactly. If you need help, contact {{finance_contact}}.\n\n"+sign},
  approval:{subject:"Your event has been approved · "+ref,body:"Dear "+organiser+",\n\n🎉 GOOD NEWS! Your event application has been approved by WCDA Events.\n\n📍 APPROVED EVENT\n"+common+"Approved dates: {{event_dates}}\nVenue: "+(event.venue_name||"{{venue}}")+"\nDecision date: {{approval_date}}\n\n⭐ APPROVAL CONDITIONS\n{{approval_conditions}}\n\nPlease follow the conditions above. Any material changes to the dates, venue or programme must be submitted for review. This approval does not replace any separate municipal, venue, safety or statutory permissions that may be required.\n\nWe wish you a successful and memorable event!\n\n"+sign},
  settlement:{subject:"Payment received · Account settlement · "+ref,body:"Dear "+organiser+",\n\n✅ PAYMENT RECEIVED — THANK YOU!\n\nWe have recorded your payment. Here is your account confirmation.\n\n📋 ACCOUNT DETAILS\n"+common+"Invoice number(s): {{invoice_numbers}}\nPayment date: {{payment_date}}\nPayment reference: {{payment_reference}}\nReceipt number: {{receipt_number}}\n\n💰 SETTLEMENT SUMMARY\nOriginal amount: {{original_amount}}\nAmount received: {{amount_received}}\nRemaining balance: {{remaining_balance}}\nSettlement status: {{settlement_status}}\n\nPlease keep this message and your receipt for your records. Contact {{finance_contact}} if you need an allocation review.\n\n"+sign},
  outstanding:{subject:"Action required · Outstanding account · "+ref,body:"Dear "+organiser+",\n\nThis is a friendly reminder that our records show an outstanding balance on your WCDA Events account.\n\n📋 ACCOUNT DETAILS\n"+common+"Invoice number: {{invoice_number}}\nInvoice date: {{invoice_date}}\nOriginal due date: {{due_date}}\n\n⏳ BALANCE SUMMARY\nOriginal invoice amount: {{invoice_amount}}\nPayments received: {{payments_received}}\nOutstanding balance: {{outstanding_amount}}\n\nPlease settle the balance using the approved payment instructions on your invoice. If you have already paid, send proof of payment to {{finance_contact}} so we can update your account. If you need a reconciliation or wish to query the balance, please contact our Finance Office and quote the invoice reference.\n\nThank you for your prompt attention.\n\n"+sign}
 };
 return content[id]||content.billing;
}
const day=(v:string|null)=>v?new Date(v).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"}):"—";
export default function CorrespondenceCentre({actor,events}:{actor:EmsActor;events:EmsEvent[]}){
 const isStaff=actor.mode==="staff";
 const canCompose=isStaff&&["registrar","manager","super_admin","executive","assessor","operations","compliance","finance","certificates"].includes(actor.role||"");
 const canApprove=isStaff&&["manager","super_admin","executive"].includes(actor.role||"");
 const[records,setRecords]=useState<CaseMessage[]>([]);
 const[enabled,setEnabled]=useState(false);
 const[loading,setLoading]=useState(true);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[notice,setNotice]=useState("");
 const[eventId,setEventId]=useState("");
 const[kind,setKind]=useState("general");
 const[subject,setSubject]=useState("");
 const[body,setBody]=useState("");
 const[expanded,setExpanded]=useState<string|null>(null);
 const[filter,setFilter]=useState("");
 const[selectedTemplate,setSelectedTemplate]=useState<string>("");
 const eventFor=(id:string)=>events.find(e=>e.id===id);
 const visible=useMemo(()=>records.filter(r=>!filter||r.event_id===filter),[records,filter]);
 async function refresh(){
  setLoading(true);setError("");
  try{
   const r=await fetch("/api/wcda-events/correspondence",{cache:"no-store"});
   const response=await r.json() as {messages?:CaseMessage[];mailEnabled?:boolean;error?:string};
   if(!r.ok)throw new Error(response.error||"Could not load correspondence.");
   setRecords(response.messages||[]);setEnabled(response.mailEnabled===true);
  }catch(e){setError(e instanceof Error?e.message:"Correspondence service unavailable.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh()},[]);
 async function update(payload:Record<string,unknown>){
  if(busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/wcda-events/correspondence",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
   });
   const result=await r.json() as {message?:CaseMessage;acceptedByMicrosoft?:boolean;error?:string};
   if(!r.ok||!result.message)throw new Error(result.error||"Unable to update case correspondence.");
   if(payload.action==="prepare"){setEventId("");setKind("general");setSubject("");setBody("");}
   setNotice(payload.action==="prepare"?"Draft saved for independent management review.":
    payload.action==="approve"?"Message approved. An authorised manager can now dispatch it through Microsoft Graph.":
    "Microsoft Graph accepted the message for processing. Delivery to the recipient is not yet confirmed.");
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Correspondence action failed.");}
  finally{setBusy(false);}
 }
 function applyTemplate(id:string){
  if(!eventId){setError("Choose an event case first, then select a template.");return;}
  const event=eventFor(eventId);if(!event){setError("The selected event could not be loaded.");return;}
  const template=emailTemplate(id,event);setKind(templates.find(t=>t.id===id)?.kind||"general");setSubject(template.subject);setBody(template.body);setSelectedTemplate(id);setNotice("Template loaded. Complete every {{placeholder}} and verify the case details before saving.");
 }
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!eventId||subject.trim().length<8||body.trim().length<15)return;
  void update({action:"prepare",eventId,kind,subject,body});
 }
 return <section className={styles.root}>
  <header className={styles.header}>
   <div><span className={styles.overline}>MYWCDA EVENTS · MICROSOFT 365 CORRESPONDENCE</span>
    <h2>{isStaff?"Official correspondence & cases":"Messages & notifications"}</h2>
    <p>{isStaff?"Write case-specific communications, obtain independent approval and use Microsoft Graph for authorised dispatch.":"Messages accepted for sending by WCDA appear here once the Microsoft service is enabled."}</p>
   </div>
   <button type="button" className={styles.refresh} onClick={()=>void refresh()} disabled={busy||loading}>↻ Refresh</button>
  </header>
  {isStaff&&!enabled&&<div className={styles.warning}><strong>Microsoft email integration awaiting activation.</strong> Drafts and independent approvals can be prepared, but no emails can be dispatched until a verified mailbox, Graph application permissions and the administrator enable the service.</div>}
  {error&&<p className={styles.error} role="alert">{error}</p>}
  {notice&&<p className={styles.success} role="status">{notice}</p>}
  {canCompose&&<form className={styles.card} onSubmit={submit}>
   <div className={styles.composeHero}><div className={styles.brandMark}>WCDA<span>EVENTS</span></div><div><span className={styles.overline}>OFFICIAL COMMUNICATIONS STUDIO</span><h3>Make every message count.</h3><p>Choose a ready-made design, personalise the details and send it through the approved review process.</p></div><span className={styles.draftPill}>✦ DRAFT STUDIO</span></div>\n   <div className={styles.cardTitle}><h3>Choose an email template</h3><span>4 branded templates</span></div>\n   <div className={styles.templateGrid}>{templates.map(t=><button type="button" key={t.id} className={styles.templateCard} data-tone={t.tone} data-selected={selectedTemplate===t.id} onClick={()=>applyTemplate(t.id)}><span className={styles.templateIcon}>{t.icon}</span><span className={styles.templateTag}>{t.tag}</span><strong>{t.name}</strong><small>{t.desc}</small><span className={styles.useTemplate}>Use this template <b>→</b></span></button>)}</div>
   <p className={styles.small}>The recipient comes from the registered event applicant, not from an address typed into this form. Another authorised manager must approve before dispatch. Templates include a WCDA Events text masthead and branded signature in the outgoing email.</p>
   <div className={styles.form}>
    <label>Message category *<select value={kind} onChange={e=>setKind(e.target.value)}>{types.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
    <label className={styles.wide}>Subject *<input minLength={8} maxLength={160} required value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Event reference and purpose of correspondence"/></label>
    <label className={styles.wide}>Official message text *<textarea minLength={15} maxLength={5000} required rows={7} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write the specific notification or document request. Do not claim that an event has received approval unless confirmed by an authorised decision."/></label>
   </div>
   <footer className={styles.formFooter}><span>Messages are saved to the EMS case record and audited.</span><button type="submit" disabled={busy||!eventId||subject.trim().length<8||body.trim().length<15}>{busy?"Saving…":"Save draft for review"}</button></footer>
  </form>}
  <section className={styles.card}>
   <div className={styles.cardTitle}>
    <h3>{isStaff?"Case correspondence register":"Messages on your events"}</h3>
    <span>{visible.length} record(s)</span>
   </div>
   <label className={styles.filter}>Event filter<select value={filter} onChange={e=>setFilter(e.target.value)}>
    <option value="">All authorised events</option>{events.map(e=><option key={e.id} value={e.id}>{e.reference} · {e.name}</option>)}
   </select></label>
   {loading?<p className={styles.small}>Loading secure case correspondence…</p>:visible.length===0?
    <div className={styles.empty}>{isStaff?"No correspondence prepared for these cases.":"No official messages have been sent for your events."}</div>:
    <div className={styles.entries}>{visible.map(m=>{
     const canApproveThis=canApprove&&m.status==="draft"&&m.prepared_by_email!==actor.email;
     const canDispatch=canApprove&&enabled&&m.status==="approved"&&m.approved_by_email===actor.email;
     return <article key={m.id} className={styles.entry}>
      <div className={styles.entryHeader}>
       <div><span className={styles.overline}>{eventFor(m.event_id)?.reference||"EVENT"} · {types.find(t=>t.value===m.kind)?.label||title(m.kind)}</span>
        <h4>{m.subject}</h4><p>{day(m.created_at)}{isStaff?" · "+m.recipient_email:""}</p>
       </div>
       <span className={styles.status} data-status={m.status}>{m.status==="accepted"?"Accepted by Microsoft":title(m.status)}</span>
      </div>
      {(expanded===m.id||!isStaff)&&<div className={styles.message}>{m.body}</div>}
      <div className={styles.entryActions}>
       {isStaff&&<button type="button" className={styles.secondary} onClick={()=>setExpanded(expanded===m.id?null:m.id)}>{expanded===m.id?"Hide details":"Read message"}</button>}
       {canApproveThis&&<button type="button" disabled={busy} onClick={()=>void update({action:"approve",eventId:m.event_id,messageId:m.id})}>Approve message</button>}
       {canDispatch&&<button type="button" disabled={busy} onClick={()=>void update({action:"dispatch",eventId:m.event_id,messageId:m.id})}>Send through Microsoft Graph</button>}
      </div>
      {isStaff&&m.status==="uncertain"&&<p className={styles.caution}>Delivery outcome unknown. Do not resend; an administrator must inspect the sender’s Microsoft 365 Sent Items first.</p>}
      {m.status==="accepted"&&<p className={styles.small}>Microsoft accepted this message for processing. Recipient delivery is not independently confirmed.</p>}
     </article>;
    })}</div>}
  </section>
 </section>;
}
