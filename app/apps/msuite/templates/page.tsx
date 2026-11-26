import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {Poppins} from "next/font/google";
import {requireControlOperator} from "@/lib/control/centre";
import TemidioTemplates from "./TemidioTemplates";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"Temidio Templates | MyWCSA Office",robots:{index:false,follow:false}};
export default async function TemidioTemplatesPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fapps%2Fmsuite%2Ftemplates");
 try{const actor=await requireControlOperator();if(!["director","einnovation"].includes(actor.role))notFound();}catch{notFound();}
 return <div className={poppins.className}><TemidioTemplates/></div>;
}
