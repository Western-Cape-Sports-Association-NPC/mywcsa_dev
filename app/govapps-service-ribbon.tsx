"use client";

import styles from "./govapps-service-ribbon.module.css";

const message =
  "MICROSOFT 365 SERVICE ADVISORY — WCSA staff may experience disruption accessing Outlook, Teams, SharePoint, OneDrive, Word, Excel, PowerPoint and other Microsoft 365 services. Payslip distribution is temporarily suspended pending service restoration and verification. Read the staff notice.";

export default function GovAppsServiceRibbon() {
  return (
    <div className={styles.ribbon} role="region" aria-label="Urgent Microsoft 365 service notice">
      <span className={styles.label}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 22 20H2L12 3Z" />
          <path d="M12 9v5m0 3h.01" />
        </svg>
        <span>URGENT NOTICE</span>
      </span>
      <a className={styles.link} href="/my-apps/notices" aria-label="Read the Microsoft 365 service notice">
        <span className={styles.track}>
          <span>{message}</span>
          <span aria-hidden="true">{message}</span>
        </span>
      </a>
    </div>
  );
}
