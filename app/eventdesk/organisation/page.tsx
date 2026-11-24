import {redirect} from "next/navigation";
import {auth} from "@/auth";
import {getEmsActor} from "@/lib/ems/server";
import OrganiserHub from "@/app/WCDA-Events/portal/organiser-hub";
export const dynamic="force-dynamic";
export const metadata={title:"MyEventDesk | Organisation profile",robots:{index:false,follow:false}};
export default async function OrganisationPage(){
 const session=await auth();
 const provider=(session?.user as ({authProvider?:string}|undefined))?.authProvider;
 if(!session?.user||!(provider==="external-user"||provider==="business-partner"))redirect("/eventdesk");
 const actor=await getEmsActor();
 if(!actor||actor.mode!=="organiser")redirect("/eventdesk");
 return <><div style={{maxWidth:1200,margin:"16px auto 0",padding:"0 20px",fontFamily:"Poppins,Arial,sans-serif"}}><a href="/eventdesk" style={{color:"#001484",fontSize:12,fontWeight:700,textDecoration:"none"}}>← Back to MyEventDesk workspace</a></div><OrganiserHub name={actor.name} email={actor.email}/></>;
}
