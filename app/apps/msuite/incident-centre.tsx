"use client";

import { useState } from "react";
import styles from "./incident.module.css";

const steps = [
  { title: "Incident overview", eyebrow: "01 · UNDERSTAND", body: "Microsoft reported global incident MO1550821 affecting access to multiple Microsoft 365 services. Microsoft subsequently marked the incident restored on 14 November 2026. WCSA is treating any remaining local access failures as a tenant, identity, network or integration validation issue until tested." },
  { title: "What may be affected", eyebrow: "02 · SERVICE SCOPE", body: "Staff may encounter local access or synchronisation issues involving Outlook / Exchange Online, Teams, SharePoint Online, OneDrive, Microsoft 365 Apps, Microsoft Graph and connected GovApps workflows. The impact must be verified against WCSA accounts and services; not every product or user is necessarily affected." },
  { title: "Recommended staff actions", eyebrow: "03 · WHAT TO DO", body: "Use GovApps for official updates. Do not repeatedly reset passwords or create duplicate files. Do not send passwords, payslips or confidential personnel information to unofficial channels. If a Microsoft service works, continue only with approved business processes. Report the exact app, time, error and a screenshot with personal information hidden." },
  { title: "Recovery & resynchronisation", eyebrow: "04 · CONTROLLED RECOVERY", body: "A controlled resync is proposed only after Microsoft service health and WCSA tenant access are verified. Technical teams should check identity and connectivity first, then validate each service, process queued changes in small batches, reconcile failures and obtain business-owner sign-off before restoring normal workflows." },
  { title: "Video briefing", eyebrow: "05 · WATCH & UNDERSTAND", body: "Watch the embedded incident coverage for a concise explanation of the outage, the services affected and Microsoft’s staged recovery. The media library includes independent news coverage and a technical timeline. Use the Videos & social tab to play the clips, resize the player or open a video in a separate window." },
];

const microsoftUpdates = [
  { label: "Microsoft 365 Service Health", detail: "Official public service status and incident updates.", href: "https://status.cloud.microsoft/", tag: "MICROSOFT OFFICIAL" },
  { label: "Microsoft 365 Status on X", detail: "Official @MSFT365Status incident communications.", href: "https://x.com/MSFT365Status", tag: "OFFICIAL SOCIAL" },
  { label: "Incident MO1550821", detail: "Tenant administrators: open Service health in the Microsoft 365 admin centre.", href: "https://admin.cloud.microsoft/#/servicehealth/:/alerts/MO1550821", tag: "ADMIN ACCESS" },
  { label: "How to check service health", detail: "Microsoft Learn guidance for checking known service issues.", href: "https://learn.microsoft.com/en-us/microsoft-365/enterprise/view-service-health", tag: "MICROSOFT LEARN" },
];

const videos = [
  { title: "Microsoft 365 outage: the global impact", publisher: "Global News · 12 November 2026", detail: "A 28-second report covering the initial global disruption and the services affected.", src: "https://globalnews.ca/video/embed/12148902/", open: "https://globalnews.ca/video/12148902/microsoft-365-outage-continues-globally-as-company-says-no-fix-yet/" },
  { title: "Microsoft 365 outage: recovery across the globe", publisher: "Global News · 13 November 2026", detail: "A 1-minute 47-second report on Microsoft’s gradual restoration and the wider impact.", src: "https://globalnews.ca/video/embed/12150348/", open: "https://globalnews.ca/video/12150348/microsoft-365-outage-disrupts-life-across-globe-company-says-its-gradually-restoring-access" },
  { title: "Incident timeline and technical explanation", publisher: "YouTube community explainer", detail: "A timeline-style explanation of incident MO1550821 and the service disruption.", src: "https://www.youtube-nocookie.com/embed/GEVYLvEGEjU", open: "https://youtu.be/GEVYLvEGEjU" },
];

const social = [
  { name: "X", detail: "Microsoft 365 Status — official incident updates.", href: "https://x.com/MSFT365Status" },
  { name: "TikTok", detail: "Public search for Microsoft 365 outage coverage; user-generated content is unverified.", href: "https://www.tiktok.com/search?q=Microsoft%20365%20outage" },
  { name: "Instagram", detail: "Public hashtag search; verify source and date before relying on posts.", href: "https://www.instagram.com/explore/tags/microsoftoutage/" },
  { name: "YouTube", detail: "Video search for news coverage and explainers.", href: "https://www.youtube.com/results?search_query=Microsoft+365+outage+November+2026" },
];

const news = [
  { source: "Associated Press", title: "Microsoft says services fully restored after hourslong global outage", detail: "Published 14 November 2026. Reports Microsoft's restoration statement and the cause of the incident.", href: "https://apnews.com/article/ca395c0f1e51af784b6d70afb6554f6a" },
  { source: "BBC News via Yahoo", title: "Watch: How the Microsoft outage affected North America", detail: "Video report published 13 November 2026.", href: "https://www.yahoo.com/news/videos/watch-microsoft-outage-affected-north-201210502.html" },
  { source: "Sky News", title: "Microsoft outage — recovery and impact coverage", detail: "Live-style rolling coverage and explainers from 13 November 2026.", href: "https://news.sky.com/story/a-13611764" },
];

const resync = [
  { time: "T+00", title: "Confirm Microsoft service health", detail: "Check status.cloud.microsoft and the WCSA tenant Service Health entry. Record incident IDs and the check time." },
  { time: "T+15", title: "Validate identity and access", detail: "Test Entra sign-in, MFA, conditional access, DNS and network reachability using approved test accounts." },
  { time: "T+30", title: "Test each Microsoft workload", detail: "Validate Outlook, Teams, SharePoint, OneDrive and Microsoft 365 Apps separately; capture evidence and affected users." },
  { time: "T+60", title: "Run controlled synchronisation", detail: "Reconcile connector queues and retry eligible failed jobs in small batches. Do not replay payroll or personnel changes blindly." },
  { time: "T+90", title: "Reconcile and obtain sign-off", detail: "Compare source and destination counts, inspect exceptions, confirm no duplicate records, and obtain business-owner approval before reopening." },
];

export default function MsuiteIncidentCentre() {
  const [step, setStep] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(true);
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [videoSize, setVideoSize] = useState("wide");
  const [printOpen, setPrintOpen] = useState(false);
  const [printSections, setPrintSections] = useState(["overview","impact","actions","recovery","contacts"]);\n  const reportSections = [{id:"overview",title:"Incident overview",body:"Microsoft incident MO1550821 affected access to multiple Microsoft 365 services. Microsoft reported service restoration on 14 November 2026. WCSA tenant and connected-service readiness must be verified separately."},{id:"impact",title:"Potential service impact",body:"Outlook / Exchange Online, Teams, SharePoint Online, OneDrive, Microsoft 365 Apps, Microsoft Graph and connected GovApps workflows may require local validation. Not every account or workload is necessarily affected."},{id:"actions",title:"Recommended staff actions",body:"Use official channels, capture the application name, time and exact error, redact personal information from screenshots, avoid duplicate files and do not share passwords or confidential personnel information."},{id:"recovery",title:"Controlled recovery sequence",body:"T+00 Microsoft status and tenant health; T+15 identity, MFA and network; T+30 workload validation; T+60 controlled small-batch sync retries; T+90 reconciliation and business-owner sign-off. Payroll and personnel replay requires Finance/HR controls."},{id:"contacts",title:"Incident contacts",body:"Emergency communication: wcsports-comm@hotmail.com. Helpdesk: helpdesk@cint.io. Executive Directors: Selina Ngalo, Lungiswa Ngalo and Zillindile Lucas Jantjies. ICT: Christiaan Nicolaas De Villiers. BiT: Zaylin-Zyle Morris. Communications: Monique Abrahams."}];
  const summary = "WCSA Microsoft 365 service incident: global Microsoft incident MO1550821 was reported restored on 14 November 2026. WCSA is validating its own tenant access and connected services. Staff should use GovApps for updates and report app, time, error and redacted screenshot to helpdesk@cint.io. Emergency contact: wcsports-comm@hotmail.com.";
  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { setCopied(false); }
  }
  return (
    <main className={styles.page}>
      <div className={styles.ambient} />
      <div className={styles.window}>
        <header className={styles.titlebar}>
          <div className={styles.traffic}><i/><i/><i/></div>
          <div className={styles.windowTitle}>MyWCSA MSuite <span>/</span> Incident & Recovery Centre</div>
          <div className={styles.secure}> <span/> SECURE STAFF WORKSPACE</div>
        </header>
        <div className={styles.topAlert}>
          <span className={styles.pulseIcon}>!</span>
          <div><strong>WCSA ACCESS RESTRICTION · MICROSOFT 365</strong><small>Global Microsoft incident MO1550821 reported restored · WCSA tenant validation remains in progress</small></div>
          <span className={styles.alertCode}>INCIDENT CENTRE</span>
        </div>
        <div className={styles.utilityBar}><span>INCIDENT REFERENCE <b>MO1550821</b></span><button className={styles.secondary} onClick={()=>setPrintOpen(true)}>Select sections · Print / Save PDF</button></div>\n        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>WESTERN CAPE DIGITAL SERVICES · SERVICE CONTINUITY</div>
            <h1>Microsoft 365<br/><em>Incident & Recovery</em></h1>
            <p>Guidance, verified updates and a controlled recovery plan for WCSA staff. The Microsoft global incident and WCSA's local service status are tracked separately.</p>
            <div className={styles.heroActions}>
              <button className={styles.primary} onClick={() => {setWizardOpen(true);setStep(0);}}>Open guided incident wizard <span>↗</span></button>
              <button className={styles.secondary} onClick={copySummary}>{copied ? "Copied" : "Copy incident summary"}</button>
            </div>
          </div>
          <div className={styles.statusPanel}>
            <span className={styles.statusLabel}>MICROSOFT GLOBAL INCIDENT</span>
            <strong className={styles.restored}>RESTORED</strong>
            <span className={styles.incidentId}>MO1550821</span>
            <div className={styles.statusDivider}/>
            <span className={styles.statusLabel}>WCSA TENANT VALIDATION</span>
            <strong className={styles.validation}>IN PROGRESS</strong>
            <small>Local access must be tested before MSuite is reopened.</small>
          </div>
        </section>
        <nav className={styles.tabs} aria-label="Incident centre sections">
          {[
            ["overview","Overview"],["updates","Microsoft updates"],["media","Videos & social"],["news","Newsroom"],["recovery","Resync schedule"],["contacts","Contacts & governance"]
          ].map(([id,label])=><button key={id} className={tab===id?styles.activeTab:""} onClick={()=>setTab(id)}>{label}</button>)}
        </nav>
        <div className={styles.content}>
          {tab==="overview" && <section className={styles.grid}>
            <article className={styles.card}><span className={styles.cardEyebrow}>INCIDENT STATEMENT</span><h2>What happened?</h2><p>Microsoft reported a global Microsoft 365 connectivity incident, reference <b>MO1550821</b>, affecting access to multiple services. Microsoft said the underlying issue arose during an earlier network-capacity upgrade and was not attributed to malicious or cyber activity. Microsoft subsequently reported service restoration.</p><a href="https://apnews.com/article/ca395c0f1e51af784b6d70afb6554f6a" target="_blank" rel="noreferrer">Read independent reporting ↗</a></article>
            <article className={styles.card}><span className={styles.cardEyebrow}>WCSA POSITION</span><h2>Why MSuite is restricted</h2><p>The global restoration notice does not prove that every WCSA account, tenant connection, application integration or synchronisation queue is healthy. MSuite remains routed to this incident centre until WCSA technical and business checks are completed.</p><span className={styles.inlineWarning}>Do not treat global restoration as WCSA sign-off.</span></article>
            <article className={styles.cardWide}><span className={styles.cardEyebrow}>STAFF GUIDANCE</span><h2>What staff should do now</h2><div className={styles.actionGrid}><div><b>01 · Keep working safely</b><p>Use available GovApps services and approved alternative communication channels.</p></div><div><b>02 · Report useful evidence</b><p>Include the service, time, error message and a screenshot with personal data hidden.</p></div><div><b>03 · Protect information</b><p>Never send passwords, payslips or confidential personnel records to unofficial channels.</p></div><div><b>04 · Wait for verification</b><p>Do not repeatedly reset credentials or create duplicate documents and records.</p></div></div></article>
          </section>}
          {tab==="updates" && <section className={styles.stack}><div className={styles.sectionIntro}><span className={styles.cardEyebrow}>PRIMARY SOURCES</span><h2>Microsoft statements & service health</h2><p>Use Microsoft as the source of truth for platform status. Tenant-specific service health may require an authorised administrator.</p></div>{microsoftUpdates.map(item=><a className={styles.resource} key={item.label} href={item.href} target="_blank" rel="noreferrer"><div><span>{item.tag}</span><strong>{item.label}</strong><small>{item.detail}</small></div><b>↗</b></a>)}<div className={styles.quote}><span>MICROSOFT INCIDENT POSITION · PARAPHRASED</span><p>Microsoft reported that it had addressed the underlying issue and restored service to remaining impacted customers and regions. A post-incident report was to follow its review.</p><small>Source: Microsoft 365 Status updates for MO1550821, 14 November 2026. See the official status page for the current record.</small></div></section>}
          {tab==="media" && <section className={styles.stack}><div className={styles.sectionIntro}><span className={styles.cardEyebrow}>EMBEDDED VIDEO LIBRARY</span><h2>Watch the incident coverage</h2><p>Play the reports here without leaving the incident centre. Choose a player size or open any clip in a separate browser window.</p></div><div className={styles.videoTools}><label htmlFor="video-size">PLAYER SIZE</label><select id="video-size" value={videoSize} onChange={e=>setVideoSize(e.target.value)}><option value="compact">Compact</option><option value="wide">Standard</option><option value="large">Large</option></select><span>Resize applies to all embedded players.</span></div><div className={`${styles.videoGrid} ${styles[videoSize]}`}>{videos.map((v,i)=><article className={styles.videoCard} key={v.title}><div className={styles.videoFrame}><iframe src={v.src} title={v.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen loading="lazy" scrolling="no"/></div><div className={styles.videoInfo}><span>{v.publisher}</span><strong>{v.title}</strong><p>{v.detail}</p><button className={styles.secondary} onClick={()=>window.open(v.open,"_blank","noopener,noreferrer")}>Open in new window ↗</button></div></article>)}</div><div className={styles.mediaNote}>If a publisher blocks embedded playback in your browser, use “Open in new window” to watch directly on the publisher’s site.</div><h3 className={styles.subhead}>Social platforms</h3><div className={styles.socialGrid}>{social.map(s=><a className={styles.socialCard} key={s.name} href={s.href} target="_blank" rel="noreferrer"><strong>{s.name} <span>↗</span></strong><small>{s.detail}</small></a>)}</div></section>}
          {tab==="news" && <section className={styles.stack}><div className={styles.sectionIntro}><span className={styles.cardEyebrow}>NEWSROOM</span><h2>Coverage from news organisations</h2><p>Selected reporting on the November 2026 Microsoft 365 incident. Open the publisher for the latest updates.</p></div>{news.map(n=><a className={styles.newsCard} key={n.title} href={n.href} target="_blank" rel="noreferrer"><span>{n.source}</span><strong>{n.title}</strong><p>{n.detail}</p><b>Read / watch coverage ↗</b></a>)}</section>}
          {tab==="recovery" && <section className={styles.stack}><div className={styles.sectionIntro}><span className={styles.cardEyebrow}>PROPOSED CONTROLLED WORKFLOW</span><h2>Resynchronisation schedule</h2><p>Indicative sequence after service health is confirmed. This is a proposed runbook, not an automated job or a promise of completion times.</p></div><div className={styles.timeline}>{resync.map((r,i)=><div className={styles.timelineItem} key={r.time}><span>{r.time}</span><div><strong>{r.title}</strong><p>{r.detail}</p></div>{i<resync.length-1&&<i/>}</div>)}</div><div className={styles.quote}><span>PAYROLL & PERSONNEL SAFEGUARD</span><p>Payslip issuance and personnel/payroll synchronisation must remain subject to Finance/HR validation and the required approval controls. Never replay payroll records as a generic bulk retry.</p></div></section>}
          {tab==="contacts" && <section className={styles.stack}><div className={styles.sectionIntro}><span className={styles.cardEyebrow}>INCIDENT ESCALATION</span><h2>Contacts & governance</h2><p>Use the channels below to report the incident. Include only the minimum information needed to diagnose the problem.</p></div><div className={styles.contactGrid}><a href="mailto:wcsports-comm@hotmail.com?subject=URGENT%20Microsoft%20365%20incident"><span>EMERGENCY COMMUNICATION</span><strong>wcsports-comm@hotmail.com</strong><small>Urgent organisational communication</small></a><a href="mailto:helpdesk@cint.io?subject=Microsoft%20365%20incident"><span>HELPDESK & TECHNICAL SUPPORT</span><strong>helpdesk@cint.io</strong><small>Service failures, access and resynchronisation queries</small></a></div><div className={styles.card}><span className={styles.cardEyebrow}>INCIDENT COORDINATION ROSTER</span><h3>Executive and technical coordination</h3><ul className={styles.people}><li><b>Executive Directors</b><span>Ms Selina Ngalo · Ms Lungiswa Ngalo · Mr Zillindile Lucas Jantjies</span></li><li><b>ICT</b><span>Mr Christiaan Nicolaas De Villiers</span></li><li><b>BiT</b><span>Mr Zaylin-Zyle Morris</span></li><li><b>Communications</b><span>Ms Monique Abrahams</span></li></ul><p className={styles.cint}>CINT — Cape Intelligence Network Team</p></div>
      </div>
        </section>}
      {printOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPrintOpen(false);}}><section className={styles.printDialog} role="dialog" aria-modal="true" aria-labelledby="printTitle"><div className={styles.wizardTop}><span>INCIDENT REPORT EXPORT</span><button onClick={()=>setPrintOpen(false)} aria-label="Close print options">×</button></div><div className={styles.printDialogBody}><span className={styles.cardEyebrow}>CUSTOMISE YOUR REPORT</span><h2 id="printTitle">Choose what to include</h2><p>Select the incident sections you want in your printable report. Choose “Save as PDF” in your browser’s print destination to create a PDF copy.</p>{reportSections.map(r=><label className={styles.printChoice} key={r.id}><input type="checkbox" checked={printSections.includes(r.id)} onChange={e=>setPrintSections(old=>e.target.checked?[...old,r.id]:old.filter(x=>x!==r.id))}/><span>{r.title}</span></label>)}<div className={styles.wizardControls}><button className={styles.secondary} onClick={()=>setPrintOpen(false)}>Cancel</button><button className={styles.primary} disabled={!printSections.length} onClick={()=>{setPrintOpen(false);window.setTimeout(()=>window.print(),150);}}>Print / Save PDF ↗</button></div></div></section></div>}\n      <section className={styles.printReport}><div className={styles.printHeader}><img src="/wcg-logo-transparent.svg" alt="Western Cape Government"/><div><span>MYWCSA GOVAPPS · SERVICE CONTINUITY</span><h1>Microsoft 365 Incident Report</h1><b>Incident reference MO1550821</b></div></div><div className={styles.printStatus}>GLOBAL MICROSOFT INCIDENT: RESTORED <i/> WCSA TENANT VALIDATION: SEPARATE LOCAL CHECK</div>{reportSections.filter(r=>printSections.includes(r.id)).map(r=><article className={styles.printSection} key={r.id}><h2>{r.title}</h2><p>{r.body}</p></article>)}<div className={styles.printContacts}><b>Incident contacts</b><span>wcsports-comm@hotmail.com · helpdesk@cint.io</span><small>CINT — Cape Intelligence Network Team · BiT · ICT · Communications</small></div><div className={styles.printLegal}>Prepared for staff information and operational continuity. The global Microsoft restoration notice does not constitute WCSA tenant validation or business sign-off.</div></section>\n      {wizardOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setWizardOpen(false);}}>
        <section className={styles.wizard} role="dialog" aria-modal="true" aria-labelledby="wizardTitle">
          <div className={styles.wizardTop}><div className={styles.traffic}><i/><i/><i/></div><span>INCIDENT RESPONSE ASSISTANT</span><button onClick={()=>setWizardOpen(false)} aria-label="Close wizard">×</button></div>
          <div className={styles.wizardBody}><div className={styles.stepRail}>{steps.map((s,i)=><button key={s.title} onClick={()=>setStep(i)} className={step===i?styles.stepCurrent:i<step?styles.stepDone:""}><span>{i+1}</span>{s.title}</button>)}</div>
            <div className={styles.stepContent}><span className={styles.cardEyebrow}>{steps[step].eyebrow}</span><h2 id="wizardTitle">{steps[step].title}</h2><p>{steps[step].body}</p><div className={styles.wizardNote}><b>Important</b><span>Microsoft's public incident status and WCSA's own readiness are separate checks. Do not restore access or release payroll documents solely because the global incident is marked restored.</span></div>
              {step===4 && <div className={styles.wizardVideo}><div className={styles.videoFrame}><iframe src="https://www.youtube-nocookie.com/embed/GEVYLvEGEjU" title="Microsoft 365 outage incident explainer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><a href="https://youtu.be/GEVYLvEGEjU" target="_blank" rel="noreferrer">Open video in a new window ↗</a><p>Use the Videos & social tab for the full media library, player resizing and publisher links.</p></div>}<div className={styles.wizardControls}><button className={styles.secondary} onClick={()=>step===0?setWizardOpen(false):setStep(step-1)}>{step===0?"Close":"Back"}</button><button className={styles.primary} onClick={()=>step===steps.length-1?setWizardOpen(false):setStep(step+1)}>{step===steps.length-1?"Finish":"Continue"} <span>→</span></button></div>
            </div>
          </div><div className={styles.wizardFoot}>CINT · BiT · ICT · COMMUNICATIONS <span>{step+1} / {steps.length}</span></div>
        </section>
      </div>}
    </main>
  );
}
