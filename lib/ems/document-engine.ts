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
 const left=19,right=191,width=right-left;
 const approved=event.status==="endorsed",rejected=event.status==="rejected";
 const status=approved?"APPROVED / ENDORSED":rejected?"NOT APPROVED":"PENDING — NO APPROVAL RECORDED";
 const navy:[number,number,number]=[0,20,132],ink:[number,number,number]=[35,52,79];
 let y=0,page=1;
 const header=()=>{
  pdf.setFillColor(...navy);pdf.rect(0,0,210,37,"F");
  pdf.setTextColor(255,255,255);pdf.setFont("helvetica","bold");pdf.setFontSize(13);
  pdf.text("WESTERN CAPE DEVELOPMENT AUTHORITY",left,14);
  pdf.setFontSize(8.5);pdf.text("EVENTS & SAFETY DEPARTMENT",left,21);
  pdf.setFontSize(15);pdf.text("EVENT APPLICATION DECISION LETTER",left,31);
  pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8);
  pdf.text("EMS CASE: "+reference,left,45);pdf.text("DATE: "+(event.decision_at?date(event.decision_at):"TO BE COMPLETED ON ISSUE"),right,45,{align:"right"});
  pdf.setDrawColor(205,216,234);pdf.line(left,49,right,49);
 };
 const footer=()=>{
  pdf.setDrawColor(205,216,234);pdf.line(left,282,right,282);
  pdf.setTextColor(95,108,130);pdf.setFont("helvetica","normal");pdf.setFontSize(7);
  pdf.text("WCDA Events | Controlled correspondence | "+reference+" | Page "+page,left,288);
  if(!approved||!event.decision_at){pdf.setTextColor(160,55,55);pdf.setFont("helvetica","bold");pdf.setFontSize(9);pdf.text("DRAFT — NOT ISSUED",right,288,{align:"right"});}
 };
 header();y=59;
 const addText=(text:string,size=9,bold=false,indent=0)=>{
  pdf.setFont("helvetica",bold?"bold":"normal");pdf.setFontSize(size);pdf.setTextColor(...ink);
  const lines=pdf.splitTextToSize(text,width-indent) as string[];
  for(const line of lines){if(y>269){footer();pdf.addPage();page++;header();y=59;}
   pdf.text(line,left+indent,y);y+=size>=10?5.5:4.7;}
 };
 const heading=(text:string)=>{y+=2;addText(text,9,true);y+=2;};
 addText("To: "+event.organiser_name,9,true);
 addText("Event organiser",8);
 y+=2;addText("SUBJECT: "+(approved?"APPROVAL AND ENDORSEMENT OF EVENT APPLICATION":rejected?"OUTCOME OF EVENT APPLICATION":"EVENT APPLICATION — ASSESSMENT STATUS"),10,true);y+=2;
 pdf.setFillColor(approved?230:rejected?250:255,approved?241:rejected?235:247,approved?233:rejected?235:230);pdf.rect(left,y-3,width,10,"F");
 pdf.setTextColor(...(approved?[25,105,65]:rejected?[145,45,45]:[130,85,25]) as [number,number,number]);pdf.setFont("helvetica","bold");pdf.setFontSize(9);pdf.text("DECISION: "+status,left+3,y+3);y+=13;
 addText("Dear Event Organiser,",9,false);y+=2;
 addText(approved
  ?"The Western Cape Development Authority (WCDA), having considered the event particulars and the decision recorded on the WCDA Events Management System, confirms that the application identified below has been approved for WCDA endorsement, subject to the conditions set out in this letter."
  :rejected
   ?"The Western Cape Development Authority (WCDA) advises that the application identified below has not been approved. The recorded decision and reasons are provided for your attention."
   :"The Western Cape Development Authority (WCDA) acknowledges the application identified below. Assessment has not been concluded. This correspondence is a status notification only and does not constitute approval or endorsement.",9);
 heading("1. EVENT PARTICULARS");
 const rows:[string,string][]=[
  ["EMS reference",reference],["Event",event.name],["Organiser",event.organiser_name],
  ["Category",event.category||"Not recorded"],["Venue",event.venue_name||"Not recorded"],
  ["Venue address",event.venue_address||"Not recorded"],["Event dates",event.start_date+" to "+event.end_date],
  ["Decision status",status],["Decision authority",event.decision_by_email||"Not recorded"],
  ["Decision date",event.decision_at?date(event.decision_at):"Not recorded"]
 ];
 const labelW=43;
 for(const [label,value] of rows){
  const vl=pdf.splitTextToSize(value||"—",width-labelW-7) as string[];
  const h=Math.max(7,vl.length*4+3);
  if(y+h>269){footer();pdf.addPage();page++;header();y=59;}
  pdf.setFillColor(244,247,252);pdf.rect(left,y,width,h,"F");pdf.setDrawColor(220,227,238);pdf.rect(left,y,width,h);
  pdf.setTextColor(...navy);pdf.setFont("helvetica","bold");pdf.setFontSize(7.5);pdf.text(label.toUpperCase(),left+2,y+4.5);
  pdf.setTextColor(...ink);pdf.setFont("helvetica","normal");pdf.setFontSize(8);vl.forEach((line,i)=>pdf.text(line,left+labelW,y+4.5+i*4));
  y+=h;
 }
 heading("2. SCOPE OF THE DECISION");
 addText(approved
  ?"This decision records WCDA's endorsement of the event application as assessed in the EMS case. It applies only to the event, organiser, venue and dates stated in this letter. Any material change must be disclosed to WCDA and may require reassessment."
  :rejected
   ?"No WCDA endorsement is granted. The organiser must not represent this application as approved by WCDA."
   :"No approval, endorsement or permission is granted at this stage. A further written decision from an authorised WCDA official is required.",8.5);
 heading("3. CONDITIONS AND ORGANISER RESPONSIBILITIES");
 const obligations=[
  "Obtain all municipal, venue, landowner and other competent-authority permissions, permits and licences required by law.",
  "Implement and maintain an event-specific safety and emergency plan, including crowd management, access control, medical response and evacuation arrangements as applicable.",
  "Ensure competent event personnel, contractors and service providers are appointed and appropriately briefed.",
  "Maintain appropriate insurance and safeguarding arrangements where required.",
  "Comply with applicable legislation, venue conditions, occupational health and safety requirements and lawful instructions of authorities.",
  "Notify WCDA promptly of incidents, material changes, postponement or cancellation."
 ];
 for(let i=0;i<obligations.length;i++)addText((i+1)+". "+obligations[i],8);
 heading("4. STATUTORY LIMITATION");
 addText("WCDA endorsement is not a municipal event permit, land-use consent, venue booking, liquor licence, road closure approval, fire clearance, safety certificate or any other statutory authorisation. Those approvals must be obtained separately from the relevant competent authorities before the event proceeds.",8);
 heading("5. DECISION REASONS");
 addText(event.decision_reason||"No decision rationale is recorded in the EMS case register.",8);
 y+=4;addText("Please quote EMS reference "+reference+" in all correspondence with WCDA concerning this event.",8.5);
 y+=4;addText("Yours faithfully,",9);y+=10;addText("[Authorised WCDA signatory]",9,true);addText("Western Cape Development Authority");addText("Events & Safety Department");addText("Date of issue: [Complete on authorised issue]");
 footer();
 if(!approved||!event.decision_at){pdf.setTextColor(160,55,55);pdf.setFont("helvetica","bold");pdf.setFontSize(12);pdf.text("DRAFT — NOT ISSUED",105,274,{align:"center"});}
 pdf.save("WCDA-"+reference.replace(/[^A-Za-z0-9-]/g,"-")+"-APPROVAL-LETTER.pdf");
}
