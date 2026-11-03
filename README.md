# MyWCSA GovApps

**MyWCSA GovApps** is the Western Cape Sports Association NPC's central applications gateway. It provides a consistent entry point to WCSA digital services for authorised staff, business partners and external users.

- **Organisation:** Western Cape Sports Association NPC (WCSA)
- **Product:** MyWCSA GovApps
- **Primary domain:** https://govapps.wcsports.co.za
- **Repository:** `mywcsa/mywcsa_dev`
- **Default branch:** `main`
- **Positioning:** A WCSA multi-sector digital services platform, not a sports-only portal.

## Product principles

GovApps should follow a clear, accessible and professional public-sector digital standard:

- Use the WCG-inspired dark-blue identity, with primary brand blue `#001484`.
- Use **Poppins** as the approved GovApps interface typeface.
- Keep layouts compact, legible, responsive and consistent across desktop, tablet and mobile.
- Prefer clean light surfaces, restrained grey backgrounds, clear borders and strong information hierarchy.
- Keep the interface practical and recognisable as a government-standard service environment; avoid unnecessary visual effects and decorative complexity.
- Keep navigation and application access role-aware. Users should only see services and functions authorised for their account.
- Make accessibility, clear feedback, predictable navigation and secure handling of information part of every feature.

The visual standard is a product requirement. Check the implementation before assuming every legacy screen already conforms: older styles may still contain typography or colour overrides that need to be aligned.

## Application scope

GovApps is the gateway and shared application environment for WCSA digital services. Applications may have their own modules, permissions, workflows and data boundaries.

The wider MyWCSA ecosystem includes services such as:

- **MyWCSA AMS** — membership and organisational administration.
- **WorkHub** — staff employment and workforce services.
- **PERSAL** — WCSA personnel administration and employee master-data workflows.
- **MyWCDA Events** — event administration and related services.
- **ServiceDesk** — support, service requests, equipment and technical assistance.
- **Other approved WCSA applications** — made available according to role, allocation and access policy.

A card or link in the launcher must not be presented as a fully operational service unless its destination and required workflows are implemented. Clearly label planned, preview, demonstration or unavailable services.

## Technology

The current repository is a Next.js application using:

| Area | Technology |
|---|---|
| Web framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 and application CSS |
| Authentication package | NextAuth 5 beta (where configured by the application) |
| Linting | ESLint 9 |
| Document generation dependency | jsPDF |
| Testing | Node.js built-in test runner |

The repository is the version-controlled source of truth for application code. The intended delivery workflow is:

- **GitHub:** source control, code review and change history.
- **Base44:** design refinement and interface beautification where useful; it does not replace the GitHub source repository.
- **Supabase:** approved application data services where configured.
- **Vercel:** hosting and deployment where the project is connected and configured.
- **Microsoft 365 / SharePoint / OneDrive / Dataverse:** approved organisational collaboration, document and data services where configured.

These are platform responsibilities, not a claim that every integration is active in every module. Confirm the relevant environment, credentials, permissions and implementation before relying on an integration.

## Getting started

### Requirements

- Node.js version supported by the installed Next.js release.
- npm (or another compatible package manager).
- Access to the repository and any required development environment variables.

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open http://localhost:3000.

### Validate changes

```bash
npm run lint
npm run build
```

Payment and database/API test suite:

```bash
npm run test:payments
```

WCDA document tests:

```bash
npm run test:docs
```

Use the scripts defined in `package.json` as the authoritative list of available project commands.

## Development and contribution workflow

1. Confirm the relevant application, route, user role and expected behaviour before changing code.
2. Inspect the existing implementation and reuse established components, styles and patterns where practical.
3. Make the change in the GitHub repository. Do not create a disconnected duplicate implementation.
4. Keep application access, role checks and server-side validation enforced by the application—not merely hidden in the interface.
5. Do not expose secrets, tokens, credentials, private keys or personal information in source code, logs, commits or documentation.
6. Add or update tests for changed behaviour, especially authentication, permissions, payments, data handling and document generation.
7. Run linting and a production build before merging or deploying.
8. Review the result at desktop and mobile sizes and confirm that existing application routes still work.
9. Deploy only through the approved project workflow and verify the deployment after release.

Use descriptive commit messages that state what changed and why. Keep changes focused and avoid unrelated rewrites.

## Security and information handling

- Treat personnel, learner, member, payment and organisational records as protected information.
- Apply least-privilege access and role-based authorisation.
- Validate permissions on the server for protected actions and data.
- Keep secrets in the approved environment-variable or secrets-management facility.
- Do not commit production data, credentials, database exports or private documents.
- Use synthetic data for demonstrations and tests unless authorised otherwise.
- Do not imply that a preview, mock-up or prototype has submitted a real application, processed a payment, issued an official record or changed a live account.
- Keep auditability and appropriate records of consequential administrative actions.

## Important implementation notes

- The repository contains legacy and prototype areas. Verify the current implementation before documenting a route or feature as production-ready.
- A user interface alone does not establish a live backend integration.
- Do not assume all WCSA staff, partners and external users have identical access. Permissions and application allocations must determine what each user can access.
- Do not collect newsletters or unrelated personal information through GovApps.
- Keep public gateway experiences separate from staff-only administrative functions.

## Project scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test:payments` | Run payment, membership database, Supabase API and WCDA payment tests |
| `npm run test:docs` | Run WCDA document tests |

## Further documentation

Keep detailed technical documentation close to the feature it describes. Update this README whenever the repository's setup process, architecture, scripts, deployment workflow or product scope materially changes.

---

**Western Cape Sports Association NPC**  
*United. Empowered. Excelling.*
