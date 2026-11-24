"use client";
import {jsPDF} from "jspdf";
import type {EmsEvent} from "./types";
export type InvoiceDocument={id:string;event_id:string;reference:string;description:string;amount_cents:number;currency:"ZAR";customer_email:string;status:string;created_at:string;paid_at:string|null};
export type InvoiceReceipt={receipt_reference:string;paid_at:string;amount_cents:number;provider_transaction_id:string};
const zar=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
const date=(value:string)=>new Intl.DateTimeFormat("en-ZA",{day:"2-digit",month:"short",year:"numeric",timeZone:"Africa/Johannesburg"}).format(new Date(value));
const safe=(value:string)=>String(value||"—").replace(/[\r\n\t]+/g," ").slice(0,240);
export function exportWcdaInvoice(invoice:InvoiceDocument,event?:EmsEvent,receipt?:InvoiceReceipt|null){
 const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
 const left=17,right=193,width=right-left;
 const total=invoice.amount_cents;
 const paid=invoice.status==="paid"?Math.min(total,receipt?.amount_cents??total):0;
 const due=Math.max(0,total-paid);
 const created=new Date(invoice.created_at);
 const dueDate=new Date(created);dueDate.setDate(dueDate.getDate()+14);
 const organiser=safe(event?.organiser_name||"Event organiser");
 const description=safe(invoice.description);
 const address=["7 Bree Street","Touchstone House","Cape Town","8001"].join("\n");
 pdf.setFillColor(0,20,132);pdf.rect(0,0,210,40,"F");
 pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(18);pdf.text("WESTERN CAPE SPORTS ASSOCIATION NPC",left,16);
 pdf.setFontSize(10);pdf.text("WCDA EVENTS · FINANCE & COMMERCIAL SERVICES",left,23);
 pdf.setFontSize(20);pdf.text(invoice.status==="approved_for_payment"||invoice.status==="paid"?"TAX INVOICE":"DRAFT TAX INVOICE",right,34,{align:"right"});
 pdf.setTextColor(35,52,79);pdf.setFont("helvetica","bold");pdf.setFontSize(11);pdf.text("BILL TO",left,52);
 pdf.setFont("helvetica","normal");pdf.setFontSize(10);
 let y=59;for(const line of [organiser,...address.split("\n")]){pdf.text(line,left,y);y+=5;}
 pdf.setFont("helvetica","bold");pdf.text("Date",135,52);pdf.text("Invoice Number",135,62);pdf.text("Due Date",135,72);
 pdf.setFont("helvetica","normal");pdf.text(date(invoice.created_at),right,52,{align:"right"});pdf.text(invoice.reference,right,62,{align:"right"});pdf.text(date(dueDate.toISOString()),right,72,{align:"right"});
 y=92;
 pdf.setFillColor(0,20,132);pdf.rect(left,y,width,11,"F");
 pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(8);
 const cols=[left+2,left+32,left+119,left+139,left+155,right-2];
 ["Date","Description","Quantity","Unit Price","VAT","Amount (ZAR)"].forEach((v,i)=>pdf.text(v,cols[i],y+7,{align:i===0||i===1?"left":"right"}));
 y+=11;pdf.setTextColor(35,52,79);pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);
 pdf.text(date(invoice.created_at),cols[0],y+8);
 const wrapped=pdf.splitTextToSize(description,82) as string[];
 wrapped.slice(0,4).forEach((line,i)=>pdf.text(line,cols[1],y+8+i*4.5));
 pdf.text("1",cols[2],y+8,{align:"right"});pdf.text(zar(total),cols[3],y+8,{align:"right"});pdf.text(zar(0),cols[4],y+8,{align:"right"});pdf.text(zar(total),cols[5],y+8,{align:"right"});
 y+=Math.max(19,wrapped.slice(0,4).length*4.5+12);
 pdf.setDrawColor(207,217,232);pdf.line(left,y,right,y);y+=10;
 const totals=[["Subtotal",zar(total)],["Total VAT",zar(0)],["Total Inc VAT",zar(total)]];
 totals.forEach(([label,value],i)=>{pdf.setFont("helvetica",i===2?"bold":"normal");pdf.setFontSize(i===2?11:9.5);pdf.text(label,140,y);pdf.text(value,right,y,{align:"right"});y+=7;});
 y+=7;pdf.setDrawColor(207,217,232);pdf.line(left,y,right,y);y+=10;
 pdf.setFont("helvetica","bold");pdf.setFontSize(10);pdf.text("Amount Received",left,y);pdf.text(zar(paid),right,y,{align:"right"});
 y+=7;pdf.text("Total Due",left,y);pdf.setTextColor(due>0?155:30,due>0?55:100,due>0?55:70);pdf.text(zar(due),right,y,{align:"right"});pdf.setTextColor(35,52,79);
 y+=17;pdf.setFont("helvetica","bold");pdf.setFontSize(10);pdf.text("Account Details",left,y);y+=7;
 pdf.setFont("helvetica","normal");pdf.setFontSize(9);
 for(const line of ["GoTyme Bank","Account Name: Western Cape Sports Association NPC","Account #: 53003631141","Branch Code: 678910","Due Date: "+date(dueDate.toISOString()),""]) {pdf.text(line,left,y);y+=5;}
 if(invoice.status==="pending_approval"||invoice.status==="cancelled"){pdf.setTextColor(170,50,50);pdf.setFont("helvetica","bold");pdf.setFontSize(16);pdf.text(invoice.status==="cancelled"?"CANCELLED":"DRAFT - NOT APPROVED",105,260,{align:"center"});}
 pdf.setFontSize(7.5);pdf.setTextColor(93,107,129);
 const note="VAT shown as R0.00. Supplier VAT registration details have not been supplied to this document engine. Confirm WCSA VAT registration and VAT number before treating this as a statutory tax invoice or charging VAT.";
 for(const line of pdf.splitTextToSize(note,width) as string[]){pdf.text(line,left,y);y+=4;}
 y+=5;pdf.setDrawColor(0,20,132);pdf.line(left,y,right,y);y+=6;
 pdf.setFont("helvetica","bold");pdf.setFontSize(8);pdf.setTextColor(0,20,132);
 pdf.text("Company Registration No: 2026/693831/08",left,y);
 y+=5;pdf.setFont("helvetica","normal");pdf.setFontSize(7.5);pdf.setTextColor(70,83,105);
 pdf.text("Registered Office: 7 Bree St, Touchstone House, Cape Town, 8001, South Africa",left,y);
 pdf.save("WCDA-"+invoice.reference+"-Invoice.pdf");
}
export function exportWcdaDraftPdf(title:string,body:string,reference:string){
 const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
 const left=19,width=172;let y=60,page=1;
 const header=()=>{pdf.setDrawColor(0,20,132);pdf.setLineWidth(1.2);pdf.line(19,18,191,18);pdf.setTextColor(0,20,132);pdf.setFont("helvetica","bold");pdf.setFontSize(13);pdf.text("WESTERN CAPE DEVELOPMENT AUTHORITY",19,27);pdf.setFontSize(9);pdf.text("EVENTS & SAFETY DEPARTMENT",19,34);pdf.setTextColor(45,66,101);pdf.text("CONTROLLED DOCUMENT DRAFT | "+reference,19,43);pdf.setDrawColor(195,210,232);pdf.line(19,48,191,48);};
 const footer=()=>{pdf.setTextColor(165,60,60);pdf.setFont("helvetica","bold");pdf.setFontSize(17);pdf.text("DRAFT - NOT ISSUED",105,277,{align:"center"});pdf.setFontSize(8);pdf.setTextColor(88,99,120);pdf.text("Not an issued certificate, signed endorsement or statutory permit. Page "+page,19,287);};
 header();pdf.setFont("helvetica","bold");pdf.setTextColor(17,39,90);pdf.setFontSize(13);
 for(const line of pdf.splitTextToSize(title,width) as string[]){pdf.text(line,left,y);y+=6.5;}y+=5;
 pdf.setFont("helvetica","normal");pdf.setFontSize(10);pdf.setTextColor(38,54,77);
 for(const paragraph of body.split("\n")){const lines=pdf.splitTextToSize(paragraph||" ",width) as string[];for(const line of lines){if(y>254){footer();pdf.addPage();page++;header();y=60;}pdf.text(line,left,y);y+=5.5;}y+=2;}
 footer();pdf.save("WCDA-"+reference.replace(/[^A-Za-z0-9-]/g,"-")+"-DRAFT.pdf");
}

export function exportWcdaEndorsementPdf(event:EmsEvent,reference:string){
 const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
 const left=17,right=193,width=right-left;
 const navy:[number,number,number]=[0,20,132];
 const ink:[number,number,number]=[35,52,79];
 pdf.setFillColor(...navy);pdf.rect(0,0,210,39,"F");
 pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(14);
 pdf.text("WESTERN CAPE DEVELOPMENT AUTHORITY",left,15);
 pdf.setFontSize(9);pdf.text("MYWCDA EVENTS  |  ENDORSEMENT & GOVERNANCE",left,23);
 pdf.setFontSize(17);pdf.text("EVENT ENDORSEMENT RECORD",left,33);
 pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(9);
 pdf.text("CONTROLLED CASE DOCUMENT  •  EMS "+reference, left,48);
 let y=57;
 const rows:[string,string][]=[
  ["EMS CASE REFERENCE",reference],
  ["EVENT",event.name],
  ["ORGANISER",event.organiser_name],
  ["EVENT CATEGORY",event.category||"Not recorded"],
  ["VENUE",event.venue_name||"Not recorded"],
  ["VENUE ADDRESS",event.venue_address||"Not recorded"],
  ["EVENT DATES",event.start_date+" to "+event.end_date],
  ["REGISTRY STATUS",event.status.replaceAll("_"," ").toUpperCase()],
  ["ENDORSEMENT STATUS",event.status==="endorsed"?"RECORDED AS ENDORSED":event.status==="rejected"?"NOT ENDORSED — REJECTED":"NOT ENDORSED — NO FINAL DECISION RECORDED"],
  ["DECISION AUTHORITY",event.decision_by_email||"No decision recorded"],
  ["DECISION DATE",event.decision_at?date(event.decision_at):"Not recorded"],
  ["DECISION REASONS",event.decision_reason||"No decision rationale recorded"]
 ];
 const labelW=48;
 for(const [label,value] of rows){
  pdf.setFont("helvetica","bold");pdf.setFontSize(8);const labelLines=pdf.splitTextToSize(label,labelW-5) as string[];
  pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);const valueLines=pdf.splitTextToSize(value||"—",width-labelW-7) as string[];
  const h=Math.max(10,Math.max(labelLines.length,valueLines.length)*4.2+4);
  pdf.setFillColor(y%2?247:239,y%2?249:244,y%2?253:250);pdf.rect(left,y,width,h,"F");
  pdf.setDrawColor(211,220,235);pdf.rect(left,y,width,h);
  pdf.setTextColor(...navy);pdf.setFont("helvetica","bold");pdf.setFontSize(7.5);
  labelLines.forEach((line,i)=>pdf.text(line,left+3,y+5+i*4));
  pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);
  valueLines.forEach((line,i)=>pdf.text(line,left+labelW,y+5+i*4));
  y+=h;
 }
 y+=7;
 pdf.setTextColor(...navy);pdf.setFont("helvetica","bold");pdf.setFontSize(10);pdf.text("ASSESSMENT & CONDITIONS",left,y);y+=6;
 pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);
 const conditions="Any endorsement remains subject to applicable legislation, municipal and venue requirements, safety obligations, permits, licences and approvals of the relevant competent authorities. This internal endorsement does not replace any statutory approval.";
 for(const line of pdf.splitTextToSize(conditions,width) as string[]){pdf.text(line,left,y);y+=4.5;}
 y+=8;
 pdf.setDrawColor(160,175,200);pdf.line(left,y,right,y);y+=8;
 pdf.setFont("helvetica","bold");pdf.setFontSize(8);pdf.text("PREPARED BY",left,y);pdf.text("DELEGATED SIGNATORY",105,y);y+=13;
 pdf.setDrawColor(120,135,160);pdf.line(left,y,left+70,y);pdf.line(105,y,right,y);y+=5;
 pdf.setFont("helvetica","normal");pdf.setFontSize(7.5);pdf.text("Name / role: ____________________",left,y);pdf.text("Name / authority: ____________________",105,y);y+=9;
 pdf.setFont("helvetica","bold");pdf.setTextColor(160,55,55);pdf.setFontSize(16);pdf.text("DRAFT — NOT ISSUED",105,270,{align:"center"});
 pdf.setTextColor(85,99,120);pdf.setFont("helvetica","normal");pdf.setFontSize(7.5);
 pdf.text("Internal WCDA case record only. Not a permit, statutory authorisation or safety certificate.",left,282);
 pdf.text("Generated from EMS case data. Verify all entries and supporting evidence before any formal decision.",left,287);
 pdf.save("WCDA-"+reference.replace(/[^A-Za-z0-9-]/g,"-")+"-ENDORSEMENT-DRAFT.pdf");
}

export function exportWcdaApprovalLetterPdf(event:EmsEvent,reference:string){
 const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
 const left=16,right=194,width=right-left,labelW=48;
 const navy:[number,number,number]=[0,20,132],ink:[number,number,number]=[35,52,79];
 const approved=event.status==="endorsed",rejected=event.status==="rejected";
 const status=approved?"APPROVED / ENDORSED":rejected?"NOT APPROVED":"PENDING — NO APPROVAL RECORDED";
 const issued=approved&&!!event.decision_at;
 let y=0,page=1;
 const header=()=>{
  pdf.setFillColor(...navy);pdf.rect(0,0,210,42,"F");
  pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(13);
  pdf.text("WESTERN CAPE DEVELOPMENT AUTHORITY",left,13);
  pdf.setFontSize(8);pdf.text("EVENTS & SAFETY DEPARTMENT  |  OFFICIAL CORRESPONDENCE",left,20);
  pdf.setFontSize(15);pdf.text("EVENT APPLICATION DECISION",left,31);
  pdf.setFontSize(7.5);pdf.text("CONTROLLED DOCUMENT  •  WCDA / EMS",left,37);
  pdf.setTextColor(...ink);pdf.setFont("helvetica","bold");pdf.setFontSize(8);
  pdf.text("REFERENCE: "+reference,left,49);
  pdf.text("DATE: "+(event.decision_at?date(event.decision_at):"ON FORMAL ISSUE"),right,49,{align:"right"});
  pdf.setDrawColor(190,203,225);pdf.line(left,53,right,53);
 };
 const footer=()=>{
  pdf.setDrawColor(190,203,225);pdf.line(left,282,right,282);
  pdf.setTextColor(88,101,123);pdf.setFont("helvetica","normal");pdf.setFontSize(7);
  pdf.text("WESTERN CAPE DEVELOPMENT AUTHORITY  |  EVENTS & SAFETY  |  "+reference,left,287);
  pdf.text("PAGE "+page,right,287,{align:"right"});
  if(!issued){pdf.setTextColor(155,45,45);pdf.setFont("helvetica","bold");pdf.text("DRAFT — NOT ISSUED",105,277,{align:"center"});}
 };
 const newPage=()=>{footer();pdf.addPage();page++;header();y=61;};
 const section=(n:string,title:string)=>{
  if(y>263)newPage();
  pdf.setFillColor(...navy);pdf.rect(left,y,width,7,"F");
  pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(8);
  pdf.text(n+"  |  "+title.toUpperCase(),left+2,y+4.8);y+=8;
 };
 const row=(label:string,value:string)=>{
  pdf.setFont("helvetica","bold");pdf.setFontSize(7.3);
  const ll=pdf.splitTextToSize(label.toUpperCase(),labelW-5) as string[];
  pdf.setFont("helvetica","normal");pdf.setFontSize(8);
  const vl=pdf.splitTextToSize(value||"—",width-labelW-7) as string[];
  const h=Math.max(7,Math.max(ll.length,vl.length)*4+3);
  if(y+h>270)newPage();
  pdf.setFillColor(246,248,252);pdf.rect(left,y,width,h,"F");
  pdf.setDrawColor(213,222,236);pdf.rect(left,y,width,h);
  pdf.setDrawColor(213,222,236);pdf.line(left+labelW,y,left+labelW,y+h);
  pdf.setTextColor(...navy);pdf.setFont("helvetica","bold");pdf.setFontSize(7.3);
  ll.forEach((line,i)=>pdf.text(line,left+2,y+4.5+i*4));
  pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8);
  vl.forEach((line,i)=>pdf.text(line,left+labelW+2,y+4.5+i*4));
  y+=h;
 };
 const rows=(items:[string,string][])=>items.forEach(([a,b])=>row(a,b));
 header();y=61;
 row("To",""+event.organiser_name+" — Event Organiser");
 row("Subject",approved?"Formal approval and endorsement of event application":rejected?"Formal notification of unsuccessful event application":"Official notification of application status");
 row("Decision status",status);
 y+=3;
 pdf.setFillColor(approved?231:rejected?250:255,approved?242:rejected?236:247,approved?235:rejected?236:230);
 pdf.rect(left,y,width,10,"F");pdf.setTextColor(...(approved?[25,91,58]:rejected?[145,43,43]:[130,82,20]) as [number,number,number]);
 pdf.setFont("helvetica","bold");pdf.setFontSize(9);pdf.text("OFFICIAL DECISION: "+status,left+3,y+6.5);y+=14;
 pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);
 const opening=approved
  ?"The Western Cape Development Authority (WCDA), acting through its applicable event assessment and delegated decision process, hereby gives formal notice that the application detailed in this letter has been approved for WCDA endorsement, subject to the recorded particulars and conditions below."
  :rejected
   ?"The Western Cape Development Authority (WCDA) hereby gives formal notice that the application detailed in this letter has not been approved. The decision particulars and recorded reasons are set out below."
   :"The Western Cape Development Authority (WCDA) acknowledges the application detailed below. The assessment process remains pending. This notice is for information only and confers no approval, endorsement or authority to proceed.";
 const openingLines=pdf.splitTextToSize(opening,width) as string[];
 for(const line of openingLines){if(y>269)newPage();pdf.text(line,left,y);y+=4.5;}
 y+=3;
 section("01","Official event particulars");
 rows([
  ["EMS case reference",reference],["Event title",event.name],["Applicant / organising entity",event.organiser_name],
  ["Event classification",event.category||"Not recorded"],["Approved / proposed venue",event.venue_name||"Not recorded"],
  ["Physical venue address",event.venue_address||"Not recorded"],["Event period",event.start_date+" to "+event.end_date]
 ]);
 y+=3;section("02","Decision and authority record");
 rows([
  ["Administrative outcome",status],["Decision date",event.decision_at?date(event.decision_at):"Not recorded"],
  ["Recorded decision-maker",event.decision_by_email||"Not recorded"],
  ["Decision reasons / basis",event.decision_reason||"No decision rationale recorded in the EMS register."]
 ]);
 y+=3;section("03","Extent and application of decision");
 row("WCDA determination",approved
  ?"WCDA endorsement is granted solely in respect of the event, applicant, venue and event period identified in Section 01, as assessed and recorded in the EMS case. The endorsement does not extend to materially amended event arrangements."
  :rejected
   ?"No WCDA endorsement is granted in respect of this application. The applicant may not represent the event as approved or endorsed by WCDA."
   :"No approval or endorsement has been granted. The applicant must await a further written decision issued by an authorised WCDA official.");
 y+=3;section("04","Conditions and obligations imposed on the organiser");
 const conditions=[
  ["01","Statutory permissions","Obtain all permits, licences, consents and permissions required from the municipality, venue owner and every other competent authority."],
  ["02","Event safety","Prepare, implement and maintain an event-specific safety and emergency plan, including crowd management, access control, medical response and evacuation arrangements, as applicable."],
  ["03","Personnel and contractors","Ensure that event personnel, contractors and service providers are competent, appropriately appointed and adequately briefed."],
  ["04","Insurance and safeguarding","Maintain insurance, safeguarding and risk-control arrangements where required by law, venue conditions or the event risk profile."],
  ["05","Legal compliance","Comply with applicable legislation, occupational health and safety requirements, approved venue conditions and lawful directions issued by competent authorities."],
  ["06","Changes and incidents","Notify WCDA without delay of any material change to the event, incident, postponement or cancellation."]
 ];
 conditions.forEach(([no,topic,detail])=>row(no+"  "+topic,detail));
 y+=3;section("05","Statutory status and limitation");
 row("Legal effect","WCDA endorsement is an administrative endorsement only. It is not a municipal event permit, land-use consent, venue booking, liquor licence, road-closure approval, fire clearance, safety certificate or any other statutory authorisation. The organiser remains responsible for obtaining all separate approvals from the competent authorities before the event takes place.");
 y+=3;section("06","Official correspondence and verification");
 rows([
  ["Enquiries","All correspondence must quote EMS case reference "+reference+"."],
  ["Document status",issued?"Issued subject to the recorded decision and authorised sign-off.":"Generated draft only — not approved for dispatch or reliance."],
  ["Verification","The recipient should verify the authenticity of this correspondence with WCDA using the EMS case reference."]
 ]);
 y+=5;section("07","Authorisation and issue control");
 rows([
  ["Authorised signatory","[Full name and official designation]"],
  ["Delegated authority","[Applicable delegation / authority reference]"],
  ["Signature","[Authorised signature]"],
  ["Date of issue","[To be completed by the authorised issuing office]"]
 ]);
 y+=4;
 pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8.5);
 const closing="Yours faithfully,";
 pdf.text(closing,left,y);y+=7;pdf.setFont("helvetica","bold");pdf.text("[AUTHORISED WCDA SIGNATORY]",left,y);y+=4.5;
 pdf.setFont("helvetica","normal");pdf.text("Western Cape Development Authority",left,y);y+=4;pdf.text("Events & Safety Department",left,y);
 footer();
 pdf.save("WCDA-"+reference.replace(/[^A-Za-z0-9-]/g,"-")+"-OFFICIAL-DECISION-LETTER.pdf");
}
