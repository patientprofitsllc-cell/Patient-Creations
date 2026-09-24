import type { CommandGroup } from "@/components/universe/UniverseConsole";

// What the owner can ask MASTER, grouped for the dashboard. Each hint says what the command does in plain words.
export const GROUPS: CommandGroup[] = [
  {
    title: "Ask",
    items: [{ name: "ASK_MASTER", label: "Ask MASTER anything", hint: "MASTER decides which agents your question needs and wakes only those.", text: "required" }],
  },
  {
    title: "Audit",
    items: [
      { name: "AUDIT_BUSINESS", label: "Audit the whole business", hint: "The full chain: every agent. Ranks the areas most worth investigating.", text: "none" },
      { name: "AUDIT_WEBSITE", label: "Audit the website", hint: "Opens the public pages and reports what is visible, how it may feel, and what is missing.", text: "none" },
      { name: "AUDIT_PRODUCTS", label: "Audit the products", hint: "Clarity, pricing shown, presentation, and next-step opportunities. Never changes a price.", text: "none" },
      { name: "AUDIT_CUSTOMER_JOURNEY", label: "Audit the customer journey", hint: "Awareness through repeat purchase, with the friction at each stage.", text: "none" },
    ],
  },
  {
    title: "Analyze and plan",
    items: [
      { name: "ANALYZE_GROWTH", label: "Analyze growth", hint: "Acquisition, conversion, order value, retention, referral, operations.", text: "none" },
      { name: "ANALYZE_CUSTOMERS", label: "Analyze customers", hint: "What orders, plans, and experience show about customers.", text: "none" },
      { name: "ANALYZE_CONVERSION", label: "Analyze conversion", hint: "Where visitors and leads stop.", text: "none" },
      { name: "GENERATE_STRATEGY", label: "Generate strategy options", hint: "Options with reasons, risks, and what each may set off.", text: "none" },
      { name: "RUN_RESEARCH", label: "Research brief", hint: "What is known from connected data, and what needs outside research (none is done for you).", text: "none" },
      { name: "RUN_DAILY_AUDIT", label: "Daily audit: what needs attention?", hint: "A light run: read the facts, sort them, check them.", text: "none" },
      { name: "RUN_WEEKLY_REVIEW", label: "Weekly review", hint: "The constraint, the month against the goal, and how customers are doing.", text: "none" },
    ],
  },
  {
    title: "Tasks and records",
    items: [
      { name: "CREATE_TASKS", label: "Add tasks", hint: "One task per line. Start a line with P0 to P4 to set its priority.", text: "required" },
      { name: "SHOW_ACTIVE_TASKS", label: "Show the task board", hint: "Everything by status.", text: "none" },
      { name: "SHOW_DECISIONS", label: "Show decisions", hint: "What MASTER decided, and when.", text: "none" },
      { name: "SHOW_MEMORY", label: "Show memory", hint: "Facts, decisions, assumptions, experiments, and results, kept apart.", text: "none" },
      { name: "SHOW_AGENT_ACTIVITY", label: "Show agent activity", hint: "The audit trail.", text: "none" },
    ],
  },
  {
    title: "System",
    items: [{ name: "RUN_SYSTEM_CHECK", label: "Run a system check", hint: "Checks the agents, storage, permissions, and whether every data source can be read.", text: "none" }],
  },
];
