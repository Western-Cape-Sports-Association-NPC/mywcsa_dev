import Link from "next/link";
import type {CSSProperties} from "react";
import {AuthError} from "next-auth";
import {auth,signIn,signOut} from "@/auth";
import {redirect} from "next/navigation";
import {getEmsActor} from "@/lib/ems/server";
import EmsWorkspace from "../workspace";

export const dynamic="force-dynamic";
export const metadata={title:"MyWCDA Events | Organiser Portal",description:"Secure event organiser and business partner portal."};
type Query={error?:string;type?:string};
export default async function OrganiserPortal({searchParams}:{searchParams:Promise<Query>}){
 const q=await searchParams;
 const session=await auth();
 const provider=(session?.user as ({authProvider?:string}|undefined))?.authProvider;
 if(session?.user){
  if(provider!=="external-user"&&provider!=="business-partner"){
   return <main style={shell}><section style={panel}><Brand/><h1>This portal is for external organisers and business partners</h1><p>Your current GovApps session is not an external or business-partner account. Switch accounts to continue.</p><form action={async()=>{"use server";await signOut({redirectTo:"/WCDA-Events/portal"});}}><button style={primary}>Switch account</button></form></section></main>;
  }
  const actor=await getEmsActor();
  if(actor?.mode==="organiser")return <EmsWorkspace actor={actor}/>;
  const partner=provider==="business-partner";
  return <main style={shell}><section style={panel}><Brand/><span style={eyebrow}>ACCOUNT CREATED · ACCESS CONTROL</span><h1>Your account is ready.</h1><p>{partner?"Your organisation must request WCDA Events access through its Business Partner workspace.":"Your WCDA Events access request must be approved before event records and applications are available."}</p><div style={statusBox}><strong>Access status</strong><span>Awaiting WCDA authorisation</span><small>Your GovApps account remains the same account used for the wider GovApps platform. Staff capture and personnel tools are not available in this portal.</small></div><Link href={partner?"/partner":"/external"} style={primary}>Continue to your GovApps account →</Link><form action={async()=>{"use server";await signOut({redirectTo:"/WCDA-Events/portal"});}}><button style={secondary}>Sign out</button></form></section></main>;
 }
 const destination="/WCDA-Events/portal";
 function normaliseIdentifier(value:string){const m=/^(\\d{4})(\\d{2})(\\d{2})$/.exec(value);if(!m)return value;const [,year,day,month]=m;const iso=year+"-"+month+"-"+day;const date=new Date(iso+"T00:00:00.000Z");return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===iso?iso:value;}
 async function signInExternal(form:FormData):Promise<void>{
  "use server";
  const identifier=normaliseIdentifier(String(form.get("identifier")||"").trim()),password=String(form.get("password")||"");
  if(!identifier||!password||identifier.length>254||password.length>256)redirect("/WCDA-Events/portal?error=invalid&type=individual");
  try{await signIn("external-user",{identifier,password,redirectTo:destination});}
  catch(error){if(error instanceof AuthError)redirect("/WCDA-Events/portal?error=invalid&type=individual");throw error;}
 }
 async function signInPartner(form:FormData):Promise<void>{
  "use server";
  const identifier=String(form.get("identifier")||"").trim(),password=String(form.get("password")||"");
  if(!identifier||!password||identifier.length>254||password.length>256)redirect("/WCDA-Events/portal?error=invalid&type=organisation");
  try{await signIn("business-partner",{identifier,password,redirectTo:destination});}
  catch(error){if(error instanceof AuthError)redirect("/WCDA-Events/portal?error=invalid&type=organisation");throw error;}
 }
 const organisation=q.type==="organisation";
 const register="/login/"+(organisation?"business-partner/register":"external-user/register")+"?returnTo="+encodeURIComponent(destination)+(organisation?"":"&wcda=1");
 return <main style={shell}><div style={wrap}><header style={top}><Brand/><span style={secure}> <b/> SECURE GOVAPPS ACCESS</span></header><section style={hero}><div><span style={eyebrow}>WESTERN CAPE DEVELOPMENT AUTHORITY · EVENTS & SAFETY</span><h1>Your events.<br/><em>Your workspace.</em></h1><p>Apply for events, keep your documents together, follow application progress and manage your organisation's event activity — from your phone or computer.</p><div style={features}>{["Event applications","Documents & compliance","Finance tracking","Team portfolios","Discount & grant requests"].map(item=><span key={item} style={featuresPill}>{item}</span>)}</div></div><div style={illustration}><div style={illusTop}>MYWCDA EVENTS</div><div style={illusBig}>01</div><div style={illusLine}/><div style={illusLine2}/><div style={illusCard}>One account. Connected services.</div></div></section><section style={loginPanel}><div style={loginHead}><div><span style={eyebrow}>ORGANISER & BUSINESS PARTNER ACCESS</span><h2>Sign in to continue</h2><p>Every visitor must sign in or create a GovApps account to access the portal.</p></div></div><div style={tabs}><Link href="/WCDA-Events/portal?type=individual" style={tab(q.type!=="organisation")}>Individual organiser</Link><Link href="/WCDA-Events/portal?type=organisation" style={tab(organisation)}>Business / organisation</Link></div>{q.error&&<p role="alert" style={errorBox}>Sign-in failed. Check your username or email and password, then try again.</p>}{organisation?<form action={signInPartner} style={formStyle}><label style={labelStyle}>Email or username<input style={inputStyle} name="identifier" required autoComplete="username" placeholder="Business Partner username or email"/></label><label style={labelStyle}>Password<input style={inputStyle} name="password" type="password" required autoComplete="current-password" placeholder="Your password"/></label><button style={primary}>Sign in as business partner →</button></form>:<form action={signInExternal} style={formStyle}><label style={labelStyle}>Email or username<input style={inputStyle} name="identifier" required autoComplete="username" placeholder="GovApps email or username"/></label><label style={labelStyle}>Password<input style={inputStyle} name="password" type="password" required autoComplete="current-password" placeholder="Your password"/></label><button style={primary}>Sign in as organiser →</button></form>}<div style={register}><div><strong>New to MyWCDA Events?</strong><p>{organisation?"Register your organisation using its existing WCSA ID.":"Create your free external-user GovApps account and request WCDA Events access."}</p></div><Link href={register} style={secondary}>Create account</Link></div><p style={footnote}>Your account is your GovApps identity. Once WCDA Events access is authorised, the application can appear in your GovApps launcher. This portal does not expose office capture, personnel, staff finance or internal administration screens.</p></section><footer style={footer}>© {new Date().getFullYear()} Western Cape Development Authority · Powered by MyWCSA GovApps · <Link href="/">GovApps home</Link></footer></div></main>;
}
const labelStyle:CSSProperties={display:"grid",gap:6,fontSize:11,fontWeight:700,color:"#29486f"};
const inputStyle:CSSProperties={width:"100%",boxSizing:"border-box",padding:"13px 14px",border:"1px solid #d5e0ef",borderRadius:10,background:"#fff",fontSize:12,color:"#18345f",outlineColor:"#001484"};
const shell:CSSProperties={minHeight:"100svh",background:"linear-gradient(145deg,#eef4ff 0%,#f8faff 55%,#e5efff 100%)",padding:"clamp(14px,3vw,34px)",fontFamily:"Poppins,Arial,sans-serif",color:"#18345f"};
const wrap:CSSProperties={maxWidth:1040,margin:"0 auto"};
const panel:CSSProperties={maxWidth:620,margin:"10vh auto",padding:32,background:"#fff",border:"1px solid #dce6f5",borderRadius:22,boxShadow:"0 20px 60px #00148412"};
const top:CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:22};
const hero:CSSProperties={display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(210px,.8fr)",gap:24,alignItems:"center",padding:"clamp(24px,5vw,46px)",borderRadius:25,background:"linear-gradient(120deg,#00105f,#001484 65%,#2767b2)",color:"#fff",boxShadow:"0 18px 50px #00148425"};
const loginPanel:CSSProperties={maxWidth:690,margin:"22px auto",padding:"clamp(20px,4vw,34px)",border:"1px solid #dbe5f4",borderRadius:22,background:"#fff",boxShadow:"0 15px 45px #00148410"};
const eyebrow:CSSProperties={fontSize:10,letterSpacing:1.7,fontWeight:800,color:"#6382ae"};
const features:CSSProperties={display:"flex",gap:8,flexWrap:"wrap",marginTop:22};
const illustration:CSSProperties={minHeight:230,borderRadius:20,padding:23,background:"linear-gradient(145deg,#ffffff24,#ffffff08)",border:"1px solid #ffffff30",display:"flex",flexDirection:"column",justifyContent:"center"};
const tabs:CSSProperties={display:"flex",gap:8,flexWrap:"wrap",margin:"18px 0"};
const formStyle:CSSProperties={display:"grid",gap:13};
const register:CSSProperties={display:"flex",alignItems:"center",justifyContent:"space-between",gap:15,flexWrap:"wrap",marginTop:20,padding:16,background:"#f3f6fc",borderRadius:13};
const footnote:CSSProperties={fontSize:10,color:"#7486a1",lineHeight:1.8,marginTop:20};
const footer:CSSProperties={display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:10,color:"#7b8ca5",padding:"15px 3px"};
const secure:CSSProperties={fontSize:9,fontWeight:800,letterSpacing:1,color:"#49678f"};
const statusBox:CSSProperties={display:"grid",gap:8,margin:"22px 0",padding:18,background:"#f2f6fc",borderRadius:13};
const featuresPill:CSSProperties={padding:"7px 10px",border:"1px solid #ffffff38",borderRadius:30,fontSize:10,color:"#e2edff"};
const illusTop:CSSProperties={fontSize:9,letterSpacing:2,color:"#c5dcff",fontWeight:800};
const illusBig:CSSProperties={fontSize:74,fontWeight:800,lineHeight:1,color:"#fff",marginTop:16};
const illusLine:CSSProperties={height:7,width:"90%",borderRadius:9,background:"#ffffff70",marginTop:14};
const illusLine2:CSSProperties={height:7,width:"64%",borderRadius:9,background:"#ffffff35",marginTop:8};
const illusCard:CSSProperties={padding:13,marginTop:24,borderRadius:12,background:"#ffffff19",fontSize:11,color:"#fff"};
const loginHead:CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center"};
const primary:CSSProperties={display:"inline-flex",justifyContent:"center",alignItems:"center",border:0,borderRadius:11,padding:"13px 17px",background:"#001484",color:"#fff",fontSize:12,fontWeight:750,textDecoration:"none",cursor:"pointer"};
const secondary:CSSProperties={display:"inline-flex",justifyContent:"center",alignItems:"center",border:"1px solid #cad8ec",borderRadius:11,padding:"11px 14px",background:"#fff",color:"#001484",fontSize:11,fontWeight:750,textDecoration:"none",cursor:"pointer"};
const errorBox:CSSProperties={padding:12,background:"#fff0f1",color:"#9c2b3d",borderRadius:10,fontSize:12};
const formLabel:CSSProperties={display:"grid",gap:6};
function Brand(){return <Link href="/WCDA-Events/portal" style={{display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none",color:"#001484",fontWeight:850,fontSize:14}}><span style={{width:36,height:36,display:"grid",placeItems:"center",borderRadius:11,background:"#001484",color:"#fff",fontWeight:900}}>W</span><span>MyWCDA Events<small style={{display:"block",fontSize:8,letterSpacing:1,color:"#6480a7"}}>ORGANISER PORTAL</small></span></Link>}
function tab(active:boolean):CSSProperties{return {padding:"10px 13px",borderRadius:10,textDecoration:"none",fontSize:11,fontWeight:750,background:active?"#001484":"#f1f5fb",color:active?"#fff":"#36577f"}}
