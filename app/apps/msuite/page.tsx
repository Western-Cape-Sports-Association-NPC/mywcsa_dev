import Link from "next/link";
import {auth} from "@/auth";
import {requireStaffApp} from "@/lib/govapps/staff-app-access";
import {Poppins} from "next/font/google";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"MyWCSA Office & Temidio | GovApps",robots:{index:false,follow:false}};
const groups=[
 {title:"Create & edit",sub:"The document workspace",items:[
  {name:"Word",desc:"Open Microsoft Word with your organisational Microsoft 365 account.",icon:"W",color:"#185ABD",href:"https://www.microsoft365.com/launch/word",tag:"Microsoft 365"},
  {name:"Temidio Templates",desc:"Browse previous templates, create new layouts and edit official documents.",icon:"T",color:"#001484",href:"/apps/msuite/templates",tag:"Temidio"},
  {name:"Brand Centre",desc:"Approved WCSA logos, letterheads, signatures, seals and design assets.",icon:"B",color:"#2946A8",href:"/apps/msuite/branding",tag:"Temidio"},
 ]},
 {title:"Microsoft 365 apps",sub:"Your connected productivity applications",items:[
  {name:"Excel",desc:"Spreadsheets, registers, calculations and data.",icon:"X",color:"#107C41",href:"https://www.microsoft365.com/launch/excel",tag:"Microsoft 365"},
  {name:"PowerPoint",desc:"Presentations, briefings and slide decks.",icon:"P",color:"#C43E1C",href:"https://www.microsoft365.com/launch/powerpoint",tag:"Microsoft 365"},
  {name:"Outlook",desc:"Organisational email, calendar and contacts.",icon:"O",color:"#0875C9",href:"https://outlook.office.com/mail/",tag:"Microsoft 365"},
  {name:"OneDrive",desc:"Your organisational cloud files and shared documents.",icon:"D",color:"#1473C9",href:"https://www.microsoft365.com/launch/onedrive",tag:"Microsoft 365"},
 ]},
 {title:"Temidio tools",sub:"Tools that support the full template lifecycle",items:[
  {name:"Template library",desc:"Recently edited, published and draft templates, with version tracking.",icon:"▤",color:"#001484",href:"/apps/msuite/templates",tag:"Templates"},
  {name:"Page & layout designer",desc:"Set paper size, orientation, margins, borders, typography, tables and images.",icon:"▧",color:"#4264A8",href:"/apps/msuite/templates",tag:"Editor"},
  {name:"Merge fields",desc:"Build reusable placeholders for names, dates, references and other information.",icon:"{ }",color:"#5774A8",href:"/apps/msuite/templates",tag:"Automation"},
  {name:"Brand assets",desc:"Insert approved logos and letterhead artwork directly into document designs.",icon:"✦",color:"#2946A8",href:"/apps/msuite/branding",tag:"Branding"},
 ]}
];
export default async function MSuitePage(){
 await requireStaffApp("msuite");const session=await auth();const user=session?.user;
 return <div className={poppins.className} style={{minHeight:"100vh",background:"#f4f6fa",color:"#1d2b45"}}>
 <header style={{background:"#001484",color:"#fff",padding:"25px clamp(20px,5vw,64px) 28px"}}><div style={{maxWidth:1450,margin:"0 auto"}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,opacity:.75}}>MYWCSA GOVAPPS · PRODUCTIVITY SUITE</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}><div><h1 style={{fontSize:34,margin:"8px 0 5px",fontWeight:700}}>Office <span style={{fontWeight:400,color:"#aebcf5"}}>+</span> Temidio</h1><p style={{margin:0,fontSize:14,color:"#e0e7ff"}}>One workspace for Microsoft 365, official templates, document design and WCSA branding.</p></div><div style={{textAlign:"right",fontSize:12}}><div style={{opacity:.7}}>SIGNED IN TO MYWCSA</div><strong style={{display:"block",fontSize:14,marginTop:4}}>{user?.name||user?.email||"WCSA staff member"}</strong><span style={{opacity:.8}}>{user?.email||""}</span></div></div><nav style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:22}}>{[["Office home","/apps/msuite"],["Templates","/apps/msuite/templates"],["Brand Centre","/apps/msuite/branding"]].map(([label,href])=><Link key={href} href={href} style={{color:"#fff",textDecoration:"none",fontSize:11,fontWeight:700,border:"1px solid #ffffff55",borderRadius:8,padding:"8px 12px"}}>{label}</Link>)}<Link href="/my-apps" style={{color:"#fff",textDecoration:"none",fontSize:11,fontWeight:700,padding:"8px 12px"}}>← All GovApps</Link></nav></div></header>
 <main style={{maxWidth:1450,margin:"0 auto",padding:"28px clamp(16px,4vw,42px) 60px"}}>
 <div style={{background:"#eaf0fb",border:"1px solid #d8e3f5",borderRadius:14,padding:17,marginBottom:26,display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}><div><strong style={{color:"#001484",fontSize:14}}>Temidio is part of Office</strong><p style={{margin:"5px 0 0",fontSize:12,color:"#385071",lineHeight:1.6}}>Create a template, insert approved branding, set the page layout and save it back to your shared library.</p></div><Link href="/apps/msuite/templates" style={{background:"#001484",color:"#fff",textDecoration:"none",padding:"10px 14px",borderRadius:9,fontSize:12,fontWeight:700}}>Open Temidio →</Link></div>
 {groups.map(g=><section key={g.title} style={{marginBottom:30}}><div style={{marginBottom:13}}><h2 style={{fontSize:20,color:"#001484",margin:"0 0 4px"}}>{g.title}</h2><p style={{fontSize:12,color:"#718198",margin:0}}>{g.sub}</p></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:14}}>{g.items.map(a=><a key={a.name} href={a.href} target={a.href.startsWith("https://")?"_blank":undefined} rel={a.href.startsWith("https://")?"noreferrer":undefined} style={{background:"#fff",border:"1px solid #e0e6ef",borderRadius:14,padding:18,textDecoration:"none",color:"#1d2b45",boxShadow:"0 5px 20px #10284b08",display:"flex",flexDirection:"column",minHeight:156}}><div style={{display:"flex",alignItems:"center",gap:11}}><span style={{width:42,height:42,borderRadius:11,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontSize:20,fontWeight:800}}>{a.icon}</span><div><strong style={{fontSize:15}}>{a.name}</strong><div style={{fontSize:10,color:"#77869b",marginTop:2}}>{a.tag}</div></div></div><p style={{fontSize:12,lineHeight:1.6,color:"#66758a",margin:"13px 0"}}>{a.desc}</p><span style={{marginTop:"auto",fontSize:11,fontWeight:700,color:"#001484"}}>Open {a.name} →</span></a>)}</div></section>)}
 <div style={{borderTop:"1px solid #e1e7f0",paddingTop:16,fontSize:11,color:"#75849a",lineHeight:1.7}}>Microsoft 365 applications open through Microsoft's sign-in service. The same organisational identity is used when a valid Microsoft session is active. Temidio template and brand administration remain subject to GovApps permissions.</div>
 </main></div>;
}