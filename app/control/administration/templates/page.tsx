import { auth } from "@/auth";
import { redirect,notFound } from "next/navigation";
import { Poppins } from "next/font/google";
import { requireControlOperator } from "@/lib/control/centre";
import TemplateStudio from "./TemplateStudio";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"Template Studio | MyWCSA GovApps",robots:{index:false,follow:false}};
export default async function TemplateStudioPage(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Fadministration%2Ftemplates");
 try{const operator=await requireControlOperator();if(!["director","einnovation"].includes(operator.role))notFound();}
 catch{notFound();}
 return <div className={poppins.className}><TemplateStudio/></div>;
}
