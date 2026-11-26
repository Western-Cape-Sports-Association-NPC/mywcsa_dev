import Link from "next/link";
import { auth } from "@/auth";
import { requireStaffApp } from "@/lib/govapps/staff-app-access";
import { Poppins } from "next/font/google";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"MyWCSA Office | GovApps",robots:{index:false,follow:false}};
const apps=[
 {name:"Word",desc:"Create and edit documents in Microsoft Word.",icon:"W",color:"#185ABD",href:"https://www.microsoft365.com/launch/word",kind:"Microsoft 365"},
 {name:"Templates",desc:"Create and manage official WCSA document templates.",icon:"T",color:"#001484",href:"/apps/msuite/templates",kind:"Temidio"},
 {name:"Excel",desc:"Work with spreadsheets, registers and calculations.",icon:"X",color:"#107C41",href:"https://www.microsoft365.com/launch/excel",kind:"Microsoft 365"},
 {name:"PowerPoint",desc:"Build presentations and slide decks.",icon:"P",color:"#C43E1C",href:"https://www.microsoft365.com/launch/powerpoint",kind:"Microsoft 365"},
 {name:"Outlook",desc:"Open your organisational email and calendar.",icon:"O",color:"#0875C9",href:"https://outlook.office.com/mail/",kind:"Microsoft 365"},
 {name:"OneDrive",desc:"Access your organisation's cloud files.",icon:"D",color:"#1473C9",href:"https://www.microsoft365.com/launch/onedrive",kind:"Microsoft 365"},
];
export default async function MSuitePage(){
 await requireStaffApp("msuite");
 const session=await auth();
 const user=session?.user;
 return <div className={poppins.className} style={{minHeight:"100vh",background:"#f4f6fa",color:"#1d2b45"}}>
  <header style={{background:"#001484",color:"#fff",padding:"26px clamp(20px,5vw,64px) 30px"}}>
   <div style={{maxWidth:1400,margin:"0 auto"}}>
    <div style={{fontSize:11,fontWeight:700,letterSpacing:2,opacity:.75}}>MYWCSA GOVAPPS · PRODUCTIVITY</div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}>
     <div><h1 style={{fontSize:34,margin:"8px 0 5px",fontWeight:700}}>Office</h1><p style={{margin:0,fontSize:14,color:"#e0e7ff"}}>Your documents, templates and productivity tools in one workspace.</p></div>
     <div style={{textAlign:"right",fontSize:12}}><div style={{opacity:.7}}>SIGNED IN WITH YOUR WCSA ACCOUNT</div><strong style={{display:"block",fontSize:14,marginTop:4}}>{user?.name||user?.email||"WCSA staff member"}</strong><span style={{opacity:.8}}>{user?.email||""}</span></div>
    </div>
   </div>
  </header>
  <main style={{maxWidth:1400,margin:"0 auto",padding:"30px clamp(16px,4vw,42px) 60px"}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:15,flexWrap:"wrap",marginBottom:18}}><div><h2 style={{fontSize:20,margin:"0 0 5px",color:"#001484"}}>Choose an application</h2><p style={{margin:0,color:"#65758d",fontSize:13}}>Open a tool to get started. Microsoft 365 applications use your existing organisational sign-in session.</p></div><Link href="/my-apps" style={{color:"#001484",fontSize:12,fontWeight:700,textDecoration:"none"}}>← All GovApps</Link></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:16}}>
    {apps.map(a=><a key={a.name} href={a.href} target={a.href.startsWith("https://")?"_blank":undefined} rel={a.href.startsWith("https://")?"noreferrer":undefined} style={{background:"#fff",border:"1px solid #e0e6ef",borderRadius:16,padding:20,textDecoration:"none",color:"#1d2b45",boxShadow:"0 5px 20px #10284b08",display:"flex",flexDirection:"column",minHeight:170}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{width:44,height:44,borderRadius:12,background:a.color,color:"#fff",display:"grid",placeItems:"center",fontSize:22,fontWeight:800}}>{a.icon}</span><div><strong style={{fontSize:17}}>{a.name}</strong><div style={{fontSize:10,color:"#77869b",marginTop:2}}>{a.kind}</div></div></div>
      <p style={{fontSize:13,lineHeight:1.6,color:"#66758a",margin:"16px 0"}}>{a.desc}</p><span style={{marginTop:"auto",fontSize:12,fontWeight:700,color:"#001484"}}>Open {a.name} →</span>
     </a>)}
   </div>
   <div style={{marginTop:24,padding:18,borderRadius:14,background:"#eaf0fb",border:"1px solid #d8e3f5",fontSize:12,lineHeight:1.7,color:"#385071"}}><strong style={{color:"#001484"}}>Single sign-on</strong><br/>You are already signed in to MyWCSA GovApps. Microsoft 365 will use the same WCSA organisational identity where your browser has an active Microsoft session. Microsoft may request account confirmation if its session has expired.</div>
  </main>
 </div>;
}
