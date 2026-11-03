export type CamsSection = { title: string; pages: string[] };
export type CamsModule = { id: string; title: string; short: string; description: string; access: string[]; sections: CamsSection[] };

const allStaff = ["system_admin","registrar","approver","org_admin","org_user","read_only"];
const management = ["system_admin","registrar","approver"];
const admin = ["system_admin"];

export const camsModules: CamsModule[] = [
 {id:"home",title:"Home and My Workspace",short:"Workspace",description:"Daily work, tasks, approvals, calendar, messages and profile.",access:allStaff,sections:[
  {title:"Home",pages:["My Dashboard","Role Dashboard","Notifications Centre","Global Search","Recent Items","Favourites and Pinned Records","Announcements Board","Help Centre","Contact Support","What's New"]},
  {title:"My Tasks",pages:["My Task List","Create Task","Task Detail","Tasks I Assigned","Team Tasks","Overdue Tasks","Recurring Tasks","Task Templates","Task Calendar View","Task Kanban View"]},
  {title:"My Approvals",pages:["Approvals Inbox","Approval Detail","Delegate Approvals","Approval History","Bulk Approve","Escalated Approvals"]},
  {title:"My Calendar",pages:["Calendar Month View","Calendar Week View","Calendar Day Agenda","Create Calendar Entry","Shared Calendars","Calendar Sync Settings","Event Reminders","Public Holidays and School Terms","Venue Availability","Booking Conflicts"]},
  {title:"My Messages",pages:["Inbox","Compose Message","Sent Items","Drafts","Message Thread","Message Templates","Distribution Lists","Bulk SMS Composer","Bulk Email Composer","Delivery Status Report","Opt-out Management"]},
  {title:"My Profile",pages:["My Details","Change Password","Two-Factor Authentication","Notification Preferences","Language and Display Preferences","Sessions and Devices","My Activity Log","My Delegations","My Documents and Certificates"]}
 ]},
 {id:"staff",title:"Staff and Human Resources",short:"Staff & HR",description:"WCSA workforce, organisational structure, leave, attendance and employee development.",access:allStaff,sections:[
  {title:"Staff Register",pages:["Staff List","Staff Profile","Personal Details","Contact Details and Next of Kin","Employment Details","Qualifications","Professional Registrations","Skills and Competencies","Languages Spoken","Staff Documents","Add Staff Member","Bulk Staff Import","Staff Transfers","Staff Termination and Exit","Staff Photo and ID Card","Staff Directory"]},
  {title:"Organisation Structure",pages:["Organogram Viewer","Units and Directorates","Post Establishment","Post Detail","Reporting Lines Editor","Acting Appointments","Job Descriptions Library","Delegations of Authority"]},
  {title:"Leave",pages:["My Leave Balance","Apply for Leave","Leave Approvals","Leave Calendar","Leave Types Setup","Leave History","Leave Reports","Sick Leave Cycle Tracker","Leave Cash-out Requests"]},
  {title:"Attendance and Time",pages:["Clock In or Out","Attendance Register","Timesheets","Overtime Requests","Overtime Approvals","Field Work and Site Visit Log","Remote Work Requests","Attendance Exceptions","Attendance Reports"]},
  {title:"Performance",pages:["Performance Agreement Setup","Quarterly Reviews","Annual Assessment","Goals and KPIs","Evidence Portfolio","Moderation Panel","Performance Reports","Development Plans"]},
  {title:"Training of Staff",pages:["Training Needs Register","Training Catalogue","Training Requests","Training Attendance","Training History","Bursary Applications"]},
  {title:"Recruitment",pages:["Vacancies List","Create Vacancy","Applications Inbox","Applicant Profile","Shortlisting","Interview Schedule","Interview Scoring","Appointment Recommendation","Onboarding Checklist","Probation Tracking"]},
  {title:"Discipline and Grievance",pages:["Case Register","Case Detail","Hearing Schedule","Outcomes and Sanctions","Grievance Register","Appeals"]},
  {title:"Staff Health and Wellness",pages:["Wellness Programmes","Incident on Duty Reports","Employee Assistance Referrals"]},
  {title:"Staff Reports",pages:["Headcount Report","Vacancy Report","Employment Equity Report","Qualifications Report","Leave Liability Report","Training Report","Turnover Report"]}
 ]},
 {id:"schools",title:"Schools",short:"Schools",description:"School register, programmes, school staff and learners, teams, arts groups and facilities.",access:allStaff,sections:[
  {title:"School Register",pages:["School List","School Map View","School Profile","Identification","Address and GPS Location","Contact Details","Principal and Deputy Details","SGB Members","Learner Numbers by Grade","Educator Numbers","Quintile and No-fee Status","School Documents","Add School","Merge or Close School","School Change Requests","CEMIS Sync Status"]},
  {title:"School Sport and Arts Setup",pages:["Programmes Offered","Add Programme to School","School Sport Coordinator","School Arts Coordinator","School Sport and Arts Committee","School Policy Documents","School Calendar","School Budget","School Fees and Levies","School Colours and Branding","School Affiliations","Cluster and Circuit Grouping"]},
  {title:"School Staff",pages:["School Staff List","Link Staff to School","Coach Assignments","Educator Workload","Educator Accreditation","Volunteer Parents","External Coaches","Staff Clearance Status"]},
  {title:"School Learners",pages:["Learner List","Learner Profile","Learner Details","Parent or Guardian","Medical Summary","Participation History","Achievements","Learner Documents","Add Learner to Programme","Bulk Add Learners","Withdraw Learner","Learner Transfer","Eligibility Check","Age Group Calculator","Consent Status","Missing Consent","Disabilities Register","Learner Photo and Card","Practice Attendance"]},
  {title:"School Teams",pages:["Team List","Create Team","Team Roster","Add or Remove Players","Assign Coach and Manager","Team Fixtures","Team Results","Practice Schedule","Team Attendance","Team Kit and Equipment","Team Travel Plan","Team Profile","Season Summary","Competition Entry","Team Eligibility Report"]},
  {title:"School Arts Groups",pages:["Arts Group List","Create Arts Group","Group Members","Repertoire and Programme","Rehearsal Schedule","Performances Log","Adjudication Results","Instruments and Costumes","Arts Group Documents"]},
  {title:"School Events",pages:["School Event List","Create School Event","Event Programme and Run Sheet","Event Entries","Event Results","Officials and Helpers","Event Budget","Risk Assessment","Event Report","Event Photos and Media"]},
  {title:"School Facilities and Equipment",pages:["School Facilities List","Facility Detail and Condition","Facility Bookings","Maintenance Requests","Equipment Inventory","Equipment Issue and Return","Equipment Requests to District","Loss and Damage Reports"]},
  {title:"School Finance",pages:["School Sport and Arts Budget","Income Capture","Expense Capture","Petty Cash Register","Fundraising Events","Grant Funds Received","Reconciliation","Financial Report to District"]},
  {title:"School Reports",pages:["Participation Summary","Participation by Grade and Gender","Coach Accreditation Report","Results Summary","Consent Compliance Report","Equipment Report","Annual School Report","Submission Status to District"]}
 ]},
 {id:"clubs",title:"Clubs",short:"Clubs",description:"Club registration, members, teams, governance, finance, events and affiliation.",access:allStaff,sections:[
  {title:"Club Register",pages:["Club List","Club Map View","Club Profile","Club Identification","Legal Status","Address, Ward and GPS","Contact Details","Executive Committee","Office Bearer History","Club Colours and Logo","Club Documents","Register New Club","Club Status Changes","Club Merger or Name Change","Club Compliance Scorecard"]},
  {title:"Club Membership",pages:["Member List","Member Profile","Add Member","Bulk Member Import","Membership Categories","Applications Queue","Approve or Decline Application","Membership Renewal","Membership Fees Setup","Member Fees Status","Suspension and Reinstatement","Member Transfers In","Member Transfers Out","Clearance Certificates","Consent and Indemnity","Member Cards","Membership Statistics"]},
  {title:"Club Teams and Squads",pages:["Teams List","Create Team","Roster Management","Selection Lists","Coach and Manager Assignment","Fixtures","Results","Training Schedule","Training Attendance","Player Statistics","Team Entry Forms","Team Disciplinary Records"]},
  {title:"Club Officials and Coaches",pages:["Coaches List","Coach Profile and Qualifications","Official List","Official Grading","Volunteer List","Roles and Responsibilities","Clearances and Vetting","Coach Education Tracker"]},
  {title:"Club Meetings and Governance",pages:["Meeting Schedule","Create Meeting and Agenda","Minutes Capture","Resolutions Register","AGM Planner","AGM Notice and Proxy","Election Results","Policies Register","Constitution Version History","Dispute Register"]},
  {title:"Club Finance",pages:["Club Budget","Income Register","Expenses Register","Member Fees Receipts","Bank Reconciliation","Sponsorship Register","Grant Applications","Grant Expenditure Reports","Audited Financial Statements","Tax Compliance","Insurance Register","Financial Summary"]},
  {title:"Club Events",pages:["Club Event List","Create Event","Entries and Registrations","Programme and Schedule","Officials Appointment","Results Capture","Event Budget","Event Safety Plan","Event Report"]},
  {title:"Club Facilities and Assets",pages:["Facility List","Facility Hire Bookings","Asset Register","Equipment Issue Log","Maintenance Log","Facility Compliance Certificates"]},
  {title:"Club Affiliation",pages:["Affiliation Status","Apply for Affiliation","Renew Affiliation","Affiliation Fees Payment","Affiliation Certificate","Federation Links","Pending Compliance Items"]},
  {title:"Club Reports",pages:["Membership Report","Participation by Age, Gender and Disability","Fees Outstanding","Results and Standings","Coach Qualifications","Annual Club Return"]}
 ]},
 {id:"centres",title:"Centres and Groups",short:"Centres & Groups",description:"Community centres, academies, arts centres, libraries, museums and NPO programmes.",access:allStaff,sections:[
  {title:"Centre Register",pages:["Centre List","Centre Profile","Identification and Type","Location, Ward and GPS","Operating Hours","Management and Administrators","Staff and Volunteers","Registration and Compliance","Centre Documents","Register Centre","Centre Status Changes","Centre Scorecard"]},
  {title:"Programmes",pages:["Programme List","Create Programme","Programme Schedule","Capacity and Waiting List","Programme Facilitators","Programme Budget","Outcomes and Indicators","Programme Evaluation","Programme Closure Report"]},
  {title:"Participants and Groups",pages:["Participant List","Participant Profile","Enrol Participant","Bulk Enrolment","Group List","Create Group","Group Members","Group Leaders","Attendance Register by Session","Mark Attendance","Attendance Summary","Participant Progress Notes","Achievements and Certificates","Participant Exit and Graduation"]},
  {title:"Sessions and Bookings",pages:["Session List","Create Session","Session Detail","Room and Venue Bookings","Resource Booking","Hire and Rental Requests","Booking Approvals","Booking Calendar","Cancellations and Reschedules"]},
  {title:"Centre Operations",pages:["Daily Log","Incident Register","Visitor Register","Cleaning and Maintenance","Security and Access","Opening and Closing Checklists","Emergency Plan and Drills","Stock and Consumables","Asset Register"]},
  {title:"Centre Finance",pages:["Budget","Income","Expenses","Funder Reporting","Grant Tracker","Financial Reports"]},
  {title:"Centre Reports",pages:["Attendance Report","Programme Performance","Demographics","Facility Utilisation","Monthly Return to WCSA","Annual Report"]}
 ]},
 {id:"federations",title:"Federations, Associations, Councils and Forums",short:"Federations",description:"Federation relationships, councils, forums, mandates and service-level agreements.",access:allStaff,sections:[
  {title:"Federation Register",pages:["Federation List","Federation Profile","Constitution and Mandate","Executive and Office Bearers","Affiliated Clubs, Schools and Regions","Parent Body Links","Accreditation Status","Compliance Scorecard","Federation Documents","Register Federation","Status Changes","Contact Directory"]},
  {title:"Federation Operations",pages:["Federation Calendar","Competition Rules Library","Fee Structures","Membership Statistics","Disciplinary Tribunal Register","Appeals Register","Selection Policy","Provincial Team Management","Annual Returns","Federation Reports"]},
  {title:"Councils and Forums",pages:["District Sport and Arts Councils","Council Profile","Council Members","Meeting Schedule","Minutes","Resolutions Register","Action Tracker","Arts and Culture Forums","Forum Members","Confederation and Umbrella Body Links"]},
  {title:"Mandates and Service Level Agreements",pages:["SLA List","SLA Detail","Deliverables Tracker","Quarterly Performance Reports","Monitoring Visit Schedule","Monitoring Visit Form","Findings Register","Corrective Action Plans","SLA Renewal"]}
 ]},
 {id:"people",title:"People Registers",short:"People",description:"A unified record for participants, coaches, officials, volunteers, guardians, artists and athletes.",access:allStaff,sections:[
  {title:"Participants",pages:["All Participants List","Participant Profile","Identity","Home Affairs Verification","Demographics","Contact Details","Address and Ward","Guardians","Emergency Contacts","Disability and Special Needs","Languages","School and Grade","Organisation Memberships","Code and Discipline History","Registration History","Competition History","Results and Rankings","Achievements and Awards","Selections and Provincial Colours","Disciplinary Record","Injury History Summary","Medical Consent Status","Documents","Photo","Add Participant","Duplicate Detection and Merge","WCSA Unique Number Manager","Deceased or Archived Records","Data Correction Request","POPIA Consent Record","Privacy Access Request","Participant Timeline"]},
  {title:"Coaches",pages:["Coach List","Coach Profile","Qualifications","Accreditation","Police and Child Protection Clearance","First Aid Certificates","Code of Conduct","Assignments","Teams Coached","Performance Feedback","Development Plan","Add Coach","Coach ID Card","CPD Points"]},
  {title:"Officials",pages:["Official List","Official Profile","Grade and Licence","Appointments","Availability Calendar","Match Reports","Assessments","Expense Claims","Add Official","Officials Pool by Code","Adjudicator Panels","Conflict-of-Interest Declarations"]},
  {title:"Administrators and Volunteers",pages:["List","Profile","Roles Held","Vetting Status","Volunteer Hours Log","Volunteer Recognition","Add Volunteer","Volunteer Recruitment Board"]},
  {title:"Parents and Guardians",pages:["List","Profile","Linked Children","Consent Forms Signed","Payments and Receipts","Communication Preferences","Add Guardian","Guardian Verification"]},
  {title:"Artists and Performers",pages:["List","Profile","Discipline and Genre","Portfolio","Performances","Awards","Exhibitions","Mentorship","Funding History","Add Artist","Amateur or Professional Status"]},
  {title:"High-Performance Athletes",pages:["List","Profile","Performance Data","Testing Results","Training Load","Sports Science Notes","Support Services","Athlete Agreements","National Squad Status","Athlete Bursary"]},
  {title:"People Tools",pages:["Global Person Search","Duplicates Queue","Merge Tool","Bulk Update","Data Quality Dashboard","Missing Data Report","Age Verification Queue","ID Validation Exceptions","People Import Wizard","Import Error Log"]}
 ]},
 {id:"registration",title:"Registration and Affiliation",short:"Registration",description:"Season setup, registration workflows, transfers, affiliation and eligibility rules.",access:allStaff,sections:[
  {title:"Seasons",pages:["Season List","Create Season","Season Rules","Fee Schedule","Deadlines","Open and Close Registration"]},
  {title:"Participant Registration",pages:["Registration Dashboard","Start Registration Wizard","Identity","Guardian","Code or Discipline","School, Club or Centre","Medical and Consent","Documents","Fees and Payment","Review and Submit","Confirmation Page","Registration Queue","Registration Detail","Approve","Reject with Reasons","Request More Information","Bulk Upload","Bulk Upload Validation","Bulk Upload Error Corrections","Bulk Submit","Registration Status Tracker","Duplicate Registration Conflicts","Age Eligibility Override","Over-age Exemptions","Dual Registration Rules","Late Registration Request","Registration Cancellation","Re-registration and Renewal","Print Certificate or Card","Digital Card with QR Code","QR Verification Page","Registration Reports"]},
  {title:"Transfers",pages:["Transfer Requests List","Request Transfer","Releasing Organisation Approval","Receiving Organisation Approval","Provincial Ruling","Transfer Fee","Transfer Window Rules","Transfer History","Clearance Certificate","Transfer Disputes"]},
  {title:"Organisation Affiliation",pages:["Affiliation Dashboard","Application Form","Requirements Checklist","Upload Documents","Verification Queue","Site Inspection Scheduling","Inspection Form","Recommendation","Approval Decision","Affiliation Certificate","Renewal Notices","Renewal Form","Fees Invoice","Proof of Payment","Suspension","Reinstatement","Disaffiliation","Public Affiliation Register","Affiliation Reports"]},
  {title:"Coach and Official Accreditation",pages:["Coach Application","Verify Qualifications","Approve or Decline","Official Registration","Grade Upgrade Request","Renewal","Expiring Accreditations Board"]},
  {title:"Eligibility Rules Engine",pages:["Rules List","Rule Builder","Age Bands","Gender Categories and Inclusion Policy","Disability Classification","Residency Rules","Learner Rules","Test a Rule","Rule Change Log"]}
 ]},
 {id:"codes",title:"Codes, Disciplines and Lookups",short:"Codes & Lookups",description:"Sport codes, arts disciplines, culture and heritage classifications and master lookups.",access:management,sections:[
  {title:"Sport Codes",pages:["Code List","Code Profile","Code Attributes","Governing Body","Age Groups","Levels","Positions","Equipment Standards","Rules Documents","Official Grades","Coach Levels","Competition Formats","Scoring Configuration","Add Code","Activate or Deactivate","Code Participation Statistics"]},
  {title:"Arts Disciplines",pages:["Discipline List","Discipline Profile","Categories","Adjudication Criteria","Grading Levels","Age Sections","Repertoire Lists","Add Discipline","Discipline Statistics"]},
  {title:"Culture and Heritage",pages:["Category List","Indigenous Games","Heritage Day Programmes","Language Programmes","Oral History Projects","Craft and Design","Culinary Heritage","Add Category"]},
  {title:"System Lookups",pages:["Provinces","Districts","Circuits","Municipalities","Wards","Languages","Disability Types","Gender Options","Race Categories","Qualification Types","Document Types","Status Codes","Reason Codes","Grades","Master Age Groups","Competition Levels","Venue Types","Facility Types","Equipment Types","Injury Types","Incident Types","Funding Types","Lookup Change Log"]}
 ]},
 {id:"competitions",title:"Competitions, Events and Selections",short:"Competitions",description:"Competition setup, entries, fixtures, match-day operations, results and provincial selections.",access:allStaff,sections:[
  {title:"Competition Setup",pages:["Competition List","Create Competition","Rules and Format","Age and Gender Categories","Entry Requirements","Entry Fees","Entry Window","Venues","Officials Requirements","Sponsors","Publish or Unpublish","Clone from Previous Season","Competition Dashboard"]},
  {title:"Entries",pages:["Entry List","Team Entry Form","Individual Entry Form","Entry Eligibility Check","Ineligible Players Report","Entry Approval","Withdrawals","Entry Payments","Entry Confirmation Letters","Player Lists and Team Sheets"]},
  {title:"Fixtures and Draws",pages:["Draw Generator","Seeding","Pools and Groups","Fixture List","Fixture Detail","Edit or Reschedule","Venue Allocation","Official Allocation","Fixture Clash Checker","Postponements","Public Fixture View","Export Fixtures","Fixture Notifications"]},
  {title:"Match Day",pages:["Match Day Dashboard","Team Sheet Submission","Player ID Check","Live Scoring","Results Capture","Result Verification","Match Report","Match Incidents","Cards and Sanctions","Player Statistics","Result Disputes","Forfeits and Walkovers","Mobile Score Entry"]},
  {title:"Standings and Results",pages:["League Table","Knockout Bracket","Top Scorers","Fair Play Table","Awards","Season Summary","Publish Final Results","Historical Results Archive"]},
  {title:"Individual Events",pages:["Event List","Heats and Lane Draw","Time and Measurement Capture","Records Register","Qualifying Standards","Record Ratification","Results Booklet"]},
  {title:"Discipline and Sanctions",pages:["Case List","Open Case","Charge Sheet","Hearing","Outcome","Suspensions Register","Suspension Check at Entry","Appeals","Sanction Expiry Tracker"]},
  {title:"Event Management",pages:["Events Calendar","Create Event","Event Dashboard","Budget","Programme","Organising Committee","Task Plan","Venue and Logistics","Attendee Accreditation","Volunteer Allocation","Sponsorship","Marketing and Media","Safety Plan and Permits","Medical and Emergency Plan","Ticketing","Incident Log","Post-event Report","Evaluation Survey","Lessons Learned"]},
  {title:"Selections and Provincial Teams",pages:["Selection Events List","Trials Schedule","Trial Registration","Trial Attendance","Scoring Sheets","Selection Panel","Shortlist","Final Squad","Reserve List","Squad Acceptance","Squad Documents","Squad Camps","Team Manager Pack","Team Travel","National Participation Tracking","Results at Nationals","Squad Reports"]}
 ]},
 {id:"arts",title:"Arts, Culture and Heritage Programmes",short:"Arts & Culture",description:"Festivals, eisteddfods, exhibitions, heritage sites and creative-industry development.",access:allStaff,sections:[
  {title:"Festivals and Eisteddfods",pages:["Festival List","Create Festival","Sections and Classes","Syllabus Publisher","Entries","Entry Fees","Programme Builder","Session Scheduling","Adjudicator Allocation","Mark Sheets","Mark Capture","Results","Certificates","Awards and Trophies","Gala Concert Line-up","Festival Report"]},
  {title:"Exhibitions and Performances",pages:["List","Create","Artworks Register","Loan Agreements","Insurance","Programme","Audience Numbers","Reviews and Feedback","Report"]},
  {title:"Libraries, Museums and Heritage Sites",pages:["List","Profile","Collections Summary","Visitor Numbers","Programmes","Conservation","Heritage Grading","Site Inspections","Maintenance","Reports"]},
  {title:"Cultural Events",pages:["Heritage Month Calendar","Create Cultural Event","Participants and Groups","Community Involvement","Report"]},
  {title:"Creative Industries Support",pages:["Projects","Mentorship","Incubators","Market Access","Report"]}
 ]},
 {id:"talent",title:"Talent Identification and Development",short:"Talent",description:"Talent identification, academies, pathways, bursaries and scholarships.",access:allStaff,sections:[
  {title:"Talent Identification",pages:["TID Dashboard","Talent Pool","Nomination","Screening Events","Test Batteries","Test Capture","Benchmark Comparison","Talent Profile","Scout Reports","Talent Decision","Talent Status Tracker"]},
  {title:"Academies and Development Centres",pages:["Academy List","Academy Profile","Intake Setup","Application","Selection","Enrolment","Curriculum","Training Plans","Session Logs","Assessments","Progress","Boarding and Accommodation","Academic Support","Graduation","Exit","Alumni","Academy Reports"]},
  {title:"Pathways",pages:["Pathway Templates","Participant Pathway","Milestones","Transitions","Mentor Matching","Mentor Profile","Pathway Reports"]},
  {title:"Bursaries and Scholarships",pages:["Programmes","Application","Assessment","Award","Agreement","Payments","Progress Monitoring","Reports"]}
 ]},
 {id:"training",title:"Training and Capacity Building",short:"Training",description:"Courses, workshops, skills records, facilitators and e-learning.",access:allStaff,sections:[
  {title:"Courses",pages:["Course Catalogue","Course Profile","Create Course","Curriculum","Facilitators","Accreditation Body Link","Scheduling","Venue","Budget","Applications","Selection","Enrolment","Attendance","Assessment","Marks","Moderation","Certificates","Evaluation","Course Report"]},
  {title:"Workshops",pages:["List","Create","Registration","Attendance","Materials","Feedback"]},
  {title:"Skills Records",pages:["Individual Training Transcript","CPD Tracker","Expiring Certificates","Training Needs Analysis","Training Plan","Training Reports"]},
  {title:"Facilitators",pages:["List","Profile","Accreditation","Evaluations","Payments"]},
  {title:"E-learning",pages:["Course Library","Course Player","Quizzes","Progress","Certificates"]}
 ]},
 {id:"facilities",title:"Facilities and Assets",short:"Facilities & Assets",description:"Facility register, compliance, bookings, maintenance, equipment and infrastructure projects.",access:allStaff,sections:[
  {title:"Facility Register",pages:["Facility List","Facility Map","Facility Profile","Type and Capacity","Ownership and Custodian","Location","Amenities","Codes and Disciplines Supported","Accessibility","Photos","Documents","Add Facility","Status"]},
  {title:"Condition and Compliance",pages:["Assessments","Inspection Forms","Condition Scores","Compliance Certificates","Federation Grading","Upgrade Needs","Compliance Dashboard"]},
  {title:"Bookings and Usage",pages:["Booking Calendar","Booking Request","Approval","Pricing","Invoice","Recurring Bookings","Conflicts","Access Control","Usage Logs","Usage Reports","Cancellations"]},
  {title:"Maintenance",pages:["Requests","Work Orders","Contractors","Schedule","Costs","History","Preventive Plan"]},
  {title:"Equipment and Assets",pages:["Asset Register","Asset Profile","Tag and Barcode","Acquisition","Allocation to Organisation","Issue and Return","Loan Agreements","Stock Take","Write-off","Depreciation","Lost and Stolen","Asset Transfers","Equipment Requests","Asset Reports"]},
  {title:"Infrastructure Projects",pages:["Project List","Project Profile","Budget","Milestones","Contractor","Progress Photos","Payments","Completion","Handover","Reports"]}
 ]},
 {id:"safety",title:"Health, Safety, Safeguarding and Integrity",short:"Safety & Integrity",description:"Restricted medical, safeguarding, incident, integrity, complaints and emergency management.",access:admin.concat(["approver"]),sections:[
  {title:"Medical Information",pages:["Medical Profile","Conditions and Allergies","Medication","Medical Aid","Doctor Contact","Medical Clearance Forms","Pre-participation Screening","Medical Alerts Board","Medical Access Log"]},
  {title:"Consent and Indemnity",pages:["Consent Forms Library","Digital Consent Capture","E-signature","Indemnity Forms","Media and Photo Consent","Travel Consent","Consent Expiry","Consent Compliance Report","Revoke Consent"]},
  {title:"Incidents and Injuries",pages:["Incident List","Report Incident","Injury Report","First Aid Record","Hospital Referral","Witness Statements","Photo Evidence","Follow-up Actions","Return-to-Play Clearance","Concussion Protocol","Serious Incident Escalation","Insurance Claim","Incident Analytics","Near-miss Reports"]},
  {title:"Child Safeguarding",pages:["Safeguarding Dashboard","Vetting Register","Police Clearance Request","Child Protection Register Check","Vetting Expiry Tracker","Code of Conduct","Report a Safeguarding Concern","Case Management","Referral to Social Services or SAPS","Safeguarding Training Records","Safe Recruitment Checklist","Safeguarding Policy","Safeguarding Officer Register"]},
  {title:"Anti-doping and Integrity",pages:["Education Records","Testing Notifications","Therapeutic Use Exemptions","Sanctions","Whereabouts","Ethics Declarations","Match-fixing and Integrity Reports","Whistleblower Channel"]},
  {title:"Complaints",pages:["Complaints List","Lodge Complaint","Triage","Investigation","Outcome","Mediation","Complaint Statistics","Anonymous Complaint Form"]},
  {title:"Risk and Emergency",pages:["Risk Register","Risk Assessment Template","Event Risk Assessments","Emergency Contacts Directory","Emergency Plans","Drill Logs","Weather Alerts","Evacuation Plans","OHS Compliance"]}
 ]},
 {id:"finance",title:"Finance, Grants and Procurement",short:"Finance & Grants",description:"Budgets, funding calls, grant applications, payments, monitoring, fees and procurement.",access:management,sections:[
  {title:"Budgets",pages:["Budget Overview","Budget by Programme","Budget by Organisation","Allocations","Virements","Budget vs Actual","Forecasts","Budget Approvals","Budget History"]},
  {title:"Funding Programmes",pages:["Programme List","Programme Profile","Eligibility Criteria","Call for Applications","Application Form Builder","Deadlines","Publish Call","Funding Rules","Programme Performance"]},
  {title:"Grant Applications",pages:["Applicant Dashboard","Start Application","Organisation Details","Project Details","Budget and Quotations","Supporting Documents","Declarations","Submit","Application Tracker","Admin Queue","Completeness Check","Compliance Verification","Scoring Sheets","Evaluation Committee","Recommendation","Approval","Award Letter","Rejection Letter","Appeal","Grant Agreement","E-sign Agreement"]},
  {title:"Payments",pages:["Payment Schedule","Payment Request","Banking Details Verification","Payment Approval","Payment Batch","Finance System Export","Proof of Payment","Payment Status","Rejected Payments","Tranche Release Conditions"]},
  {title:"Monitoring and Reporting",pages:["Monitoring Dashboard","Progress Report Form","Expenditure Report","Evidence Upload","Site Visits","Reconciliation","Unspent Funds and Returns","Close-out Report","Audit File","Non-compliance Flags","Impact Indicators"]},
  {title:"Fees and Receipts",pages:["Fee Types","Invoices","Online Payments","EFT Reconciliation","Receipts","Refunds","Statements","Debtors List","Write-offs","Fee Waivers"]},
  {title:"Procurement",pages:["Supplier Register","Supplier Profile","CSD Verification","Quotations","Requisitions","Orders","Goods Received","Invoice Processing","Contracts","Supplier Performance"]},
  {title:"Finance Administration",pages:["Chart of Accounts","Cost Centres","Financial Year Setup","Petty Cash","Audit Queries","AFS Support Exports","Finance Reports"]}
 ]},
 {id:"transport",title:"Transport, Travel and Accommodation",short:"Transport & Travel",description:"Transport requests, fleet, accommodation, travel claims, meals and catering.",access:allStaff,sections:[
  {title:"Transport Requests",pages:["Request List","Create Request","Passenger Manifest","Route and Pick-up Points","Approval","Quote Comparison","Vehicle Allocation","Driver Details","Roadworthy and Permit Checks","Indemnity per Passenger","Trip Itinerary","Trip Emergency Contacts","Trip Check-in and Check-out","Trip Incident","Trip Cost","Trip Report"]},
  {title:"Fleet",pages:["Vehicle Register","Vehicle Profile","Licence Disk","Services","Fuel Log","Trip Logbook","Driver Register","Driver Licence Verification","Accidents","Fleet Reports"]},
  {title:"Accommodation",pages:["Request","Venue and Hotel Register","Quotes","Room Allocation","Rooming List","Chaperone Allocation","Dietary Requirements","Check-in and Check-out","Costs","Accommodation Inspection","Report"]},
  {title:"Travel Claims",pages:["Subsistence and Travel Claim","Approvals","Rates","Mileage","Claim Status","Reports"]},
  {title:"Meals and Catering",pages:["Requests","Dietary List","Supplier","Costs"]}
 ]},
 {id:"communications",title:"Communication and Community Engagement",short:"Communication",description:"Circulars, bulk messaging, contact lists, public portal, support and collaboration.",access:allStaff,sections:[
  {title:"Notices and Circulars",pages:["Circulars List","Create Circular","Approval before Publishing","Audience Selector","Attachments","Read Receipts and Acknowledgements","Scheduled Notices","Archive","Translations"]},
  {title:"Bulk Messaging",pages:["SMS Campaigns","SMS Credits and Balance","Email Campaigns","WhatsApp Templates","Push Notifications","Audience Builder","Templates Library","Merge Fields","Test Send","Schedule","Delivery Reports","Bounce Management","Opt-outs","Message Approval"]},
  {title:"Contacts and Lists",pages:["Directory","Distribution Lists","Dynamic Lists","Import Contacts","Clean and De-duplicate","Contact Preferences"]},
  {title:"Public Portal and Website",pages:["Website Pages Manager","News and Stories","Public Events Listing","Find a Club or Programme","Online Registration Portal Home","FAQs","Gallery","Downloads","Social Media Scheduler","Media Requests","Press Releases"]},
  {title:"Feedback and Support",pages:["Survey Builder","Survey Distribution","Responses","Analysis","Satisfaction Scores","Suggestion Box","Helpdesk Tickets","Ticket Detail","Knowledge Base","Ticket SLA Dashboard"]},
  {title:"Collaboration",pages:["Discussion Forums","Working Groups","Shared Workspaces","Mentions and Comments","Meeting Scheduler","Virtual Meeting Links","Meeting Minutes"]}
 ]},
 {id:"documents",title:"Documents, Forms and Workflow",short:"Documents & Workflow",description:"Document records, templates, forms, workflow design, policies, records and e-signatures.",access:allStaff,sections:[
  {title:"Document Library",pages:["Library Home","Folders by Organisation","Upload","Bulk Upload","Metadata Tagging","Version History","Check-in and Check-out","Preview","Full-text Search","Sharing and Permissions","Expiry Dates","Expiring Documents","Review Cycles","Recycle Bin","Document Audit Log"]},
  {title:"Templates",pages:["Templates List","Template Editor","Merge Fields","Certificate Designer","Letter Templates","ID Card Designer","Consent Form Templates","Report Templates","Template Versions","Batch Document Generation"]},
  {title:"Forms Builder",pages:["Forms List","Form Designer","Field Types","Conditional Logic","Validation Rules","Prefill from Records","Form Workflow","Publish Form","Submissions Inbox","Submission Detail","Export Submissions","Form Analytics"]},
  {title:"Workflow Designer",pages:["Workflows List","Designer Canvas","Steps and Approvers","Conditions","SLA Timers","Escalations","Notifications","Test Run","Versioning","Workflow Monitor","Stuck Items"]},
  {title:"Policies and Agreements",pages:["Policies Register","Policy Detail","Acknowledgement Tracking","MOU Register","MOU Detail","Renewals","Contracts Register","Legal Review"]},
  {title:"Records and Archive",pages:["Retention Schedule","Archive","Legal Hold","Disposal Approval","Destruction Certificates","Digitisation Queue","Scanned Document OCR","File Plan"]},
  {title:"E-signatures",pages:["Signature Requests","Signer View","Signature Audit Trail","Reminders"]}
 ]},
 {id:"reports",title:"Reports, Analytics and Data Exports",short:"Reports & Analytics",description:"Operational, participation, organisation, financial, competition, workforce and statutory reporting.",access:allStaff,sections:[
  {title:"Report Centre",pages:["Report Centre Home","Report Catalogue","Favourite Reports","Scheduled Reports","Report History","Shared Reports","Report Access by Role"]},
  {title:"Daily Operational Reports",pages:["Registrations Today","Pending Approvals","Overdue Tasks","Events This Week","Compliance Expiring","Outstanding Documents","Data Quality Exceptions","User Activity"]},
  {title:"Participation Reports",pages:["By Code","By Age","By Gender","By Disability","By District","By Ward","By School Quintile","By School, Club or Centre","Trend over Seasons","Retention and Dropout","Pathway Progression","Women and Girls","Youth","Persons with Disabilities","Rural vs Urban"]},
  {title:"Organisation Reports",pages:["Organisation Compliance","Affiliation Status","Club Health Index","School Programme Coverage","Centre Utilisation","Federation Performance"]},
  {title:"Financial Reports",pages:["Funding by Programme and District","Expenditure vs Budget","Grant Status","Payments Ageing","Fees Collected","Outstanding Fees","Unspent Grants"]},
  {title:"Competition Reports",pages:["Results","Medal Tables","Participation per Event","Officials Usage","Disciplinary Statistics"]},
  {title:"Facility and Asset Reports",pages:["Facility Condition","Utilisation","Asset Register","Maintenance Backlog","Infrastructure Projects"]},
  {title:"Workforce Reports",pages:["Staff Dashboards","Workforce Analytics"]},
  {title:"Report Builder",pages:["Builder Home","Choose Data Source","Choose Fields","Filters","Grouping","Calculations","Chart Options","Preview","Save","Share","Schedule","Export"]},
  {title:"Dashboards and Analytics",pages:["Dashboard Builder","Widget Library","Map Analytics","Trend Explorer","Comparison Tool","KPI Scorecard","Targets vs Actuals","Risk Flags","Executive Pack"]},
  {title:"Statutory and Departmental Reporting",pages:["Annual Performance Plan Indicators","Quarterly Performance Reports","Legislature and MEC Reports","Conditional Grant Reports","National Department Returns","Audit Evidence Packs","PAIA and POPIA Reports"]},
  {title:"Data Exports and Migration",pages:["Export Centre","Export Templates","Full Data Export by Module","Document Export with Index File","Export History","Export Approval","Migration Checklist","Field Mapping","Data Validation","Reconciliation Counts","Go-live Sign-off"]}
 ]}
];

export function visibleModules(role: string) {
 return camsModules.filter(module => module.access.includes(role));
}
