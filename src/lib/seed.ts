import { getDb, prepare } from "./db";

export async function seedAll(): Promise<void> {
  const db = await getDb();

  // Check if already seeded
  const count = db.exec("SELECT COUNT(*) as c FROM users");
  if (count.length && count[0].values[0][0] as number > 0) return;

  const p = prepare;

  // --- Users ---
  const users = [
    { name: "Priya Sharma", email: "priya@knoxconsulting.com", role: "Senior Consultant", skills: JSON.stringify(["Financial Reporting", "P&L Analysis", "Audit"]), avatar: "PS" },
    { name: "Rohan Mehta", email: "rohan@knoxconsulting.com", role: "Consultant", skills: JSON.stringify(["Payroll", "Compliance", "HR Systems"]), avatar: "RM", on_leave: 1 },
    { name: "Aisha Khan", email: "aisha@knoxconsulting.com", role: "Consultant", skills: JSON.stringify(["Tax Preparation", "VAT", "Corporate Tax"]), avatar: "AK" },
    { name: "David Chen", email: "david@knoxconsulting.com", role: "Junior Consultant", skills: JSON.stringify(["Bookkeeping", "Data Entry", "QuickBooks"]), avatar: "DC" },
    { name: "Maria Lopez", email: "maria@knoxconsulting.com", role: "Senior Consultant", skills: JSON.stringify(["M&A Advisory", "Due Diligence", "Valuation"]), avatar: "ML" },
    { name: "James Wilson", email: "james@knoxconsulting.com", role: "Manager", skills: JSON.stringify(["Team Management", "Client Relations", "Strategy"]), avatar: "JW" },
  ];

  for (const u of users) {
    p("INSERT INTO users (name, email, role, skills, avatar, on_leave) VALUES (?, ?, ?, ?, ?, ?)")
      .run(u.name, u.email, u.role, u.skills, u.avatar, u.on_leave || 0);
  }

  // --- Emails ---
  const now = "2026-10-27";
  const emails = [
    {
      thread_id: "T-1001", client_name: "Acme Corp", client_email: "finance@acmecorp.com",
      subject: "Urgent: P&L Report Discrepancy for Q3 2026",
      body: "Hi Knox Consulting,\n\nWe've noticed a significant discrepancy in our Q3 2026 P&L report — the operating expenses line seems overstated by approximately $45,000 compared to our internal records. We need this reconciled urgently before our board meeting on Friday.\n\nCan you please review and provide a corrected P&L with an explanation?\n\nBest regards,\nSarah Chen\nCFO, Acme Corp",
      category: "Financial Reporting",
      received_at: `${now} 08:15:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1002", client_name: "Baker LLC", client_email: "admin@bakerllc.com",
      subject: "Payroll Tax Filing — Q3 Deadline Approaching",
      body: "Team,\n\nJust a reminder that Q3 payroll tax filings are due next week. We have 42 employees across 3 states and need the returns prepared and filed. Please confirm you have everything you need from our side.\n\nThanks,\nTom Baker",
      category: "Payroll",
      received_at: `${now} 09:30:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1003", client_name: "Delta Industries", client_email: "ar@deltaind.com",
      subject: "VAT Registration Support Needed",
      body: "Hello,\n\nWe're expanding into two new EU markets and need VAT registration support for Germany and France. Our projected revenue threshold will be crossed in Q1 2027. Can you advise on the process and timeline?\n\nRegards,\nKlaus Weber",
      category: "VAT",
      received_at: `${now} 10:00:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1004", client_name: "Gamma Holdings", client_email: "ap@gammaholdings.com",
      subject: "Invoice Reconciliation — Monthly Close",
      body: "Hi team,\n\nThe attached invoices for October need reconciliation against our GL. Total value is $127,500 across 15 vendor invoices. Please confirm these are ready for month-end close.\n\nThanks,\nRachel Green",
      category: "Bookkeeping",
      received_at: `${now} 07:45:00`,
      has_reply: 1, reply_type: "substantive",
      reply_draft: "Dear Rachel,\n\nI've reviewed all 15 vendor invoices against your GL and can confirm they reconcile fully. All entries have been posted and the month-end close is ready to proceed. I've sent the reconciliation workbook separately for your records.\n\nPlease let me know if you need anything else.\n\nBest,\nDavid Chen"
    },
    {
      thread_id: "T-1005", client_name: "Epsilon Tech", client_email: "ceo@epsilontech.io",
      subject: "Due Diligence for Series B — Urgent Timeline",
      body: "Knox Team,\n\nWe just received a term sheet and the investor wants due diligence completed in 3 weeks. We need financial modeling, cap table review, and 3-year projections. Revenue is ~$8M ARR with 40% YoY growth.\n\nCan you take this on?\n\nUrgently,\nAlex Rivera\nCEO, Epsilon Tech",
      category: "M&A Advisory",
      received_at: `${now} 08:00:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1006", client_name: "Zeta Partners", client_email: "ops@zetapartners.com",
      subject: "QuickBooks Migration — Data Export Issues",
      body: "Support,\n\nWe're migrating from QuickBooks Desktop to Online and the data export keeps failing at 78%. We have about 5 years of transaction history. Can someone help troubleshoot?\n\n-Jennifer",
      category: "Bookkeeping",
      received_at: `${now} 11:20:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1007", client_name: "Omega Retail", client_email: "tax@omegaretail.com",
      subject: "Corporate Tax Return — Extension Request",
      body: "Hi,\n\nWe need to file an extension for our 2025 corporate tax return. Our internal books are delayed due to a system migration. Can you prepare and file the extension form?\n\nThanks,\nMark Liu",
      category: "Corporate Tax",
      received_at: `${now} 13:15:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
    {
      thread_id: "T-1008", client_name: "Sigma Construction", client_email: "hr@sigmaconstruct.com",
      subject: "Employee Benefits Compliance Audit",
      body: "Knox Consulting,\n\nWe're preparing for a DOL audit and need our benefits compliance reviewed. We have union and non-union employees across 5 states. Can you scope this and provide a timeline?\n\nRegards,\nPat O'Brien\nHR Director",
      category: "Compliance",
      received_at: `${now} 14:00:00`,
      has_reply: 0, reply_type: "none", reply_draft: ""
    },
  ];

  for (const e of emails) {
    p("INSERT INTO emails (thread_id, client_name, client_email, subject, body, category, received_at, has_reply, reply_type, reply_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(e.thread_id, e.client_name, e.client_email, e.subject, e.body, e.category, e.received_at, e.has_reply, e.reply_type, e.reply_draft);
  }

  // --- Tasks ---
  const tasks = [
    { title: "Reconcile Acme Corp P&L Q3 2026", description: "Investigate $45K discrepancy in operating expenses", email_id: 1, assignee_id: 1, priority: "High", status: "In Progress", due_date: "2026-10-30" },
    { title: "File Q3 payroll taxes for Baker LLC", description: "42 employees, 3 states", email_id: 2, assignee_id: 2, priority: "High", status: "New", due_date: "2026-10-25" },
    { title: "VAT registration DE & FR for Delta Industries", description: "Germany and France EU VAT registration", email_id: 3, assignee_id: 3, priority: "Medium", status: "New", due_date: "2026-11-15" },
    { title: "Gamma Holdings invoice reconciliation", description: "15 vendor invoices, $127,500 total", email_id: 4, assignee_id: 4, priority: "Medium", status: "Resolved", due_date: "2026-10-22" },
    { title: "Epsilon Tech Series B due diligence", description: "Financial modeling, cap table, 3-year projections", email_id: 5, assignee_id: 5, priority: "High", status: "New", due_date: "2026-11-18" },
    { title: "QuickBooks migration troubleshooting for Zeta", description: "Data export failing at 78%, 5 years history", email_id: 6, assignee_id: 4, priority: "Medium", status: "Waiting for Client", due_date: "2026-10-26" },
    { title: "File corporate tax extension for Omega Retail", description: "Form 7004 extension for 2025 return", email_id: 7, assignee_id: 3, priority: "Low", status: "New", due_date: "2026-10-23" },
    { title: "Sigma Construction benefits compliance audit", description: "DOL audit prep, union/non-union, 5 states", email_id: 8, assignee_id: 2, priority: "Medium", status: "New", due_date: "2026-10-24" },
    // Overdue tasks
    { title: "Finalize Alpha Co audit report", description: "Year-end audit for Alpha Co", email_id: null, assignee_id: 1, priority: "High", status: "In Progress", due_date: "2026-10-15" },
    { title: "Submit Beta Inc VAT return", description: "Q3 VAT return filing", email_id: null, assignee_id: 3, priority: "High", status: "In Progress", due_date: "2026-10-18" },
    { title: "Review charity accounts for Gamma", description: "Annual charity account review", email_id: null, assignee_id: 4, priority: "Medium", status: "Waiting Internally", due_date: "2026-10-14" },
    { title: "Prepare monthly P&L for Delta Retail", description: "October P&L preparation", email_id: null, assignee_id: 1, priority: "Medium", status: "In Progress", due_date: "2026-10-19" },
    { title: "Client onboarding for Epsilon NewCo", description: "Setup chart of accounts, processes", email_id: null, assignee_id: 2, priority: "Low", status: "New", due_date: "2026-10-20" },
    { title: "Tax planning session for Zeta Founders", description: "Q4 tax planning advisory", email_id: null, assignee_id: 3, priority: "Medium", status: "Waiting for Client", due_date: "2026-10-17" },
    { title: "Process payroll adjustments for Omega", description: "Mid-cycle payroll corrections", email_id: null, assignee_id: 2, priority: "High", status: "In Progress", due_date: "2026-10-16" },
    { title: "Reconcile intercompany transfers Sigma", description: "Cross-entity transfer reconciliation", email_id: null, assignee_id: 5, priority: "Low", status: "New", due_date: "2026-10-21" },
    { title: "Update fixed asset register Alpha", description: "Annual fixed asset update", email_id: null, assignee_id: 4, priority: "Medium", status: "In Progress", due_date: "2026-10-13" },
    { title: "Prepare cash flow forecast Beta", description: "12-month rolling forecast", email_id: null, assignee_id: 5, priority: "High", status: "Waiting Internally", due_date: "2026-10-12" },
  ];

  for (const t of tasks) {
    p("INSERT INTO tasks (title, description, email_id, assignee_id, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(t.title, t.description, t.email_id, t.assignee_id, t.priority, t.status, t.due_date);
  }

  // --- Resolutions ---
  const resolutions = [
    { issue: "P&L Report Discrepancy — Operating Expenses Overstated", category: "Financial Reporting", solution: "Performed detailed GL reconciliation: identified duplicate vendor payment entries totaling $45,200 posted to operating expenses. Reversed entries and reissued corrected P&L. Root cause: AP clerk entered batch twice. Recommended additional review step before posting batches.", tags: JSON.stringify(["P&L", "reconciliation", "operating-expenses"]) },
    { issue: "Payroll Tax Filing — Multi-State Q3 Returns", category: "Payroll", solution: "Prepared and filed 941 forms for all 3 states. Consolidated employee data per state, verified wage bases against state thresholds, and filed electronically. Confirmation numbers provided to client within 48 hours.", tags: JSON.stringify(["payroll", "tax-filing", "multi-state"]) },
    { issue: "VAT Registration — EU Market Entry", category: "VAT", solution: "Initiated VAT registration in Germany (BZSt) and France (SIE). Prepared required documentation including certificate of incorporation, proof of trade, and projected revenue statements. Typical timeline: 4-6 weeks for DE, 3-5 weeks for FR. Advised on fiscal representation requirements.", tags: JSON.stringify(["VAT", "EU", "registration"]) },
    { issue: "Due Diligence — Series B Fundraise", category: "M&A Advisory", solution: "Conducted full financial due diligence over 18-day timeline: reviewed 3 years of financials, built 3-year projection model (base/bull/bear cases), analyzed cap table and dilution scenarios, flagged $120K in unrecorded liabilities. Delivered red-flag report and financial model to client.", tags: JSON.stringify(["due-diligence", "fundraising", "modeling"]) },
    { issue: "QuickBooks Migration — Data Export Failure", category: "Bookkeeping", solution: "Identified that corrupted transaction records from 2019 were causing export failure. Exported data in batches by year, isolated 12 corrupt entries, manually corrected and reimported. Full migration completed in 3 hours with zero data loss.", tags: JSON.stringify(["QuickBooks", "migration", "data-recovery"]) },
    { issue: "Benefits Compliance Audit Prep", category: "Compliance", solution: "Reviewed benefits administration across all 5 states. Identified 3 compliance gaps: missing COBRA notices, outdated SPD documents, and inconsistent eligibility tracking. Remediated all gaps and prepared audit-ready documentation package.", tags: JSON.stringify(["compliance", "DOL", "audit"]) },
  ];

  for (const r of resolutions) {
    p("INSERT INTO resolutions (issue, category, solution, tags) VALUES (?, ?, ?, ?)")
      .run(r.issue, r.category, r.solution, r.tags);
  }
}