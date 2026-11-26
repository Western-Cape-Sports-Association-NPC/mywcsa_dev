import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {requireControlOperator} from "@/lib/control/centre";
import TemidioBranding from "./TemidioBranding";
export const dynamic="force-dynamic";
export const metadata={title:"Temidio Brand Centre | MyWCSA Office",robots:{index:false,follow:false}};
export default async function TemidioBrandingPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fapps%2Fmsuite%2Fbranding");
 try{const actor=await requireControlOperator();if(!["director","einnovation"].includes(actor.role))notFound();}catch{notFound();}
 return <TemidioBranding/>;
}