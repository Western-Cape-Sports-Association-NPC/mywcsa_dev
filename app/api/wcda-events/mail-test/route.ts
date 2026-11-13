import {EmsError,requireEmsActor} from "@/lib/ems/server";
import {mailConfigured,sendCaseMail} from "@/lib/ems/microsoft";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
const recipients=[
  "ebranch@wcsports.co.za",
  "thimna.proline@gmail.com",
  "selinangalo2@gmail.com",
  "personnel@wcsports.co.za",
] as const;

export async function POST(request:Request){
  try{
    if(request.headers.get("origin")!==new URL(request.url).origin)
      throw new EmsError(403,"Use the authorised GovApps workspace.");
    const actor=await requireEmsActor();
    if(actor.mode!=="staff"||actor.role!=="super_admin")
      throw new EmsError(403,"Only the WCDA Events system administrator may run this test.");
    if(!mailConfigured())
      throw new EmsError(503,"WCDA Events Microsoft Graph mail is not enabled. No test messages were sent.");

    const accepted:string[]=[];
    for(const recipient of recipients){
      await sendCaseMail({
        recipient,
        subject:"WCDA Events · Microsoft Graph outbound mail test",
        body:[
          "This is an authorised technical test of the WCDA Events application-only Microsoft Graph mail integration.",
          "",
          "Sender: WCDA.Events@govapps.wcsports.co.za",
          "Purpose: verify that WCDA Events can submit outbound correspondence through its approved shared mailbox.",
          "",
          "No response is required. This message is a system test, not an event notice.",
          "",
          "WCDA Events · Events & Safety Department",
        ].join("\n"),
      });
      accepted.push(recipient);
    }
    return Response.json({acceptedByMicrosoft:accepted,deliveryConfirmed:false},{headers});
  }catch(error){
    return Response.json(
      {error:error instanceof EmsError?error.message:"The WCDA Events mail test could not be completed."},
      {status:error instanceof EmsError?error.status:503,headers}
    );
  }
}
