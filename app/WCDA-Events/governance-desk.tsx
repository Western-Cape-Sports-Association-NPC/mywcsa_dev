"use client";

import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import type {EmsActor,EmsEvent} from "@/lib/ems/types";
import {exportWcdaApprovalLetterPdf,exportWcdaDraftPdf,exportWcdaEndorsementPdf} from "@/lib/ems/document-engine";
import styles from "./governance-desk.module.css";
import CertificateComposer from "./certificate-composer";

type Work={id:string;module:string;title:string;description:string;status:string;created_by_email:string;created_at:string};
type Draft={id:string;kind:string;title:string;body:string;status:"draft";created_by_email:string;created_at:string};
type Review={id:string;status:string;recommendation:string;requested_by_email:string;decision_reason:string|null;decided_by_email:string|null;requested_at:string};
type Dataset={work:Work[];drafts:Draft[];reviews:Review[];activeSigner:boolean;error?:string};
const moduleBySection:Record<string,string>={
 "Safety & Compliance":"safety",
 "Inspections & Corrective Actions":"inspections",
 "Contractors & Vendors":"vendors",
 "Personnel & Rosters":"personnel",
 "Logistics & Facilities":"logistics",
 "Access & Accreditation":"accreditation",
 "Live Operations Centre":"operations",
 "Incidents & Emergencies":"incidents",
 "Correspondence & Cases":"correspondence",
 "Finance & Payments":"finance",
 "Programmes & Scheduling":"scheduling",
};
const documentTabs=new Set(["Letters & Memoranda","Certificates & Verification","Documents & Records"]);
const decisionTabs=new Set(["Reviews & Endorsements"]);
const canRequestRole=new Set(["assessor","compliance","registrar","manager","super_admin","executive"]);
const canDraftRole=new Set(["certificates","registrar","manager","super_admin","executive"]);
const allowedModules:Record<string,string[]>={
 finance:["finance","manager","super_admin","executive"],
 safety:["compliance","operations","manager","super_admin","executive","assessor"],
 inspections:["compliance","operations","manager","super_admin","executive","assessor"],
 incidents:["compliance","operations","manager","super_admin","executive","assessor"],
 vendors:["operations","manager","super_admin","executive","registrar"],
 personnel:["operations","manager","super_admin","executive","registrar"],
 logistics:["operations","manager","super_admin","executive","registrar"],
 accreditation:["operations","manager","super_admin","executive","registrar"],
 operations:["operations","manager","super_admin","executive","registrar"],
 scheduling:["operations","manager","super_admin","executive","registrar"],
 correspondence:["operations","manager","super_admin","executive","registrar","assessor","compliance","finance","certificates"],
};
const formats:[string,string][]=[
 ["endorsement_letter","Event endorsement record (tabular)"],
 ["approval_letter","Approval correspondence"],
 ["certificate","Certificate draft"],
 ["memorandum","Memorandum"],
 ["other","Other document"],
];
const nice=(value:string)=>value.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const formatDate=(value:string)=>new Date(value).toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"});
const initial:Dataset={work:[],drafts:[],reviews:[],activeSigner:false};
function errorText(error:unknown){return error instanceof Error?error.message:"The request could not be completed.";}

export default function GovernanceDesk({actor,eventId,reference,section,event,onChange}:{
 actor:EmsActor;eventId:string;reference:string;event:EmsEvent;section:string;onChange?:()=>void
}){
 const module=moduleBySection[section];
 const documents=documentTabs.has(section);
 const decisions=decisionTabs.has(section);
 const [data,setData]=useState<Dataset>(initial);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [draftTitle,setDraftTitle]=useState("");
 const [draftBody,setDraftBody]=useState("");
 const [kind,setKind]=useState(section==="Certificates & Verification"?"certificate":"endorsement_letter");
 const [recommendation,setRecommendation]=useState("");
 const [decisionReasons,setDecisionReasons]=useState<Record<string,string>>({});
 const [openDraft,setOpenDraft]=useState<string|null>(null);
 const rows=useMemo(()=>data.work.filter(w=>w.module===module),[data.work,module]);
 const canCreate=!!module&&(allowedModules[module]||[]).includes(actor.role||"");
 const canDraft=canDraftRole.has(actor.role||"");
 const canRequest=canRequestRole.has(actor.role||"");

 const reload=useCallback(async()=>{
  if(!eventId)return;
  setLoading(true);
  try{
   const response=await fetch("/api/wcda-events/governance?eventId="+encodeURIComponent(eventId),{cache:"no-store"});
   const json=await response.json() as Dataset;
   if(!response.ok)throw new Error(json.error||"Unable to load governance records.");
   setData(json);
  }catch(error){setData(initial);setNotice(errorText(error));}
  finally{setLoading(false);}
 },[eventId]);
 useEffect(()=>{void reload();},[reload]);
 async function save(action:string,payload:Record<string,unknown>){
  if(busy)return false;
  setBusy(true);setNotice("");
  try{
   const response=await fetch("/api/wcda-events/governance",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({eventId,action,payload})
   });
   const json=await response.json() as {error?:string};
   if(!response.ok)throw new Error(json.error||"Could not save governance record.");
   await reload();onChange?.();
   setNotice("Saved securely. The event audit trail has been updated.");
   return true;
  }catch(error){setNotice(errorText(error));return false;}
  finally{setBusy(false);}
 }
 async function createWork(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("create_work",{module,title,description})){setTitle("");setDescription("");}
 }
 async function createDraft(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("create_draft",{kind,title:draftTitle,body:draftBody})){setDraftTitle("");setDraftBody("");}
 }
 async function recommend(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(await save("request_endorsement",{recommendation})){setRecommendation("");}
 }
 async function decide(id:string,decision:"approved"|"rejected"){
  if(await save("decide_endorsement",{reviewId:id,decision,reason:decisionReasons[id]||""}))
   setDecisionReasons(state=>({...state,[id]:""}));
 }
 function makeTemplate(){
  // Case-grounded templates are editable, explicitly drafts and never pre-authorised.
  const profile:Record<string,{title:string;opening:string;notes:string}>={
   endorsement_letter:{
    title:"DRAFT LETTER OF EVENT ENDORSEMENT",
    opening:"This letter records the event information supplied to the Western Cape Development Authority for assessment.",
    notes:"Record verified assessment findings and all lawful conditions. Do not state that endorsement has been granted until the separately authorised signatory records the decision."
   },
   approval_letter:{
    title:"DRAFT EVENT APPLICATION DECISION LETTER",
    opening:"This draft is prepared for communication of a future recorded event assessment decision.",
    notes:"Decision: [Not yet issued]. Insert only the decision and evidence confirmed in the official EMS case and applicable delegated approval process."
   },
   certificate:{
    title:"DRAFT EVENT ENDORSEMENT CERTIFICATE",
    opening:"CERTIFICATE NUMBER: [Not allocated]  |  STATUS: DRAFT — NOT ISSUED",
    notes:"This certificate is only an internal draft. It has no certification, endorsement or legal effect unless separately approved and issued by an authorised official."
   },
   memorandum:{
    title:"INTERNAL EVENTS ASSESSMENT MEMORANDUM",
    opening:"To: [Responsible directorate / official]\nFrom: [Preparing official and unit]\nSubject: Case assessment and required action",
    notes:"Purpose, verified findings, recommendation, required actions and responsible official: [Complete from case record]."
   },
   other:{
    title:"DRAFT EVENT CASE CORRESPONDENCE",
    opening:"To: [Recipient]\nPurpose: [Describe required response or notification]",
    notes:"State only verified event information and requested actions. This draft has not been approved for official dispatch."
   },
  };
  const template=profile[kind]||profile.other;
  if(kind==="approval_letter"){
   const approved=event.status==="endorsed";
   const rejected=event.status==="rejected";
   const decision=approved?"APPROVED / ENDORSED":rejected?"NOT APPROVED":"PENDING — NO APPROVAL RECORDED";
   setDraftTitle("OFFICIAL EVENT APPLICATION "+(approved?"APPROVAL":rejected?"DECISION":"STATUS")+" LETTER — "+event.name);
   setDraftBody([
    "WESTERN CAPE DEVELOPMENT AUTHORITY",
    "EVENTS & SAFETY DEPARTMENT",
    "",
    "To: "+event.organiser_name,
    "Subject: "+(approved?"Approval and endorsement of event application":rejected?"Outcome of event application":"Event application — assessment status"),
    "EMS case reference: "+reference,
    "",
    "Dear Event Organiser,",
    "",
    approved
     ?"The Western Cape Development Authority (WCDA), having considered the event particulars and the decision recorded on the WCDA Events Management System, confirms that the application identified below has been approved for WCDA endorsement, subject to the conditions in this letter."
     :rejected
      ?"The Western Cape Development Authority (WCDA) advises that the application identified below has not been approved. The recorded decision and reasons are set out for your attention."
      :"The Western Cape Development Authority (WCDA) acknowledges receipt of the application identified below. Assessment is not yet concluded and this letter does not constitute approval or endorsement.",
    "",
    "1. EVENT PARTICULARS",
    "Event name: "+event.name,
    "Organiser: "+event.organiser_name,
    "Category: "+event.category,
    "Venue: "+event.venue_name,
    "Venue address: "+(event.venue_address||"Not recorded"),
    "Event dates: "+event.start_date+" to "+event.end_date,
    "Decision status: "+decision,
    "Decision date: "+(event.decision_at||"Not recorded"),
    "Decision authority: "+(event.decision_by_email||"Not recorded"),
    "",
    "2. SCOPE OF WCDA DECISION",
    approved
     ?"This decision records WCDA's endorsement of the event application as assessed in the EMS case. It applies only to the event, organiser, venue and dates stated above. Any material change must be disclosed to WCDA and may require reassessment."
     :rejected
      ?"No WCDA endorsement is granted by this letter. The organiser must not represent this application as approved by WCDA."
      :"No approval, endorsement or permission is granted at this stage. A further written decision from an authorised WCDA official is required.",
    "",
    "3. CONDITIONS AND ORGANISER RESPONSIBILITIES",
    "The organiser remains responsible for:",
    "• Obtaining all municipal, venue, landowner and other competent-authority permissions, permits and licences required by law.",
    "• Implementing and maintaining an event-specific safety and emergency plan, including crowd management, access control, medical response and evacuation arrangements as applicable.",
    "• Ensuring competent event personnel, contractors and service providers are appointed and appropriately briefed.",
    "• Maintaining appropriate insurance and safeguarding arrangements where required.",
    "• Complying with applicable legislation, approved venue conditions, occupational health and safety requirements and lawful instructions of authorities.",
    "• Notifying WCDA promptly of incidents, material changes, postponement or cancellation.",
    "",
    "4. IMPORTANT LIMITATION",
    "WCDA endorsement is not a municipal event permit, land-use consent, venue booking, liquor licence, road closure approval, fire clearance, safety certificate or any other statutory authorisation. Those approvals must be obtained separately from the relevant competent authorities before the event proceeds.",
    "",
    "5. DECISION RECORD",
    "Recorded decision reasons: "+(event.decision_reason||"No decision rationale recorded in the case register."),
    "",
    "Please quote EMS reference "+reference+" in all correspondence with WCDA concerning this event.",
    "",
    "Yours faithfully,",
    "",
    "[Authorised WCDA signatory]",
    "Western Cape Development Authority",
    "Events & Safety Department",
    "Date of issue: [Complete on authorised issue]",
    "",
    "DOCUMENT CONTROL: This is a generated draft. It may be issued only after verification of the EMS decision, approval of the final wording and signature by an authorised official."
   ].join("\n"));
  }else{
   setDraftTitle((kind==="endorsement_letter"?"EVENT ENDORSEMENT & ASSESSMENT RECORD":template.title)+" — "+event.name);
   setDraftBody(kind==="endorsement_letter"?[
    "CONTROLLED EVENT ENDORSEMENT RECORD — DRAFT / NOT ISSUED","","CASE PARTICULARS",
    "EMS reference | "+reference,"Event | "+event.name,"Organiser | "+event.organiser_name,"Category | "+event.category,
    "Venue | "+event.venue_name,"Venue address | "+(event.venue_address||"Not recorded"),
    "Event dates | "+event.start_date+" to "+event.end_date,"Registry status | "+event.status,"",
    "ENDORSEMENT CONTROL",
    "Internal endorsement status | "+(event.status==="endorsed"?"Recorded as endorsed":event.status==="rejected"?"Not endorsed — rejected":"Not endorsed — pending / not recorded"),
    "Decision authority | "+(event.decision_by_email||"No decision recorded"),
    "Decision date | "+(event.decision_at||"Not recorded"),
    "Decision reasons | "+(event.decision_reason||"No decision rationale recorded"),"",
    "ASSESSMENT AND CONDITIONS",
    "Assessment summary | [Complete from verified checklist, risk assessment and supporting evidence]",
    "Conditions | Subject to applicable legislation, municipal and venue requirements, safety obligations, permits, licences and approvals of competent authorities.",
    "Evidence reviewed | [List verified document names / references; do not assume completeness]","",
    "Prepared by | "+actor.name,"Delegated signatory | Not assigned / not verified","Issue date | Not issued","",
    "DRAFT — NOT ISSUED. Internal WCDA record only; not a municipal permit, statutory authorisation, safety certificate or proof of approval."
   ].join("\n"):[template.opening,"","EMS case reference: "+reference,"Event name: "+event.name,"Organiser: "+event.organiser_name,"Recorded venue: "+event.venue_name,"Proposed dates: "+event.start_date+" to "+event.end_date,"","ASSESSMENT / EVENT CONTEXT","[Insert verified case facts.]","","VERIFICATION AND REQUIRED ACTION",template.notes,"","Supporting documents reviewed: [List verified evidence references]","Prepared by: "+actor.name+" (internal draft)","Signatory: [Not assigned or verified]","Issue date: [Not issued]","","DRAFT — NOT ISSUED. Not a permit, signed approval or issued certificate."].join("\n"));
  }
  setNotice("The "+nice(kind)+" template is ready to edit. Review all bracketed fields before saving.");
 }
 function exportDraft(d:Draft){
  if(d.kind==="endorsement_letter"){exportWcdaEndorsementPdf(event,reference);return;}
  if(d.kind==="approval_letter"){exportWcdaApprovalLetterPdf(event,reference);return;}
  exportWcdaDraftPdf(d.title,d.body,reference);
 }
 async function copyDraft(d:Draft){
  try{
   await navigator.clipboard.writeText("DRAFT — NOT ISSUED\n"+reference+"\n"+d.title+"\n\n"+d.body+"\n\nNOT A PERMIT, SIGNED ENDORSEMENT OR ISSUED CERTIFICATE.");
   setNotice("Draft text copied with its non-issued notice.");
  }catch{setNotice("Copy was blocked by your browser. Use the PDF download or select the preview text.");}
 }
 if(!module&&!documents&&!decisions)return null;
 return <section className={styles.desk} aria-label={section+" governance register"}>
   <div className={styles.heading}>
    <div><span className={styles.overline}>WCDA SECURE RECORDS · {reference}</span><h3>{decisions?"Review & independent sign-off":documents?"Controlled document drafting":section+" register"}</h3></div>
    <button className={styles.smallButton} type="button" disabled={loading||busy} onClick={()=>void reload()}>↻ Refresh</button>
   </div>
   {notice&&<div className={styles.notice} role="status">{notice}</div>}
   {loading?<p className={styles.empty}>Loading the secured case register…</p>:<>
    {!!module&&<>
     <p className={styles.help}>{module==="finance"?"Record internal finance follow-up, reconciliations and billing tasks. No invoice or payment is generated here.":module==="correspondence"?"Track correspondence and responses. This register does not send email or sync an inbox.":"Record event-specific operations, assignments and evidence. Entries retain a named employee and timestamp."}</p>
     <div className={styles.records}>
      {rows.map(item=><article key={item.id} className={styles.record}>
       <div><strong>{item.title}</strong><small>{item.created_by_email} · {formatDate(item.created_at)}</small><p>{item.description}</p></div>
       <div><span className={styles.status}>{nice(item.status)}</span>
       {(actor.email===item.created_by_email||["super_admin","executive","manager"].includes(actor.role||""))?
       <select aria-label={"Status for "+item.title} disabled={busy} value={item.status}
        onChange={e=>void save("set_work_status",{recordId:item.id,status:e.target.value})}>
        {["open","in_progress","blocked","completed"].map(s=><option key={s} value={s}>{nice(s)}</option>)}
       </select>:null}</div>
      </article>)}
      {!rows.length&&<p className={styles.empty}>No records in this module for the selected event.</p>}
     </div>
     {canCreate&&<form className={styles.form} onSubmit={createWork}>
      <h4>New {section.toLowerCase()} record</h4>
      <label>Subject or action<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Describe the work item"/></label>
      <label>Details and action taken<textarea value={description} maxLength={4000} rows={3} onChange={e=>setDescription(e.target.value)}/></label>
      <button disabled={busy} type="submit">{busy?"Saving…":"Save to event register"}</button>
     </form>}
    </>}
    {documents&&<>
     {section==="Certificates & Verification"&&canDraft&&
      <CertificateComposer key={event.id} actor={actor} event={event} onSaved={()=>void reload()}/>}
     <p className={styles.warning}>All documents in this section are internal drafts. No letter, permit or certificate is signed, sent or issued automatically. An authorised official must complete the relevant approval and document-control procedures.</p>
     <div className={styles.records}>{data.drafts.map(d=><article key={d.id} className={styles.record}>
      <div><strong>{d.title}</strong><small>{nice(d.kind)} · {d.created_by_email} · {formatDate(d.created_at)}</small><span className={styles.status}>DRAFT · NOT ISSUED</span></div>
      <button className={styles.smallButton} type="button" onClick={()=>setOpenDraft(openDraft===d.id?null:d.id)}>{openDraft===d.id?"Hide":"Preview"}</button>
      {openDraft===d.id&&<div className={styles.draftPreview}><b>DRAFT — NOT ISSUED</b><p><strong>{d.title}</strong></p><pre>{d.body}</pre><p>This document has not been signed or issued and is not evidence of legal approval.</p><div className={styles.actions}><button type="button" className={styles.smallButton} onClick={()=>copyDraft(d)}>Copy draft text</button>{d.kind!=="certificate"?<button type="button" className={styles.smallButton} onClick={()=>exportDraft(d)}>Download watermarked PDF</button>:<span className={styles.warning}>Use the Certificate template designer above for the correct table, issuer, stamp and footer layout when saving to PDF.</span>}</div></div>}
     </article>)}{!data.drafts.length&&<p className={styles.empty}>No document drafts have been prepared for this event.</p>}</div>
     {canDraft&&section!=="Certificates & Verification"&&<form className={styles.form} onSubmit={createDraft}>
       <h4>Prepare a document draft</h4>
       <p className={styles.help}>Select a document type and choose <strong>Fill from event</strong>. The title, organiser, venue, reference and dates will be populated from the case, ready for you to review.</p>
       <label>Document type<select value={kind} onChange={e=>setKind(e.target.value)}>{formats.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
       <button className={styles.smallButton} type="button" onClick={makeTemplate}>Fill from event →</button>
       <label>Document title<input required minLength={3} maxLength={180} value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}/></label>
       <label>Draft body<textarea required minLength={10} maxLength={10000} rows={6} value={draftBody} onChange={e=>setDraftBody(e.target.value)} placeholder="Enter verified facts and approved wording. Do not include a signature."/></label>
       <button disabled={busy||!draftTitle.trim()||draftBody.trim().length<10} type="submit">{busy?"Saving draft…":"Save draft to event record"}</button>
      </form>}
    </>}
    {decisions&&<>
     <p className={styles.help}>Assessment staff may recommend endorsement. The decision must be taken independently by a separately appointed signatory. A complete checklist and risk assessment are mandatory before endorsement; endorsement is not a statutory event permit.</p>
     <div className={styles.records}>{data.reviews.map(r=><article key={r.id} className={styles.record}>
      <div><strong>{nice(r.status)} recommendation</strong><small>Requested by {r.requested_by_email} · {formatDate(r.requested_at)}</small><p>{r.recommendation}</p>{r.decision_reason&&<p><b>Decision rationale:</b> {r.decision_reason} ({r.decided_by_email})</p>}</div>
      <span className={styles.status}>{nice(r.status)}</span>
      {r.status==="pending"&&data.activeSigner&&r.requested_by_email!==actor.email&&<div className={styles.decisionBox}>
       <label>Signatory's evidence-based reason<textarea required minLength={15} maxLength={3000} rows={3} value={decisionReasons[r.id]||""} onChange={e=>setDecisionReasons(v=>({...v,[r.id]:e.target.value}))}/></label>
       <div className={styles.actions}><button disabled={busy||(decisionReasons[r.id]||"").trim().length<15} onClick={()=>void decide(r.id,"approved")} type="button">Approve endorsement</button><button disabled={busy||(decisionReasons[r.id]||"").trim().length<15} onClick={()=>void decide(r.id,"rejected")} type="button" className={styles.danger}>Reject recommendation</button></div>
      </div>}
      {r.status==="pending"&&!data.activeSigner&&<p className={styles.warning}>Awaiting a separately appointed, verified signatory. This account cannot issue an endorsement.</p>}
     </article>)}{!data.reviews.length&&<p className={styles.empty}>No endorsement recommendation recorded.</p>}</div>
     {canRequest&&<form onSubmit={recommend} className={styles.form}>
      <h4>Submit recommendation for signatory review</h4>
      <label>Assessment findings and reasons<textarea value={recommendation} onChange={e=>setRecommendation(e.target.value)} rows={5} minLength={15} maxLength={3000} required placeholder="Summarise safety, venue, risk and documentary evidence…"/></label>
      <button type="submit" disabled={busy||data.reviews.some(r=>r.status==="pending")}>{busy?"Saving…":"Submit recommendation"}</button>
     </form>}
    </>}
   </>}
 </section>;
}