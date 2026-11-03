"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CamsData, CamsStaff, Row } from "@/lib/cams/access";
import { visibleModules } from "./module-catalog";
import s from "./cams.module.css";

type Field = [key: string, label: string, options?: string[]];
const roles = ["system_admin", "registrar", "approver", "org_admin", "org_user", "read_only"];
const forms: Record<string, { table: string; fields: Field[] }> = {
  "Organisations": { table: "organisations", fields: [["name", "Organisation name"], ["type", "Type", ["school", "club", "department", "directorate", "initiative", "other"]], ["contact_email", "Contact email"]] },
  "Asset Register": { table: "assets", fields: [["tag", "Asset tag"], ["description", "Description"], ["location", "Location"], ["condition", "Condition"]] },
  "Staff List": { table: "staff_access", fields: [["email", "Staff email"], ["full_name", "Full name"], ["role", "Role", roles], ["directorate", "Directorate"]] },
};
const toText = (v: unknown) => v === null || v === undefined ? "—" : typeof v === "boolean" ? (v ? "Yes" : "No") : String(v).replace("T", " ").slice(0, 19);
const pageDataKey: Record<string, keyof Pick<CamsData, "orgs" | "schools" | "persons" | "assets" | "staff" | "audit">> = {
  "Organisations": "orgs", "Organisation List": "orgs", "School List": "schools", "Schools": "schools",
  "All Participants List": "persons", "Learner List": "persons", "Staff List": "staff", "Asset Register": "assets",
  "Audit Log": "audit",
};

export default function CamsApp({ me, data }: { me: CamsStaff; data: CamsData }) {
  const router = useRouter();
  const admin = me.role === "system_admin";
  const writer = ["system_admin", "registrar", "approver"].includes(me.role);
  const modules = visibleModules(me.role);
  const [moduleId, setModuleId] = useState("home");
  const [sectionTitle, setSectionTitle] = useState("Home");
  const [activePage, setActivePage] = useState("My Dashboard");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [now] = useState(() => new Date());

  const currentModule = modules.find(m => m.id === moduleId) || modules[0];
  const currentSection = currentModule.sections.find(x => x.title === sectionTitle) || currentModule.sections[0];
  const selectedKey = pageDataKey[activePage];
  const sourceRows = selectedKey ? data[selectedKey] as Row[] : [];
  const rows = useMemo(() => sourceRows.filter(row => !query || Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())), [sourceRows, query]);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  const form = forms[activePage];
  const countFor = (key: string) => {
    if (key === "orgs") return data.counts.organisations;
    if (key === "schools") return data.counts.schools;
    if (key === "persons") return data.counts.persons;
    if (key === "assets") return data.counts.assets;
    if (key === "staff") return data.counts.staff;
    return data.audit.length;
  };
  const metrics = [
    ["Organisations", data.counts.organisations, "Organisations"],
    ["Schools", data.counts.schools, "School List"],
    ["People", data.counts.persons, "All Participants List"],
    ["Assets", data.counts.assets, "Asset Register"],
    ["Staff accounts", data.counts.staff, "Staff List"],
  ];

  function selectModule(id: string) {
    const next = modules.find(m => m.id === id) || modules[0];
    setModuleId(next.id);
    setSectionTitle(next.sections[0]?.title || "Overview");
    setActivePage(next.sections[0]?.pages[0] || next.title);
    setQuery("");
    setFormOpen(false);
    setError("");
  }
  function selectSection(title: string) {
    const section = currentModule.sections.find(x => x.title === title);
    setSectionTitle(title);
    setActivePage(section?.pages[0] || title);
    setQuery("");
    setFormOpen(false);
    setError("");
  }
  function selectPage(page: string) {
    setActivePage(page);
    setQuery("");
    setFormOpen(false);
    setError("");
  }
  async function save() {
    if (!form) return;
    setSaving(true); setError("");
    const row: Record<string, string> = {};
    form.fields.forEach(([key, , options]) => {
      const value = values[key] || (options ? options[0] : "");
      if (value) row[key] = value;
    });
    try {
      const response = await fetch("/api/cams/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: form.table, row }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The record could not be saved.");
      setFormOpen(false); setValues({}); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "The record could not be saved."); }
    finally { setSaving(false); }
  }

  return (
    <div className={s.root}>
      <header className={s.header}>
        <Link href="/cams" className={s.brand} aria-label="CAMS home">
          <span className={s.brandMark}>C</span>
          <span className={s.brandCopy}><strong>Centralised Administrative Management System</strong><small>SPORT, ARTS AND CULTURE · WESTERN CAPE</small></span>
        </Link>
        <div className={s.headerRight}>
          <span className={s.clock}><strong>{now.toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit", hour12: false })}</strong><small>{now.toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg", weekday: "short", day: "2-digit", month: "short", year: "numeric" })} · SAST</small></span>
          <span className={s.authStatus}><i className={s.dot} /><strong>{me.full_name}</strong><small>{admin ? "System Owner" : me.role.replaceAll("_", " ")}</small></span>
          <Link href="/my-apps" className={s.headerButton}>GovApps</Link>
        </div>
      </header>

      <nav className={s.moduleNav} aria-label="CAMS modules">
        {modules.map(module => <button key={module.id} type="button" onClick={() => selectModule(module.id)} className={module.id === currentModule.id ? s.moduleActive : s.moduleTab}>{module.short}</button>)}
      </nav>

      <div className={s.workspace}>
        <div className={s.moduleIntro}>
          <div><span className={s.eyebrow}>WCSA CAMS / {currentModule.title.toUpperCase()}</span><h1>{currentModule.title}</h1><p>{currentModule.description}</p></div>
          <div className={s.moduleMeta}><span className={s.secureMark}>●</span> STAFF WORKSPACE <b>·</b> {admin ? "SYSTEM OWNER" : me.directorate || "AUTHORISED STAFF"}</div>
        </div>

        <nav className={s.sectionNav} aria-label={currentModule.title + " sections"}>
          {currentModule.sections.map(section => <button key={section.title} type="button" onClick={() => selectSection(section.title)} className={section.title === currentSection.title ? s.sectionActive : s.sectionTab}>{section.title}</button>)}
        </nav>

        <main className={s.main}>
          {currentModule.id === "home" && sectionTitle === "Home" && activePage === "My Dashboard" ? <>
            <div className={s.pageHeading}><div><span className={s.eyebrow}>OVERVIEW</span><h2>My Dashboard</h2><p>Your WCSA administrative workspace at a glance.</p></div><span className={s.dateLabel}>{now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" })}</span></div>
            <div className={s.metricGrid}>{metrics.filter(([, , page]) => page !== "Staff List" || admin).filter(([, , page]) => page !== "All Participants List" || writer).map(([label, value, page]) => <button key={String(label)} className={s.metricCard} onClick={() => { selectModule(page === "Staff List" ? "staff" : page === "School List" ? "schools" : page === "All Participants List" ? "people" : page === "Asset Register" ? "facilities" : "home"); if (page === "Organisations") { setSectionTitle("Home"); setActivePage("Organisations"); } else if (page === "School List") { setSectionTitle("School Register"); setActivePage(page); } else if (page === "All Participants List") { setSectionTitle("Participants"); setActivePage(page); } else if (page === "Asset Register") { setSectionTitle("Equipment and Assets"); setActivePage(page); } else if (page === "Staff List") { setSectionTitle("Staff Register"); setActivePage(page); } }}><span>{String(label)}</span><strong>{Number(value).toLocaleString("en-ZA")}</strong><small>Open register →</small></button>)}</div>
            <div className={s.dashboardGrid}>
              <section className={s.panel}><div className={s.panelHeading}><div><h3>Workspace modules</h3><p>Open a module to access its sections and registers.</p></div><span>{modules.length} MODULES</span></div><div className={s.moduleCards}>{modules.map(m => <button key={m.id} onClick={() => selectModule(m.id)} className={s.moduleCard}><span className={s.moduleIcon}>{m.short.slice(0,1)}</span><span><strong>{m.title}</strong><small>{m.sections.length} sections · {m.sections.reduce((n, x) => n + x.pages.length, 0)} work areas</small></span><b>›</b></button>)}</div></section>
              <section className={s.panel}><div className={s.panelHeading}><div><h3>Recent administrative activity</h3><p>Latest recorded system actions.</p></div><span>LIVE RECORDS</span></div>{admin && data.audit.length ? data.audit.slice(0,8).map((item,i) => <div className={s.activityRow} key={i}><b>{toText(item.action)}</b><span>{toText(item.table_name)} · {toText(item.actor_email)}</span><small>{toText(item.at)}</small></div>) : <div className={s.emptyState}><strong>No activity to display</strong><p>New activity will appear here when actions are recorded in CAMS.</p></div>}</section>
            </div>
          </> : <>
            <div className={s.pageHeading}><div><span className={s.eyebrow}>{currentModule.title.toUpperCase()} / {currentSection.title.toUpperCase()}</span><h2>{activePage}</h2><p>{currentSection.pages.length} work areas in this section.</p></div><span className={s.dateLabel}>{currentSection.title}</span></div>
            <div className={s.pageTabs} aria-label="Pages in section">{currentSection.pages.map(page => <button key={page} onClick={() => selectPage(page)} className={activePage === page ? s.pageActive : s.pageTab}>{page}</button>)}</div>
            {selectedKey ? <section className={s.panel}>
              <div className={s.panelHeading}><div><h3>{activePage}</h3><p>{countFor(selectedKey).toLocaleString("en-ZA")} records in the connected register.</p></div>{form && (admin || writer) && <button className={s.primary} onClick={() => setFormOpen(!formOpen)}>{formOpen ? "Close form" : "+ Add record"}</button>}</div>
              <div className={s.tableToolbar}><input aria-label={"Search " + activePage} placeholder={"Search " + activePage.toLowerCase() + "…"} value={query} onChange={e => setQuery(e.target.value)} /><span>{rows.length} shown</span><button onClick={() => window.print()} className={s.outlineButton}>Print / PDF</button></div>
              {formOpen && form && <div className={s.formGrid}>{form.fields.map(([key,label,options]) => <label key={key}>{label}{options ? <select value={values[key] || options[0]} onChange={e => setValues(v => ({...v,[key]:e.target.value}))}>{options.map(option => <option key={option}>{option}</option>)}</select> : <input value={values[key] || ""} onChange={e => setValues(v => ({...v,[key]:e.target.value}))} />}</label>)}<button className={s.primary} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save record"}</button>{error && <p className={s.error}>{error}</p>}</div>}
              <div className={s.tableWrap}>{rows.length ? <table><thead><tr>{columns.map(col => <th key={col}>{col.replace(/_/g," ")}</th>)}</tr></thead><tbody>{rows.map((row,i) => <tr key={i}>{columns.map(col => <td key={col}>{toText(row[col])}</td>)}</tr>)}</tbody></table> : <div className={s.emptyState}><strong>No matching records</strong><p>There are currently no records to display for this register, or your search returned no matches.</p></div>}</div>
            </section> : <section className={s.panel}><div className={s.panelHeading}><div><h3>{currentSection.title}</h3><p>Select a work area to open its page.</p></div><span>{currentSection.pages.length} PAGES</span></div><div className={s.pageGrid}>{currentSection.pages.map((page,index) => <button key={page} className={s.pageCard} onClick={() => selectPage(page)}><span className={s.pageCardIcon}>{String(index+1).padStart(2,"0")}</span><span><strong>{page}</strong><small>Open workspace</small></span><b>›</b></button>)}</div></section>}
          </>}
          <footer className={s.footer}><span>WESTERN CAPE SPORTS ASSOCIATION NPC · CAMS</span><span>Access-controlled internal system · All times SAST</span></footer>
        </main>
      </div>
    </div>
  );
}
