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
 if(invoice.status==="pending_approval"||invoice.status==="cancelled"){pdf.setTextColor(170,50,50);pdf.setFont("helvetica","bold");pdf.setFontSize(16);pdf.text(invoice.status==="cancelled"?"CANCELLED":"DRAFT - NOT APPROVED",105,260,{align:"center"});}\n pdf.setFontSize(7.5);pdf.setTextColor(93,107,129);
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
